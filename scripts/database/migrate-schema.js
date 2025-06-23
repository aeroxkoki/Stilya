#!/usr/bin/env node

/**
 * データベーススキーマ移行スクリプト
 * productsテーブルからexternal_productsテーブルへの完全移行
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function diagnoseDatabase() {
  console.log('🔍 データベースの現在の状態を診断中...\n');

  try {
    // 1. UUID形式の古いスワイプデータを確認
    const { data: uuidSwipes, error: uuidError } = await supabase
      .from('swipes')
      .select('count', { count: 'exact', head: true })
      .filter('product_id', 'like', '________-____-____-____-____________');

    if (uuidError) throw uuidError;
    console.log(`UUID形式の古いスワイプデータ: ${uuidSwipes || 0}件`);

    // 2. external_productsに存在しないスワイプを確認
    const { data: allSwipes } = await supabase
      .from('swipes')
      .select('product_id');

    const { data: validProducts } = await supabase
      .from('external_products')
      .select('id');

    const validProductIds = new Set(validProducts?.map(p => p.id) || []);
    const invalidSwipes = allSwipes?.filter(s => !validProductIds.has(s.product_id)) || [];
    
    console.log(`external_productsに存在しないスワイプ: ${invalidSwipes.length}件`);

    // 3. 各テーブルのレコード数を確認
    const tables = ['swipes', 'favorites', 'click_logs', 'external_products'];
    for (const table of tables) {
      const { count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      console.log(`${table}テーブル: ${count || 0}件`);
    }

    return {
      uuidSwipeCount: uuidSwipes || 0,
      invalidSwipeCount: invalidSwipes.length,
      needsMigration: (uuidSwipes || 0) > 0 || invalidSwipes.length > 0
    };

  } catch (error) {
    console.error('診断エラー:', error);
    return null;
  }
}

async function cleanupDatabase() {
  console.log('\n🧹 データベースのクリーンアップを開始...\n');

  try {
    // 1. UUID形式のスワイプデータを削除
    const { error: deleteUuidError } = await supabase
      .from('swipes')
      .delete()
      .filter('product_id', 'like', '________-____-____-____-____________');

    if (deleteUuidError) throw deleteUuidError;
    console.log('✅ UUID形式のスワイプデータを削除しました');

    // 2. external_productsに存在しないスワイプを削除
    const { data: validProducts } = await supabase
      .from('external_products')
      .select('id');

    const validProductIds = validProducts?.map(p => p.id) || [];

    if (validProductIds.length > 0) {
      const { error: deleteInvalidError } = await supabase
        .from('swipes')
        .delete()
        .not('product_id', 'in', `(${validProductIds.join(',')})`);

      if (deleteInvalidError) throw deleteInvalidError;
      console.log('✅ 無効なスワイプデータを削除しました');
    }

    // 3. favoritesテーブルのクリーンアップ
    const { error: favoritesError } = await supabase
      .from('favorites')
      .delete()
      .filter('product_id', 'like', '________-____-____-____-____________');

    if (favoritesError) console.warn('favoritesテーブルのクリーンアップ警告:', favoritesError);
    else console.log('✅ favoritesテーブルをクリーンアップしました');

    // 4. click_logsテーブルのクリーンアップ
    const { error: clickLogsError } = await supabase
      .from('click_logs')
      .delete()
      .filter('product_id', 'like', '________-____-____-____-____________');

    if (clickLogsError) console.warn('click_logsテーブルのクリーンアップ警告:', clickLogsError);
    else console.log('✅ click_logsテーブルをクリーンアップしました');

    return true;

  } catch (error) {
    console.error('クリーンアップエラー:', error);
    return false;
  }
}

async function main() {
  console.log('🚀 Stilya データベース移行スクリプト\n');

  // 診断実行
  const diagnosis = await diagnoseDatabase();
  
  if (!diagnosis) {
    console.error('❌ 診断に失敗しました');
    process.exit(1);
  }

  if (!diagnosis.needsMigration) {
    console.log('\n✨ データベースは既にクリーンな状態です！');
    process.exit(0);
  }

  // クリーンアップの確認
  console.log('\n⚠️  警告: このスクリプトは以下のデータを削除します:');
  console.log('- UUID形式の古いスワイプデータ');
  console.log('- external_productsに存在しない無効なスワイプデータ');
  console.log('- 関連するfavoritesとclick_logsのデータ\n');

  // プロダクション環境では確認を求める
  if (process.env.NODE_ENV === 'production') {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const answer = await new Promise(resolve => {
      readline.question('続行しますか？ (yes/no): ', resolve);
    });

    readline.close();

    if (answer.toLowerCase() !== 'yes') {
      console.log('❌ 処理をキャンセルしました');
      process.exit(0);
    }
  }

  // クリーンアップ実行
  const success = await cleanupDatabase();

  if (success) {
    console.log('\n✅ データベースの移行が完了しました！');
    
    // 最終確認
    await diagnoseDatabase();
  } else {
    console.error('\n❌ 移行に失敗しました');
    process.exit(1);
  }
}

// スクリプト実行
main().catch(console.error);
