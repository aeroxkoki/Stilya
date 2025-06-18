const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase環境変数が設定されていません。');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSwipeHistoryWithAuth() {
  console.log('=== 認証ユーザーとしてスワイプ履歴をテスト ===');
  
  try {
    // 1. テストユーザーでサインイン
    const testEmail = 'test_1750213971091@example.com';
    const testPassword = 'TestPassword123!';
    
    console.log(`\n1. ユーザー ${testEmail} でサインイン中...`);
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: testEmail,
      password: testPassword,
    });
    
    if (authError) {
      console.error('サインインエラー:', authError);
      return;
    }
    
    console.log('✓ サインイン成功:', authData.user?.id);
    const userId = authData.user?.id;
    
    // 2. スワイプ履歴を取得（認証されたユーザーとして）
    console.log('\n2. 認証されたユーザーとしてスワイプ履歴を取得...');
    
    // 全履歴
    console.log('\n--- 全履歴 ---');
    const { data: allSwipes, error: allError } = await supabase
      .from('swipes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (allError) {
      console.error('全履歴取得エラー:', allError);
    } else {
      console.log(`全スワイプ数: ${allSwipes?.length || 0}`);
    }
    
    // Yesのみ
    console.log('\n--- Yesのみ ---');
    const { data: yesSwipes, error: yesError } = await supabase
      .from('swipes')
      .select('*')
      .eq('user_id', userId)
      .eq('result', 'yes')
      .order('created_at', { ascending: false });
    
    if (yesError) {
      console.error('Yes履歴取得エラー:', yesError);
    } else {
      console.log(`Yesスワイプ数: ${yesSwipes?.length || 0}`);
    }
    
    // Noのみ
    console.log('\n--- Noのみ ---');
    const { data: noSwipes, error: noError } = await supabase
      .from('swipes')
      .select('*')
      .eq('user_id', userId)
      .eq('result', 'no')
      .order('created_at', { ascending: false });
    
    if (noError) {
      console.error('No履歴取得エラー:', noError);
    } else {
      console.log(`Noスワイプ数: ${noSwipes?.length || 0}`);
    }
    
    // 3. 商品詳細を含めて取得
    console.log('\n3. 商品詳細を含めてスワイプ履歴を取得...');
    const { data: swipesWithProducts, error: joinError } = await supabase
      .from('swipes')
      .select(`
        *,
        product:external_products(*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (joinError) {
      console.error('商品詳細込み取得エラー:', joinError);
    } else {
      console.log(`\n最新5件のスワイプ（商品詳細付き）:`);
      swipesWithProducts?.forEach((swipe, index) => {
        console.log(`${index + 1}. ${swipe.product?.title || 'Unknown'} - ${swipe.result}`);
        console.log(`   価格: ¥${swipe.product?.price || 'N/A'}`);
      });
    }
    
    // 4. サインアウト
    await supabase.auth.signOut();
    console.log('\n✓ サインアウトしました');
    
  } catch (error) {
    console.error('エラー:', error);
  }
  
  console.log('\n=== テスト完了 ===');
}

// 認証なしでのテストも実行
async function testWithoutAuth() {
  console.log('\n\n=== 認証なしでスワイプ履歴を取得（比較用） ===');
  
  const testUserId = '8e85caf4-5431-4ac4-a8d4-75d289e45a3a';
  
  const { data, error } = await supabase
    .from('swipes')
    .select('*')
    .eq('user_id', testUserId)
    .limit(5);
  
  if (error) {
    console.error('認証なしでのエラー:', error);
  } else {
    console.log(`認証なしで取得できたスワイプ数: ${data?.length || 0}`);
  }
}

// Run tests
async function runAllTests() {
  await testSwipeHistoryWithAuth();
  await testWithoutAuth();
}

runAllTests();
