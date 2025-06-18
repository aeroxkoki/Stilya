const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');
const crypto = require('crypto');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase環境変数が設定されていません。');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function createTestUserAndSwipes() {
  console.log('=== テストユーザーとスワイプ履歴を作成 ===');
  
  try {
    // 1. テストユーザーを作成
    console.log('\n1. テストユーザーを作成中...');
    const testEmail = `test_${Date.now()}@example.com`;
    const testPassword = 'TestPassword123!';
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: testEmail,
      password: testPassword,
    });
    
    if (authError) {
      console.error('ユーザー作成エラー:', authError);
      return;
    }
    
    const userId = authData.user?.id;
    console.log('テストユーザーが作成されました:', {
      id: userId,
      email: testEmail
    });
    
    // 2. 商品を取得
    console.log('\n2. 商品データを取得中...');
    const { data: products, error: productError } = await supabase
      .from('external_products')
      .select('id, title, brand')
      .limit(10);
    
    if (productError || !products || products.length === 0) {
      console.error('商品取得エラー:', productError);
      return;
    }
    
    console.log(`${products.length}件の商品を取得しました`);
    
    // 3. スワイプ履歴を作成
    console.log('\n3. スワイプ履歴を作成中...');
    const swipeData = products.map((product, index) => ({
      user_id: userId,
      product_id: product.id,
      result: index % 2 === 0 ? 'yes' : 'no', // 交互にyes/no
    }));
    
    const { data: swipes, error: swipeError } = await supabase
      .from('swipes')
      .insert(swipeData)
      .select();
    
    if (swipeError) {
      console.error('スワイプ作成エラー:', swipeError);
      return;
    }
    
    console.log(`${swipes?.length || 0}件のスワイプ履歴を作成しました`);
    
    // 4. 作成したスワイプ履歴を確認
    console.log('\n4. 作成したスワイプ履歴を確認中...');
    const { data: userSwipes, error: fetchError } = await supabase
      .from('swipes')
      .select(`
        *,
        product:external_products(id, title, brand, price)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (fetchError) {
      console.error('スワイプ履歴取得エラー:', fetchError);
      return;
    }
    
    console.log(`\nユーザー ${testEmail} のスワイプ履歴:`);
    userSwipes?.forEach((swipe, index) => {
      console.log(`${index + 1}. ${swipe.product?.title || 'Unknown'} - ${swipe.result}`);
    });
    
    // 5. Yes/Noの統計
    const yesCount = userSwipes?.filter(s => s.result === 'yes').length || 0;
    const noCount = userSwipes?.filter(s => s.result === 'no').length || 0;
    
    console.log('\n統計情報:');
    console.log(`- Yes: ${yesCount}件`);
    console.log(`- No: ${noCount}件`);
    console.log(`- 合計: ${yesCount + noCount}件`);
    
    console.log('\n=== テスト完了 ===');
    console.log('作成したテストユーザー:');
    console.log(`- Email: ${testEmail}`);
    console.log(`- Password: ${testPassword}`);
    console.log(`- User ID: ${userId}`);
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// Run the test
createTestUserAndSwipes();
