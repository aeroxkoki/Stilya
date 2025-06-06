#!/usr/bin/env node
/**
 * データベースにexternal_productsテーブルを作成する
 * SupabaseダッシュボードのSQL Editorで直接実行できないため、
 * 個別のSQLステートメントとして実行を試みる
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

// 簡易版のテーブル作成SQLs (RLSポリシーなし、最小限の構造)
const createTableSQL = `
CREATE TABLE IF NOT EXISTS external_products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  price INTEGER NOT NULL,
  brand TEXT,
  image_url TEXT,
  description TEXT,
  tags TEXT[],
  category TEXT,
  genre_id INTEGER,
  affiliate_url TEXT,
  source TEXT DEFAULT 'rakuten',
  is_active BOOLEAN DEFAULT true,
  last_synced TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
`;

async function createExternalProductsTable() {
  console.log('=== external_products テーブル作成の試行 ===');
  
  console.log('\n重要: このスクリプトではテーブルを作成できない場合があります。');
  console.log('その場合は、以下のいずれかの方法でテーブルを作成してください：');
  console.log('\n方法1: Supabase ダッシュボードで直接実行');
  console.log(`URL: https://supabase.com/dashboard/project/ddypgpljprljqrblpuli/sql/new`);
  console.log('\n以下のSQLをコピーして実行してください：');
  console.log('========================================');
  console.log(createTableSQL);
  console.log('========================================');
  
  console.log('\n方法2: 最小限のテーブルを作成（テスト用）');
  console.log('次のコマンドを実行：');
  console.log('cd /Users/koki_air/Documents/GitHub/Stilya');
  console.log('node scripts/setup-minimal-table.js');
  
  // テーブルの存在確認
  console.log('\n現在のテーブル状態を確認中...');
  const { data, error } = await supabase
    .from('external_products')
    .select('*')
    .limit(1);
    
  if (error && error.code === '42P01') {
    console.log('\n❌ external_productsテーブルが存在しません');
    console.log('上記の方法でテーブルを作成してください。');
  } else if (error) {
    console.log('\n❌ エラー:', error.message);
  } else {
    console.log('\n✅ external_productsテーブルは既に存在します！');
    console.log('商品同期を実行できます: npm run sync-products');
  }
}

createExternalProductsTable().then(() => {
  console.log('\n処理完了');
  process.exit(0);
}).catch((error) => {
  console.error('エラーが発生しました:', error);
  process.exit(1);
});
