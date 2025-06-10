#!/usr/bin/env node

/**
 * Supabase認証診断スクリプト
 * 使い方: node scripts/diagnose-auth.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase設定
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function diagnoseAuth() {
  console.log('🔍 Supabase認証診断');
  console.log('==================');
  console.log('');

  // 1. 環境変数チェック
  console.log('1️⃣ 環境変数チェック');
  console.log('URL:', SUPABASE_URL ? '✅ 設定済み' : '❌ 未設定');
  console.log('ANON KEY:', SUPABASE_ANON_KEY ? '✅ 設定済み' : '❌ 未設定');
  console.log('');

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.error('❌ 環境変数が設定されていません。.envファイルを確認してください。');
    return;
  }

  // 2. 基本的な接続テスト
  console.log('2️⃣ 基本接続テスト');
  try {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.log('❌ セッション取得エラー:', sessionError.message);
    } else {
      console.log('✅ Supabaseへの接続成功');
    }
  } catch (error) {
    console.error('❌ 接続エラー:', error.message);
    return;
  }
  console.log('');

  // 3. データベース接続テスト
  console.log('3️⃣ データベース接続テスト');
  try {
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ データベースエラー:', error.message);
      console.log('   → usersテーブルが存在しない可能性があります');
    } else {
      console.log('✅ データベース接続成功');
    }
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
  console.log('');

  // 4. 既存のテストユーザーでログインテスト
  console.log('4️⃣ 既存テストユーザーログインテスト');
  const testAccounts = [
    { email: 'test@stilya.com', password: 'test123456' },
    { email: 'test@example.com', password: 'password123' }
  ];

  for (const account of testAccounts) {
    console.log(`\nテスト: ${account.email}`);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: account.email,
        password: account.password,
      });

      if (error) {
        console.log(`❌ ログイン失敗: ${error.message}`);
        if (error.message.includes('Invalid login credentials')) {
          console.log('   → パスワードが間違っているか、ユーザーが存在しません');
        } else if (error.message.includes('Email not confirmed')) {
          console.log('   → メールアドレスの確認が必要です');
        }
      } else if (data?.user) {
        console.log(`✅ ログイン成功: ${data.user.email}`);
        await supabase.auth.signOut();
      }
    } catch (error) {
      console.error(`❌ エラー: ${error.message}`);
    }
  }
  console.log('');

  // 5. 認証設定の推奨事項
  console.log('5️⃣ 推奨される対応');
  console.log('-------------------');
  console.log('1. Supabaseダッシュボードで以下を確認:');
  console.log('   - Authentication → Settings → Email Auth が有効');
  console.log('   - Email Confirmations が無効（開発環境の場合）');
  console.log('   - Minimum password length が6文字以上');
  console.log('');
  console.log('2. 新しいテストユーザーを作成:');
  console.log('   node scripts/create-new-test-user.js');
  console.log('');
  console.log('3. データベースのRLSポリシーを確認:');
  console.log('   - usersテーブルのRLSが適切に設定されているか');
  console.log('   - 認証されたユーザーが自分のデータにアクセスできるか');
  console.log('');
  console.log('🔗 Supabaseダッシュボード:');
  console.log(`   https://supabase.com/dashboard/project/${SUPABASE_URL.split('.')[0].split('//')[1]}`);
}

// スクリプトを実行
diagnoseAuth().then(() => {
  console.log('');
  console.log('診断が完了しました。');
  process.exit(0);
}).catch((error) => {
  console.error('予期しないエラー:', error);
  process.exit(1);
});
