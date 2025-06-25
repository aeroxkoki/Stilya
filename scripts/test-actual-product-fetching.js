#!/usr/bin/env node

/**
 * アプリの実際のロジックを使用して商品取得をテスト
 */

// TypeScriptサポートを有効化
require('ts-node/register');
require('dotenv').config();

const { fetchMixedProducts } = require('./src/services/productService');

async function testProductFetching() {
  console.log('🚀 実際のアプリロジックを使用した商品取得テスト\n');
  
  console.log('環境変数:');
  console.log('SUPABASE_URL:', process.env.EXPO_PUBLIC_SUPABASE_URL ? '✅ 設定済み' : '❌ 未設定');
  console.log('SUPABASE_ANON_KEY:', process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? '✅ 設定済み' : '❌ 未設定');
  console.log();
  
  try {
    // テスト1: フィルターなしで商品を取得
    console.log('=== テスト1: 通常の商品取得（フィルターなし） ===');
    const result1 = await fetchMixedProducts(null, 20, 0, {});
    console.log('結果:', result1.success ? `✅ 成功 - ${result1.data.length}件取得` : `❌ 失敗 - ${result1.error}`);
    
    if (result1.success && result1.data.length > 0) {
      console.log('\n取得した商品（最初の5件）:');
      result1.data.slice(0, 5).forEach((product, i) => {
        console.log(`${i + 1}. ${product.title} (${product.brand}) - ¥${product.price}`);
      });
    }
    
    // テスト2: 新品のみの商品を取得
    console.log('\n=== テスト2: 新品のみの商品取得 ===');
    const result2 = await fetchMixedProducts(null, 20, 0, { includeUsed: false });
    console.log('結果:', result2.success ? `✅ 成功 - ${result2.data.length}件取得` : `❌ 失敗 - ${result2.error}`);
    
    // テスト3: オフセットを使用した商品取得
    console.log('\n=== テスト3: オフセット付き商品取得 ===');
    const result3 = await fetchMixedProducts(null, 20, 20, {});
    console.log('結果:', result3.success ? `✅ 成功 - ${result3.data.length}件取得` : `❌ 失敗 - ${result3.error}`);
    
  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error);
  }
  
  console.log('\n✅ テスト完了');
}

// 実行
testProductFetching();
