#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// テスト用の商品データ
const testProducts = [
  {
    id: 'test-001',
    title: 'テストTシャツ',
    price: 2980,
    brand: 'Test Brand',
    image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab',
    description: 'これはテスト用の商品です',
    tags: ['Tシャツ', 'カジュアル', 'テスト'],
    category: 'トップス',
    genre_id: 100371,
    affiliate_url: 'https://example.com/test-001',
    source: 'test',
    is_active: true,
    last_synced: new Date().toISOString(),
  },
  {
    id: 'test-002',
    title: 'テストジャケット',
    price: 9800,
    brand: 'Test Fashion',
    image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
    description: 'テスト用のジャケットです',
    tags: ['ジャケット', 'アウター', 'テスト'],
    category: 'アウター',
    genre_id: 551177,
    affiliate_url: 'https://example.com/test-002',
    source: 'test',
    is_active: true,
    last_synced: new Date().toISOString(),
  },
];

async function testConnection() {
  console.log('=== Supabase接続テスト ===');
  console.log('URL:', supabaseUrl);
  
  try {
    // テーブルの存在確認
    const { data, error } = await supabase
      .from('external_products')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('テーブルアクセスエラー:', error);
      return false;
    }
    
    console.log('✅ external_productsテーブルにアクセスできました');
    return true;
  } catch (err) {
    console.error('接続エラー:', err);
    return false;
  }
}

async function insertTestProducts() {
  console.log('\n=== テストデータの挿入 ===');
  
  try {
    // 既存のテストデータを削除
    const { error: deleteError } = await supabase
      .from('external_products')
      .delete()
      .eq('source', 'test');
    
    if (deleteError) {
      console.log('既存データ削除エラー（無視可）:', deleteError.message);
    }
    
    // テストデータを挿入
    const { data, error } = await supabase
      .from('external_products')
      .insert(testProducts)
      .select();
    
    if (error) {
      console.error('❌ 挿入エラー:', error);
      console.log('\n考えられる原因:');
      console.log('1. RLSポリシーが有効になっている');
      console.log('2. テーブル構造が異なる');
      console.log('3. 権限が不足している');
      return false;
    }
    
    console.log(`✅ ${data.length}件のテストデータを挿入しました`);
    return true;
  } catch (err) {
    console.error('予期しないエラー:', err);
    return false;
  }
}

async function verifyData() {
  console.log('\n=== データの確認 ===');
  
  try {
    const { data, error, count } = await supabase
      .from('external_products')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .limit(5);
    
    if (error) {
      console.error('❌ データ取得エラー:', error);
      return;
    }
    
    console.log(`✅ アクティブな商品数: ${count}件`);
    
    if (data && data.length > 0) {
      console.log('\nサンプルデータ:');
      data.forEach((product, index) => {
        console.log(`\n${index + 1}. ${product.title}`);
        console.log(`   価格: ¥${product.price}`);
        console.log(`   カテゴリ: ${product.category}`);
        console.log(`   画像: ${product.image_url ? '✓' : '✗'}`);
      });
    }
  } catch (err) {
    console.error('予期しないエラー:', err);
  }
}

async function main() {
  console.log('Stilya - データベーステスト\n');
  
  // 接続テスト
  const connected = await testConnection();
  if (!connected) {
    console.log('\n❌ 接続に失敗しました');
    process.exit(1);
  }
  
  // テストデータの挿入
  const inserted = await insertTestProducts();
  if (!inserted) {
    console.log('\n⚠️  データ挿入に失敗しました');
    console.log('RLSポリシーを確認してください');
  }
  
  // データの確認
  await verifyData();
  
  console.log('\n=== テスト完了 ===');
}

main().catch(console.error);
