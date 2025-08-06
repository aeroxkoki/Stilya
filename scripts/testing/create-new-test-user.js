#!/usr/bin/env node

/**
 * 新しいテストユーザー作成スクリプト
 * 使い方: node scripts/create-new-test-user.js
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Supabase設定
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// 新しいテストユーザー情報（タイムスタンプ付き）
const timestamp = new Date().getTime();
const TEST_USER = {
  email: `test${timestamp}@stilya.com`,
  password: 'StrongPass123!'
};

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createNewTestUser() {
  console.log('🔐 新しいテストユーザーを作成しています...');
  console.log(`📧 メール: ${TEST_USER.email}`);
  console.log(`🔑 パスワード: ${TEST_USER.password}`);
  console.log('');

  try {
    // 新規ユーザーを作成
    console.log('新規ユーザーを作成中...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: TEST_USER.email,
      password: TEST_USER.password,
      options: {
        emailRedirectTo: `${process.env.EXPO_PUBLIC_APP_URL || 'https://stilya.com'}/auth/callback`,
        data: {
          created_at: new Date().toISOString(),
        },
      },
    });

    if (signUpError) {
      throw signUpError;
    }

    if (signUpData?.user) {
      console.log('✅ テストユーザーが正常に作成されました！');
      console.log('ユーザーID:', signUpData.user.id);
      
      // ユーザープロファイルを作成
      if (signUpData.user.id) {
        console.log('プロファイルを作成中...');
        const { error: profileError } = await supabase
          .from('users')
          .insert([{ 
            id: signUpData.user.id, 
            email: TEST_USER.email,
            created_at: new Date().toISOString()
          }]);
        
        if (profileError) {
          if (profileError.message.includes('duplicate')) {
            console.log('ℹ️ プロファイルは既に存在します');
          } else {
            console.warn('⚠️ プロファイル作成エラー:', profileError.message);
          }
        } else {
          console.log('✅ プロファイルが作成されました');
        }
      }
      
      console.log('');
      console.log('📱 ログイン情報を保存してください:');
      console.log('================================');
      console.log(`メール: ${TEST_USER.email}`);
      console.log(`パスワード: ${TEST_USER.password}`);
      console.log('================================');
      
      // すぐにログインを試みる
      console.log('');
      console.log('🔐 作成したユーザーでログインテスト中...');
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: TEST_USER.email,
        password: TEST_USER.password,
      });

      if (signInError) {
        console.log('⚠️ ログインエラー:', signInError.message);
        if (signInError.message.includes('Email not confirmed')) {
          console.log('');
          console.log('📧 メール確認が必要です:');
          console.log('1. メールボックスを確認してください');
          console.log('2. 確認リンクをクリックしてください');
          console.log('3. その後、アプリでログインできます');
        }
      } else if (signInData?.user) {
        console.log('✅ ログイン成功！');
        console.log('このアカウントでアプリにログインできます。');
        
        // ログアウト
        await supabase.auth.signOut();
      }
    }
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
  }
}

// スクリプトを実行
createNewTestUser().then(() => {
  console.log('');
  console.log('スクリプトが完了しました。');
  process.exit(0);
}).catch((error) => {
  console.error('予期しないエラー:', error);
  process.exit(1);
});
