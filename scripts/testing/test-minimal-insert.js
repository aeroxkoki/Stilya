#!/usr/bin/env node
/**
 * 最小限のデータでexternal_productsテーブルへの挿入をテスト
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, '..', '.env') });

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

async function testMinimalInsert() {
  console.log('=== 最小限データでの挿入テスト ===');
  
  // 1. 最小限の必須フィールドのみ
  const minimalProduct = {
    id: 'minimal-test-' + Date.now(),
    title: 'テスト商品',
    price: 1000
  };

  console.log('\n1. 最小限データでの挿入:');
  console.log(JSON.stringify(minimalProduct, null, 2));

  let { data, error } = await supabase
    .from('external_products')
    .insert([minimalProduct])
    .select();

  if (error) {
    console.error('最小限データでエラー:', error);
  } else {
    console.log('✅ 最小限データで成功:', data);
  }

  // 2. タグなしの完全データ
  const productWithoutTags = {
    id: 'no-tags-test-' + Date.now(),
    title: 'タグなしテスト商品',
    price: 2000,
    brand: 'テストブランド',
    image_url: 'https://example.com/test.jpg',
    description: 'タグなしのテスト商品',
    category: 'テストカテゴリ',
    genre_id: 100001,
    affiliate_url: 'https://example.com/affiliate',
    source: 'rakuten',
    is_active: true
  };

  console.log('\n2. タグなしデータでの挿入:');
  console.log(JSON.stringify(productWithoutTags, null, 2));

  ({ data, error } = await supabase
    .from('external_products')
    .insert([productWithoutTags])
    .select());

  if (error) {
    console.error('タグなしデータでエラー:', error);
  } else {
    console.log('✅ タグなしデータで成功:', data);
  }

  // 3. タグを正しい配列形式で
  const productWithTags = {
    id: 'with-tags-test-' + Date.now(),
    title: 'タグありテスト商品',
    price: 3000,
    brand: 'テストブランド',
    image_url: 'https://example.com/test.jpg',
    description: 'タグありのテスト商品',
    tags: '{"テスト", "サンプル"}',  // PostgreSQL配列の文字列形式
    category: 'テストカテゴリ',
    genre_id: 100001,
    affiliate_url: 'https://example.com/affiliate',
    source: 'rakuten',
    is_active: true
  };

  console.log('\n3. タグあり（文字列形式）での挿入:');
  console.log(JSON.stringify(productWithTags, null, 2));

  ({ data, error } = await supabase
    .from('external_products')
    .insert([productWithTags])
    .select());

  if (error) {
    console.error('タグあり（文字列形式）でエラー:', error);
  } else {
    console.log('✅ タグあり（文字列形式）で成功:', data);
  }

  // 4. タグを配列として
  const productWithArrayTags = {
    id: 'array-tags-test-' + Date.now(),
    title: 'タグ配列テスト商品',
    price: 4000,
    brand: 'テストブランド',
    image_url: 'https://example.com/test.jpg',
    description: 'タグ配列のテスト商品',
    tags: ['テスト', 'サンプル'],  // JavaScript配列
    category: 'テストカテゴリ',
    genre_id: 100001,
    affiliate_url: 'https://example.com/affiliate',
    source: 'rakuten',
    is_active: true
  };

  console.log('\n4. タグあり（配列形式）での挿入:');
  console.log(JSON.stringify(productWithArrayTags, null, 2));

  ({ data, error } = await supabase
    .from('external_products')
    .insert([productWithArrayTags])
    .select());

  if (error) {
    console.error('タグあり（配列形式）でエラー:', error);
  } else {
    console.log('✅ タグあり（配列形式）で成功:', data);
  }

  // 5. 確認
  console.log('\n5. テーブルの件数確認:');
  const { count, error: countError } = await supabase
    .from('external_products')
    .select('*', { count: 'exact', head: true });
    
  if (!countError) {
    console.log('テーブル内の総商品数:', count);
  }
}

testMinimalInsert().then(() => {
  console.log('\nテスト完了');
  process.exit(0);
}).catch((error) => {
  console.error('エラーが発生しました:', error);
  process.exit(1);
});
