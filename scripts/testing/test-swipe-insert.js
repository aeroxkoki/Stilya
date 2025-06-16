#!/usr/bin/env node

/**
 * swipesテーブルへの挿入テスト（簡易版）
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSwipeInsert() {
  console.log('=== スワイプ挿入テスト（型変更後） ===\n');
  
  try {
    // 実際の商品IDを取得
    const { data: products, error: productError } = await supabase
      .from('external_products')
      .select('id, title')
      .limit(1);
    
    if (productError || !products || products.length === 0) {
      console.error('❌ 商品の取得に失敗:', productError);
      return;
    }
    
    const testProduct = products[0];
    console.log('テスト商品:');
    console.log(`- タイトル: ${testProduct.title}`);
    console.log(`- ID: ${testProduct.id}`);
    console.log(`- ID型: ${typeof testProduct.id}`);
    
    // ダミーのユーザーIDを使用（有効なUUID形式）
    const testUserId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    
    console.log('\n挿入テスト:');
    console.log(`- user_id: ${testUserId} (UUID)`);
    console.log(`- product_id: ${testProduct.id} (TEXT)`);
    console.log(`- result: yes`);
    
    // スワイプを挿入（RLSを回避するため直接的なテスト）
    const { data: insertData, error: insertError } = await supabase
      .from('swipes')
      .insert([{
        user_id: testUserId,
        product_id: testProduct.id,
        result: 'yes'
      }])
      .select();
    
    if (insertError) {
      console.error('\n❌ 挿入エラー:', insertError);
      console.error('エラーコード:', insertError.code);
      console.error('エラーメッセージ:', insertError.message);
      console.error('詳細:', insertError.details);
      console.error('ヒント:', insertError.hint);
      
      if (insertError.code === '22P02') {
        console.log('\n⚠️ まだUUID型エラーが発生しています！');
        console.log('product_idカラムの型変更が適用されていない可能性があります。');
      } else if (insertError.code === '23503') {
        console.log('\n⚠️ 外部キー制約エラー（正常な動作）');
        console.log('ユーザーIDが存在しないため挿入できません。');
      } else if (insertError.code === '42501') {
        console.log('\n⚠️ RLSポリシーエラー（正常な動作）');
        console.log('認証なしでは挿入できません。');
      }
    } else {
      console.log('\n✅ 挿入成功！');
      console.log('product_idカラムがTEXT型に正しく変更されています。');
      
      if (insertData && insertData.length > 0) {
        console.log('\n挿入されたデータ:');
        console.log(insertData[0]);
        
        // テストデータを削除
        const { error: deleteError } = await supabase
          .from('swipes')
          .delete()
          .eq('id', insertData[0].id);
        
        if (!deleteError) {
          console.log('\nテストデータを削除しました。');
        }
      }
    }
    
    // 型の確認（メタデータから）
    console.log('\n\n=== 結論 ===');
    if (insertError && insertError.code === '22P02') {
      console.log('❌ product_idカラムはまだUUID型です。');
      console.log('SQLの実行が正しく完了していない可能性があります。');
      console.log('\n再度以下を確認してください：');
      console.log('1. Supabaseダッシュボード > SQL Editor');
      console.log('2. 以下のSQLを実行:');
      console.log(`
ALTER TABLE swipes 
DROP CONSTRAINT IF EXISTS swipes_product_id_fkey;

ALTER TABLE swipes 
ALTER COLUMN product_id TYPE TEXT;

ALTER TABLE swipes 
ADD CONSTRAINT swipes_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES external_products(id) 
ON DELETE CASCADE;
      `);
    } else if (insertError && (insertError.code === '23503' || insertError.code === '42501')) {
      console.log('✅ product_idカラムはTEXT型に変更されています！');
      console.log('エラーは外部キー制約またはRLSポリシーによるものです。');
      console.log('UUID型エラーは解決されました。');
    } else if (!insertError) {
      console.log('✅ 完全に成功！');
      console.log('product_idカラムはTEXT型で、スワイプ機能は正常に動作します。');
    }
    
  } catch (error) {
    console.error('❌ 予期しないエラー:', error);
  }
}

// 実行
testSwipeInsert().then(() => {
  console.log('\nテスト完了');
  process.exit(0);
}).catch(error => {
  console.error('エラー:', error);
  process.exit(1);
});
