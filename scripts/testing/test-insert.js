#!/usr/bin/env node
/**
 * external_productsテーブルへの単純な挿入テスト
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Supabaseクライアントの作成
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('環境変数が設定されていません: SUPABASE_URL, SUPABASE_SERVICE_KEY');
  process.exit(1);
}

console.log('Supabase URL:', supabaseUrl);
console.log('Using service key:', supabaseKey.startsWith('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkeXBncGxqcHJsanFyYmxwdWxpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSI') ? 'Yes' : 'No');

const supabase = createClient(supabaseUrl, supabaseKey);

async function testInsert() {
  console.log('=== external_productsテーブルへの挿入テスト ===');
  
  // テスト用データ
  const testProduct = {
    id: 'test-product-' + Date.now(),
    title: 'テスト商品',
    price: 1000,
    brand: 'テストブランド',
    image_url: 'https://example.com/test.jpg',
    description: 'これはテスト商品です',
    tags: ['テスト'],
    category: 'テストカテゴリ',
    genre_id: 100001,
    affiliate_url: 'https://example.com/affiliate',
    source: 'rakuten',
    is_active: true,
    last_synced: new Date().toISOString()
  };

  console.log('挿入するデータ:');
  console.log(JSON.stringify(testProduct, null, 2));

  try {
    // 挿入実行
    const { data, error } = await supabase
      .from('external_products')
      .insert([testProduct])
      .select();

    if (error) {
      console.error('エラーが発生しました:');
      console.error('  Code:', error.code);
      console.error('  Message:', error.message);
      console.error('  Details:', error.details);
      console.error('  Hint:', error.hint);
      console.error('  Full error:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ 挿入成功！');
      console.log('返されたデータ:', data);
      
      // 挿入後の確認
      const { data: checkData, error: checkError } = await supabase
        .from('external_products')
        .select('*')
        .eq('id', testProduct.id);
        
      if (!checkError && checkData && checkData.length > 0) {
        console.log('✅ データベースで確認できました');
      } else {
        console.log('❌ データベースで確認できませんでした');
      }
    }
  } catch (error) {
    console.error('予期しないエラー:', error);
  }
}

testInsert().then(() => {
  console.log('\nテスト完了');
  process.exit(0);
}).catch((error) => {
  console.error('エラーが発生しました:', error);
  process.exit(1);
});
