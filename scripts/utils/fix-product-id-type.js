#!/usr/bin/env node

/**
 * swipesテーブルのproduct_idカラムをTEXT型に修正するスクリプト
 * 
 * 注意：このスクリプトはservice_roleキーが必要です。
 * 開発環境でのみ使用してください。
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  console.error('❌ EXPO_PUBLIC_SUPABASE_URLが設定されていません');
  process.exit(1);
}

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEYが設定されていません');
  console.log('\n以下の手順で設定してください：');
  console.log('1. Supabaseダッシュボードにログイン');
  console.log('2. Project Settings > API');
  console.log('3. service_role keyをコピー');
  console.log('4. .envファイルに追加: SUPABASE_SERVICE_ROLE_KEY=your_key_here');
  process.exit(1);
}

// Service roleクライアントを作成（DDL操作に必要）
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixProductIdType() {
  console.log('=== swipesテーブルのproduct_id型修正 ===\n');
  
  try {
    // 現在の状態を確認
    console.log('1. 現在のテーブル構造を確認中...');
    
    // SQLファイルを読み込む
    const sqlPath = path.join(__dirname, 'fix-swipes-product-id-type.sql');
    const sql = fs.readFileSync(sqlPath, 'utf8');
    
    console.log('2. product_idカラムをTEXT型に変更中...');
    
    // SQLを実行
    const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql });
    
    if (error) {
      // RPC関数が存在しない場合は、直接実行を試みる
      if (error.message.includes('exec_sql')) {
        console.log('⚠️ exec_sql関数が見つかりません。Supabaseダッシュボードから手動で実行してください。');
        console.log('\n以下のSQLを実行してください：');
        console.log('```sql');
        console.log(sql);
        console.log('```');
        return;
      }
      throw error;
    }
    
    console.log('✅ product_idカラムがTEXT型に変更されました！');
    
    // 変更後の確認
    console.log('\n3. 変更後の確認...');
    
    // テスト用のデータを挿入してみる
    const testUserId = 'f47ac10b-58cc-4372-a567-0e02b2c3d479';
    const testProductId = 'test-product-123';
    
    const { error: testError } = await supabase
      .from('swipes')
      .insert([{
        user_id: testUserId,
        product_id: testProductId,
        result: 'yes'
      }]);
    
    if (testError) {
      if (testError.code === '23503') {
        console.log('⚠️ 外部キー制約により、実在しない商品IDは挿入できません（これは正常です）');
      } else {
        console.error('❌ テスト挿入エラー:', testError);
      }
    } else {
      console.log('✅ TEXT型の商品IDが正常に挿入できました');
      
      // テストデータを削除
      await supabase
        .from('swipes')
        .delete()
        .eq('user_id', testUserId)
        .eq('product_id', testProductId);
    }
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
    console.log('\n手動での修正が必要な場合：');
    console.log('1. Supabaseダッシュボードにログイン');
    console.log('2. SQL Editorを開く');
    console.log('3. scripts/fix-swipes-product-id-type.sqlの内容を実行');
  }
}

// メイン処理
async function main() {
  await fixProductIdType();
  
  console.log('\n\n=== 次のステップ ===');
  console.log('1. 開発ビルドでアプリを再起動');
  console.log('2. テストユーザーでログイン（test@stilya.com / test123456）');
  console.log('3. スワイプ機能をテスト');
  console.log('4. エラーが発生しないことを確認');
}

main().then(() => {
  console.log('\n修正スクリプト完了');
  process.exit(0);
}).catch(error => {
  console.error('予期しないエラー:', error);
  process.exit(1);
});
