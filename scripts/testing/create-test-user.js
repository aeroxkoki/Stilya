#!/usr/bin/env node

/**
 * Supabaseテストユーザー作成スクリプト
 * 使い方: node scripts/create-test-user.js
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase設定
const SUPABASE_URL = 'https://ddypgpljprljqrblpuli.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkeXBncGxqcHJsanFyYmxwdWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMDMwOTcsImV4cCI6MjA2MjY3OTA5N30.u4310NL9FYdxcMSrGxEzEXP0M5y5pDuG3_mz7IRAhMU';

// テストユーザー情報
const TEST_USER = {
  email: 'test@stilya.com',
  password: 'test123456'
};

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function createTestUser() {
  console.log('🔐 テストユーザーを作成しています...');
  console.log(`📧 メール: ${TEST_USER.email}`);
  console.log(`🔑 パスワード: ${TEST_USER.password}`);
  console.log('');

  try {
    // まず既存のユーザーでログインを試みる
    console.log('既存ユーザーの確認中...');
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: TEST_USER.email,
      password: TEST_USER.password,
    });

    if (signInData?.user) {
      console.log('✅ テストユーザーは既に存在します！');
      console.log('ユーザーID:', signInData.user.id);
      console.log('');
      console.log('アプリでログインできます:');
      console.log(`メール: ${TEST_USER.email}`);
      console.log(`パスワード: ${TEST_USER.password}`);
      
      // ログアウト
      await supabase.auth.signOut();
      return;
    }

    // ユーザーが存在しない場合は新規作成
    console.log('新規ユーザーを作成中...');
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: TEST_USER.email,
      password: TEST_USER.password,
      options: {
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
        const { error: profileError } = await supabase
          .from('users')
          .insert([{ 
            id: signUpData.user.id, 
            email: TEST_USER.email,
            created_at: new Date().toISOString()
          }]);
        
        if (profileError && !profileError.message.includes('duplicate')) {
          console.warn('⚠️ プロファイル作成エラー:', profileError.message);
        }
      }
      
      console.log('');
      console.log('📱 アプリでログインできます:');
      console.log(`メール: ${TEST_USER.email}`);
      console.log(`パスワード: ${TEST_USER.password}`);
      
      if (!signUpData.session) {
        console.log('');
        console.log('⚠️ 注意: メール確認が必要な場合があります。');
        console.log('Supabaseダッシュボードで確認してください。');
      }
    }
  } catch (error) {
    console.error('❌ エラーが発生しました:', error.message);
    
    if (error.message.includes('User already registered')) {
      console.log('');
      console.log('💡 このメールアドレスは既に登録されています。');
      console.log('ログイン情報:');
      console.log(`メール: ${TEST_USER.email}`);
      console.log(`パスワード: ${TEST_USER.password}`);
    }
  }
}

// スクリプトを実行
createTestUser().then(() => {
  console.log('');
  console.log('スクリプトが完了しました。');
  process.exit(0);
}).catch((error) => {
  console.error('予期しないエラー:', error);
  process.exit(1);
});
