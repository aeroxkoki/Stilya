#!/usr/bin/env node
/**
 * external_productsテーブルを作成するスクリプト
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

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

async function createTable() {
  console.log('=== external_productsテーブルの作成 ===');
  
  try {
    // マイグレーションファイルを読み込む
    const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', '003_create_external_products_table.sql');
    const sqlContent = fs.readFileSync(migrationPath, 'utf8');
    
    console.log('SQLマイグレーションを実行します...');
    console.log('SQLファイル:', migrationPath);
    
    // SQLを実行
    const { data, error } = await supabase
      .rpc('exec_sql', {
        sql: sqlContent
      });

    if (error) {
      // RPC関数が存在しない場合、別の方法を試す
      console.log('RPC関数が利用できません。別の方法を試します...');
      
      // 各SQLステートメントを個別に実行
      const statements = sqlContent
        .split(';')
        .map(s => s.trim())
        .filter(s => s.length > 0);
      
      for (const statement of statements) {
        if (statement.toLowerCase().includes('create table')) {
          console.log('\nテーブル作成ステートメントを検出しました');
          console.log('注意: Supabase ダッシュボードでSQLを手動で実行する必要があります');
          console.log('\n以下のSQLをSupabase SQL Editorで実行してください:');
          console.log('----------------------------------------');
          console.log(sqlContent);
          console.log('----------------------------------------');
          console.log('\nSupabase SQL Editor URL:');
          console.log(`https://supabase.com/dashboard/project/${supabaseUrl.split('.')[0].split('//')[1]}/sql/new`);
          break;
        }
      }
    } else {
      console.log('✅ SQLマイグレーションが正常に実行されました');
    }
    
    // テーブルの存在確認
    console.log('\nテーブルの存在を確認します...');
    const { count, error: checkError } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true });
      
    if (!checkError) {
      console.log('✅ external_productsテーブルが正常に作成されました');
      console.log('現在の行数:', count || 0);
    } else {
      console.log('❌ テーブルの確認でエラーが発生しました:', checkError.message);
    }
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

createTable().then(() => {
  console.log('\n処理完了');
  process.exit(0);
}).catch((error) => {
  console.error('エラーが発生しました:', error);
  process.exit(1);
});
