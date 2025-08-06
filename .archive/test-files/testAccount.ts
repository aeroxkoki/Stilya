import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// 環境変数の読み込み
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('環境変数が設定されていません。.envファイルを確認してください。');
  process.exit(1);
}

// 管理者権限を持つクライアントを作成
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// ランダムなパスワードを生成
const generatePassword = () => {
  const length = 10;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
  let password = '';
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
};

// テストユーザーを作成する関数
const createTestAccount = async () => {
  // テストアカウント情報
  const testUserEmail = 'test@stilya-app.com';
  const testUserPassword = generatePassword();
  
  try {
    // ユーザーの作成
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: testUserEmail,
      password: testUserPassword,
      email_confirm: true, // メール確認を自動的に完了させる
    });

    if (authError) {
      throw authError;
    }
    
    const userId = authData.user.id;
    
    // ユーザープロフィールの作成
    const { error: profileError } = await supabase
      .from('users')
      .upsert({
        id: userId,
        email: testUserEmail,
        created_at: new Date().toISOString(),
        gender: 'female',
        style_preference: ['casual', 'trendy'],
        age_group: '25-34',
        nickname: 'TestUser',
        onboarding_completed: true,
      });

    if (profileError) {
      throw profileError;
    }

    // サンプルスワイプデータを追加
    const { data: productsData, error: productsError } = await supabase
      .from('external_products')
      .select('id')
      .limit(10);
    
    if (productsError) {
      throw productsError;
    }
    
    if (productsData && productsData.length > 0) {
      const swipeData = productsData.slice(0, 5).map(product => ({
        user_id: userId,
        product_id: product.id,
        result: 'yes',
        created_at: new Date().toISOString(),
      }));
      
      const { error: swipeError } = await supabase
        .from('swipes')
        .upsert(swipeData);
      
      if (swipeError) {
        throw swipeError;
      }
    }

    console.log('=== テストアカウント作成成功 ===');
    console.log(`メールアドレス: ${testUserEmail}`);
    console.log(`パスワード: ${testUserPassword}`);
    console.log('========================');
    
    return { email: testUserEmail, password: testUserPassword };
  } catch (error) {
    console.error('テストアカウント作成中にエラーが発生しました:', error);
    throw error;
  }
};

// テストアカウントを作成して実行
createTestAccount()
  .then(() => {
    console.log('スクリプトが正常に終了しました。');
    process.exit(0);
  })
  .catch((error) => {
    console.error('スクリプトの実行中にエラーが発生しました:', error);
    process.exit(1);
  });
