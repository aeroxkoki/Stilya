#!/usr/bin/env node
/**
 * 既存のexternal_productsテーブルへの接続テスト
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

async function testExistingTables() {
  console.log('=== Supabase接続テスト ===');
  
  try {
    // 1. external_productsテーブルの存在確認
    console.log('\n1. external_productsテーブルの確認:');
    const { data: productsData, error: productsError, count: productsCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true });
    
    if (productsError) {
      console.error('external_productsテーブルエラー:', productsError);
    } else {
      console.log('✅ external_productsテーブル: OK, 件数:', productsCount);
    }

    // 2. usersテーブルの存在確認
    console.log('\n2. usersテーブルの確認:');
    const { data: usersData, error: usersError, count: usersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true });
    
    if (usersError) {
      console.error('usersテーブルエラー:', usersError);
    } else {
      console.log('✅ usersテーブル: OK, 件数:', usersCount);
    }

    // 3. external_productsテーブルの再確認（別の方法）
    console.log('\n3. external_productsテーブルの再確認:');
    try {
      const result = await supabase
        .from('external_products')
        .select('*')
        .limit(1);
      
      console.log('Result keys:', Object.keys(result));
      console.log('Result data:', result.data);
      console.log('Result error:', result.error);
      console.log('Result status:', result.status);
      console.log('Result statusText:', result.statusText);
      
      if (result.error) {
        console.error('external_productsテーブルエラー詳細:', result.error);
      } else {
        console.log('✅ external_productsテーブル: データ取得成功');
      }
    } catch (e) {
      console.error('Catch error:', e);
    }

    // 4. RPC関数でテーブル一覧を取得（もし可能なら）
    console.log('\n4. データベース情報の取得を試行:');
    const { data: schemaData, error: schemaError } = await supabase
      .rpc('get_table_names');
    
    if (schemaError) {
      console.log('スキーマ情報取得エラー（RPC関数がない可能性）:', schemaError.message);
    } else {
      console.log('テーブル一覧:', schemaData);
    }

  } catch (error) {
    console.error('予期しないエラー:', error);
  }
}

testExistingTables().then(() => {
  console.log('\nテスト完了');
  process.exit(0);
}).catch((error) => {
  console.error('エラーが発生しました:', error);
  process.exit(1);
});
