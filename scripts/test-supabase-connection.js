const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

console.log('🔍 Supabase接続テスト');
console.log('URL:', SUPABASE_URL);
console.log('Key:', SUPABASE_ANON_KEY ? '設定済み' : '未設定');

async function testConnection() {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // 1. 基本的な接続テスト
    console.log('\n1️⃣ 基本接続テスト...');
    const { data: session, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.log('❌ セッション取得エラー:', sessionError.message);
    } else {
      console.log('✅ セッション取得成功');
    }
    
    // 2. データベース接続テスト
    console.log('\n2️⃣ データベース接続テスト...');
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1);
    
    if (error) {
      console.log('❌ データベースエラー:', error.message);
    } else {
      console.log('✅ データベース接続成功');
    }
    
    // 3. テストアカウントでログイン試行
    console.log('\n3️⃣ テストアカウントログイン...');
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: 'test@stilya.com',
      password: 'test123456'
    });
    
    if (authError) {
      console.log('❌ ログインエラー:', authError.message);
    } else {
      console.log('✅ ログイン成功:', authData.user?.email);
      // ログアウト
      await supabase.auth.signOut();
    }
    
    console.log('\n✅ Supabase接続テスト完了');
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

testConnection();
