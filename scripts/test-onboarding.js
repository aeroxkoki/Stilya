// テスト用：オンボーディング画面テストスクリプト
// 実行方法: 
//   1. .envファイルにTEST_USER_PASSWORD=your-password を追加
//   2. node scripts/test-onboarding.js <email>
// 
// 例: node scripts/test-onboarding.js test@example.com

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
);

async function resetOnboardingForUser(email) {
  try {
    // 環境変数からテスト用パスワードを取得
    const testPassword = process.env.TEST_USER_PASSWORD;
    if (!testPassword) {
      console.error('TEST_USER_PASSWORD環境変数が設定されていません');
      return;
    }

    // ユーザーの認証情報でログイン
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: email,
      password: testPassword
    });

    if (authError) {
      console.error('ログインエラー:', authError);
      return;
    }

    const userId = authData.user?.id;
    if (!userId) {
      console.error('ユーザーIDが取得できません');
      return;
    }

    // ユーザーのオンボーディング関連データをリセット
    const { error: updateError } = await supabase
      .from('users')
      .update({
        gender: null,
        style_preferences: null,
        age_group: null
      })
      .eq('id', userId);

    if (updateError) {
      console.error('更新エラー:', updateError);
      return;
    }

    console.log('✅ オンボーディングデータをリセットしました');
    console.log('アプリを再起動すると、オンボーディング画面が表示されます');
  } catch (error) {
    console.error('エラー:', error);
  }
}

// コマンドライン引数からメールアドレスを取得
const email = process.argv[2];
if (!email) {
  console.error('使用方法: node scripts/test-onboarding.js <email>');
  process.exit(1);
}

// 実行
resetOnboardingForUser(email);