const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// 環境変数の確認
const supabaseUrl = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('環境変数が設定されていません。.envファイルを確認してください。');
  console.error('必要な環境変数: SUPABASE_URL, SUPABASE_SERVICE_KEY または SUPABASE_ANON_KEY');
  process.exit(1);
}

// Supabaseクライアントの作成
const supabase = createClient(supabaseUrl, supabaseKey);

// テスト用のデモアカウント情報
const TEST_EMAIL = 'demo@stilya-app.com';
const TEST_PASSWORD = 'Demo123!';

async function createDemoAccount() {
  try {
    console.log('デモアカウントを作成しています...');
    
    // ユーザーを登録
    const { data, error } = await supabase.auth.signUp({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    
    if (error) {
      console.error('アカウント作成エラー:', error);
      throw error;
    }
    
    if (data && data.user) {
      console.log('=== デモアカウント作成成功 ===');
      console.log(`メールアドレス: ${TEST_EMAIL}`);
      console.log(`パスワード: ${TEST_PASSWORD}`);
      console.log(`ユーザーID: ${data.user.id}`);
      console.log('========================');
      
      // ユーザープロフィールを作成
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          email: TEST_EMAIL,
          created_at: new Date().toISOString(),
          gender: 'female',
          style_preference: ['casual', 'trendy'],
          age_group: '25-34',
          nickname: 'デモユーザー',
          onboarding_completed: true
        });
        
      if (profileError) {
        console.error('プロフィール作成エラー:', profileError);
      } else {
        console.log('ユーザープロフィールを作成しました');
      }
      
      return { email: TEST_EMAIL, password: TEST_PASSWORD };
    }
  } catch (error) {
    console.error('デモアカウント作成中にエラーが発生しました:', error);
  }
}

// 実行
createDemoAccount()
  .then(() => {
    console.log('スクリプトが正常に終了しました。');
    process.exit(0);
  })
  .catch((error) => {
    console.error('スクリプトの実行中にエラーが発生しました:', error);
    process.exit(1);
  });
