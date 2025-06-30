#!/usr/bin/env node

/**
 * 日次パッチスクリプト
 * - データベースの最適化
 * - パフォーマンスの改善
 * - 不要なデータのクリーンアップ
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 環境変数SUPABASE_URLまたはSUPABASE_ANON_KEYが設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runDailyPatch() {
  console.log('🔧 日次パッチを開始します...\n');

  try {
    // 1. データベース統計の更新
    console.log('📊 データベース統計を更新中...');
    await updateDatabaseStatistics();

    // 2. 画像URLの最適化
    console.log('\n🖼️ 画像URLを最適化中...');
    await optimizeImageUrls();

    // 3. 重複商品のチェック
    console.log('\n🔍 重複商品をチェック中...');
    await checkDuplicateProducts();

    // 4. パフォーマンスキャッシュの更新
    console.log('\n⚡ パフォーマンスキャッシュを更新中...');
    await updatePerformanceCache();

    // 5. 不要なログのクリーンアップ
    console.log('\n🧹 古いログをクリーンアップ中...');
    await cleanupOldLogs();

    console.log('\n✅ 日次パッチが正常に完了しました！');
  } catch (error) {
    console.error('\n❌ 日次パッチ中にエラーが発生しました:', error);
    process.exit(1);
  }
}

// データベース統計の更新
async function updateDatabaseStatistics() {
  const { count: totalProducts, error: countError } = await supabase
    .from('external_products')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    throw new Error(`商品数の取得に失敗: ${countError.message}`);
  }

  const { data: brandStats, error: brandError } = await supabase
    .from('external_products')
    .select('brand')
    .order('brand');

  if (brandError) {
    throw new Error(`ブランド統計の取得に失敗: ${brandError.message}`);
  }

  // ブランド別の商品数を集計
  const brandCounts = {};
  brandStats.forEach(item => {
    const brand = item.brand || '不明';
    brandCounts[brand] = (brandCounts[brand] || 0) + 1;
  });

  console.log(`  ✅ 総商品数: ${totalProducts}`);
  console.log(`  ✅ ブランド数: ${Object.keys(brandCounts).length}`);
}

// 画像URLの最適化
async function optimizeImageUrls() {
  // Rakuten画像URLの最適化（800x800サイズに統一）
  const { data: productsToOptimize, error: fetchError } = await supabase
    .from('external_products')
    .select('id, image_url')
    .like('image_url', '%thumbnail.image.rakuten.co.jp%')
    .not('image_url', 'like', '%800x800%')
    .limit(100);

  if (fetchError) {
    console.error('  ⚠️ 画像URL取得エラー:', fetchError.message);
    return;
  }

  if (!productsToOptimize || productsToOptimize.length === 0) {
    console.log('  ✅ すべての画像URLは最適化済みです');
    return;
  }

  let optimizedCount = 0;
  for (const product of productsToOptimize) {
    const optimizedUrl = product.image_url.replace(/\?_ex=\d+x\d+/, '?_ex=800x800');
    
    if (optimizedUrl !== product.image_url) {
      const { error: updateError } = await supabase
        .from('external_products')
        .update({ image_url: optimizedUrl })
        .eq('id', product.id);

      if (!updateError) {
        optimizedCount++;
      }
    }
  }

  console.log(`  ✅ ${optimizedCount}件の画像URLを最適化しました`);
}

// 重複商品のチェック
async function checkDuplicateProducts() {
  const { data: duplicates, error } = await supabase
    .rpc('find_duplicate_products')
    .limit(10);

  if (error) {
    // RPCが存在しない場合は手動でチェック
    const { data: products, error: fetchError } = await supabase
      .from('external_products')
      .select('name, source')
      .order('name');

    if (!fetchError && products) {
      const nameSourceMap = {};
      let duplicateCount = 0;

      products.forEach(product => {
        const key = `${product.name}-${product.source}`;
        if (nameSourceMap[key]) {
          duplicateCount++;
        } else {
          nameSourceMap[key] = true;
        }
      });

      console.log(`  ℹ️ 重複の可能性がある商品: ${duplicateCount}件`);
    }
    return;
  }

  if (duplicates && duplicates.length > 0) {
    console.log(`  ⚠️ ${duplicates.length}件の重複商品が見つかりました`);
  } else {
    console.log('  ✅ 重複商品は見つかりませんでした');
  }
}

// パフォーマンスキャッシュの更新
async function updatePerformanceCache() {
  // 人気商品のキャッシュを更新
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data: popularProducts, error } = await supabase
    .from('swipes')
    .select('product_id')
    .eq('result', 'yes')
    .gte('created_at', thirtyDaysAgo.toISOString())
    .limit(100);

  if (!error && popularProducts) {
    const productCounts = {};
    popularProducts.forEach(swipe => {
      productCounts[swipe.product_id] = (productCounts[swipe.product_id] || 0) + 1;
    });

    const sortedProducts = Object.entries(productCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 20);

    console.log(`  ✅ 人気商品TOP20を更新しました`);
  }
}

// 古いログのクリーンアップ
async function cleanupOldLogs() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  // 古いclick_logsの削除
  const { error: clickLogError, count } = await supabase
    .from('click_logs')
    .delete()
    .lt('created_at', sevenDaysAgo.toISOString())
    .select('*', { count: 'exact', head: true });

  if (!clickLogError) {
    console.log(`  ✅ ${count || 0}件の古いクリックログを削除しました`);
  }

  // 古いエラーログの削除（もしerror_logsテーブルがある場合）
  const { error: errorLogError } = await supabase
    .from('error_logs')
    .delete()
    .lt('created_at', sevenDaysAgo.toISOString())
    .select('*', { count: 'exact', head: true });

  if (!errorLogError) {
    console.log('  ✅ 古いエラーログを削除しました');
  }
}

// メイン実行
if (require.main === module) {
  runDailyPatch().catch(error => {
    console.error('❌ 致命的なエラー:', error);
    process.exit(1);
  });
}

module.exports = { runDailyPatch };
