#!/usr/bin/env node

/**
 * swipesテーブルの構造を確認するスクリプト
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSwipesTable() {
  console.log('=== swipesテーブルの構造確認 ===\n');
  
  try {
    // テーブルの存在確認
    const { data: tables, error: tableError } = await supabase
      .from('swipes')
      .select('*')
      .limit(0);
    
    if (tableError) {
      console.error('❌ swipesテーブルへのアクセスエラー:', tableError.message);
      
      // テーブルが存在しない場合の詳細エラー
      if (tableError.message.includes('relation') && tableError.message.includes('does not exist')) {
        console.log('\n⚠️ swipesテーブルが存在しません');
        console.log('マイグレーションが適用されていない可能性があります');
        return;
      }
    } else {
      console.log('✅ swipesテーブルが存在します');
    }
    
    // サンプルデータでinsertをテスト（実際には保存しない）
    console.log('\n--- データ型のテスト ---');
    
    // 1. 正しいUUID形式でテスト
    const testUserId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479'; // 有効なUUID
    const testProductId = 'test-product-123'; // TEXT型
    
    console.log(`\nテスト1: 有効なUUID形式のuser_id`);
    console.log(`user_id: ${testUserId}`);
    console.log(`product_id: ${testProductId}`);
    
    // 実際のスワイプデータを確認
    const { data: swipes, error: swipeError } = await supabase
      .from('swipes')
      .select('*')
      .limit(5);
    
    if (!swipeError && swipes) {
      console.log(`\n現在のスワイプデータ数: ${swipes.length}件`);
      if (swipes.length > 0) {
        console.log('\nサンプルデータ:');
        swipes.forEach((swipe, index) => {
          console.log(`${index + 1}. user_id: ${swipe.user_id}, product_id: ${swipe.product_id}, result: ${swipe.result}`);
        });
      }
    }
    
    // external_productsから商品IDの形式を確認
    const { data: products, error: productError } = await supabase
      .from('external_products')
      .select('id, title')
      .limit(3);
    
    if (!productError && products) {
      console.log('\n--- external_productsの商品ID形式 ---');
      products.forEach((product, index) => {
        console.log(`${index + 1}. id: ${product.id} (${typeof product.id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

// 実際の商品を使ってスワイプを保存するテスト
async function testSwipeInsert() {
  console.log('\n\n=== スワイプ保存テスト ===\n');
  
  try {
    // テストユーザーのIDを取得
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
      email: 'test@stilya.com',
      password: 'test123456'
    });
    
    if (authError || !user) {
      console.error('❌ テストユーザーでのログインに失敗:', authError?.message);
      return;
    }
    
    console.log('✅ テストユーザーでログイン成功');
    console.log(`ユーザーID: ${user.id}`);
    
    // 実際の商品を取得
    const { data: products, error: productError } = await supabase
      .from('external_products')
      .select('id, title')
      .limit(1);
    
    if (productError || !products || products.length === 0) {
      console.error('❌ 商品の取得に失敗');
      return;
    }
    
    const testProduct = products[0];
    console.log(`\nテスト商品: ${testProduct.title}`);
    console.log(`商品ID: ${testProduct.id}`);
    
    // スワイプを保存
    const { error: swipeError } = await supabase
      .from('swipes')
      .insert([{
        user_id: user.id,
        product_id: testProduct.id,
        result: 'yes'
      }]);
    
    if (swipeError) {
      console.error('\n❌ スワイプの保存に失敗:', swipeError);
      console.error('エラーコード:', swipeError.code);
      console.error('エラー詳細:', swipeError.details);
      console.error('ヒント:', swipeError.hint);
    } else {
      console.log('\n✅ スワイプの保存に成功！');
      console.log('UUID型エラーは解決されています。');
    }
    
    // ログアウト
    await supabase.auth.signOut();
    
  } catch (error) {
    console.error('❌ 予期しないエラー:', error);
  }
}

// メイン処理
async function main() {
  await checkSwipesTable();
  await testSwipeInsert();
  
  console.log('\n\n--- 分析結果 ---');
  console.log('1. swipesテーブルのproduct_idカラムの型を確認してください');
  console.log('2. もしUUID型の場合は、TEXT型への変更が必要です');
  console.log('3. migration 004が正しく適用されているか確認してください');
}

main().then(() => {
  console.log('\n確認完了');
  process.exit(0);
}).catch(error => {
  console.error('エラー:', error);
  process.exit(1);
});
