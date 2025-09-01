#!/usr/bin/env node
/**
 * データベーススキーマ更新スクリプト
 * MVP開発に必要なカラムを追加します
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Supabaseクライアントの作成
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ 必要な環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// カラム追加のSQL
const addColumnsSQL = `
-- MVP戦略対応用カラムの追加
ALTER TABLE external_products 
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 999,
ADD COLUMN IF NOT EXISTS source_brand VARCHAR(255),
ADD COLUMN IF NOT EXISTS shop_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_average NUMERIC(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS item_update_timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_seasonal BOOLEAN DEFAULT false;

-- インデックスの作成
CREATE INDEX IF NOT EXISTS idx_external_products_priority ON external_products(priority);
CREATE INDEX IF NOT EXISTS idx_external_products_is_seasonal ON external_products(is_seasonal);
CREATE INDEX IF NOT EXISTS idx_external_products_last_synced ON external_products(last_synced);
CREATE INDEX IF NOT EXISTS idx_external_products_source_brand ON external_products(source_brand);
`;

/**
 * カラムの存在を確認
 */
async function checkColumns() {
  try {
    console.log('📋 現在のテーブル構造を確認中...');
    
    // テスト的に1件取得してカラムを確認
    const { data, error } = await supabase
      .from('external_products')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ テーブル確認エラー:', error.message);
      if (error.code === '42P01') {
        console.log('⚠️  external_productsテーブルが存在しません');
        console.log('👉 Supabaseダッシュボードでテーブルを作成してください');
      }
      return false;
    }
    
    if (data && data.length > 0) {
      const columns = Object.keys(data[0]);
      console.log('✅ 現在のカラム:', columns.join(', '));
      
      const requiredColumns = ['priority', 'source_brand', 'shop_name', 'review_count', 'review_average', 'item_update_timestamp', 'is_seasonal'];
      const missingColumns = requiredColumns.filter(col => !columns.includes(col));
      
      if (missingColumns.length > 0) {
        console.log('⚠️  不足しているカラム:', missingColumns.join(', '));
        return missingColumns;
      } else {
        console.log('✅ すべての必要なカラムが存在します');
        return [];
      }
    } else {
      console.log('⚠️  テーブルは存在しますが、データがありません');
      return null;
    }
    
  } catch (error) {
    console.error('❌ 予期しないエラー:', error);
    return false;
  }
}

/**
 * カラムを追加するためのSQL文を表示
 */
function showAddColumnsInstructions(missingColumns) {
  console.log('\n========================================');
  console.log('📝 以下のSQLをSupabaseダッシュボードで実行してください:');
  console.log('URL: https://supabase.com/dashboard/project/ddypgpljprljqrblpuli/sql/new');
  console.log('========================================\n');
  
  const sqlStatements = [];
  
  if (missingColumns.includes('priority')) {
    sqlStatements.push('ALTER TABLE external_products ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 999;');
  }
  if (missingColumns.includes('source_brand')) {
    sqlStatements.push('ALTER TABLE external_products ADD COLUMN IF NOT EXISTS source_brand VARCHAR(255);');
  }
  if (missingColumns.includes('shop_name')) {
    sqlStatements.push('ALTER TABLE external_products ADD COLUMN IF NOT EXISTS shop_name VARCHAR(255);');
  }
  if (missingColumns.includes('review_count')) {
    sqlStatements.push('ALTER TABLE external_products ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;');
  }
  if (missingColumns.includes('review_average')) {
    sqlStatements.push('ALTER TABLE external_products ADD COLUMN IF NOT EXISTS review_average NUMERIC(3,2) DEFAULT 0;');
  }
  if (missingColumns.includes('item_update_timestamp')) {
    sqlStatements.push('ALTER TABLE external_products ADD COLUMN IF NOT EXISTS item_update_timestamp TIMESTAMP WITH TIME ZONE;');
  }
  if (missingColumns.includes('is_seasonal')) {
    sqlStatements.push('ALTER TABLE external_products ADD COLUMN IF NOT EXISTS is_seasonal BOOLEAN DEFAULT false;');
  }
  
  console.log(sqlStatements.join('\n'));
  console.log('\n========================================\n');
}

/**
 * メイン処理
 */
async function main() {
  console.log('🚀 データベーススキーマ更新チェックを開始...\n');
  
  const result = await checkColumns();
  
  if (result === false) {
    console.log('\n❌ データベースへの接続に失敗しました');
    console.log('👉 .envファイルの設定を確認してください');
    return;
  }
  
  if (result === null) {
    console.log('\n⚠️  テーブルは存在しますが、構造を確認できませんでした');
    console.log('👉 以下のSQLで必要なカラムを追加してください:');
    showAddColumnsInstructions(['priority', 'source_brand', 'shop_name', 'review_count', 'review_average', 'item_update_timestamp', 'is_seasonal']);
    return;
  }
  
  if (Array.isArray(result)) {
    if (result.length === 0) {
      console.log('\n✨ データベーススキーマは最新です！');
      console.log('👉 商品同期を実行できます:');
      console.log('   node scripts/sync/sync-mvp-brands.js');
    } else {
      console.log('\n⚠️  データベーススキーマの更新が必要です');
      showAddColumnsInstructions(result);
      console.log('👉 SQLを実行後、再度このスクリプトを実行してください');
    }
  }
}

// 実行
main().then(() => {
  console.log('\n✅ 処理完了');
  process.exit(0);
}).catch((error) => {
  console.error('\n❌ エラーが発生しました:', error);
  process.exit(1);
});
