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

async function insertSwipesWithAuth() {
  console.log('=== 認証ユーザーとしてスワイプデータを挿入 ===');
  
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
      
      // ユーザーが存在しない場合は作成
      if (authError.message.includes('Invalid login credentials')) {
        console.log('\n新規ユーザーを作成中...');
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email: testEmail,
          password: testPassword,
        });
        
        if (signUpError) {
          console.error('サインアップエラー:', signUpError);
          return;
        }
        
        console.log('✓ ユーザーを作成しました:', signUpData.user?.id);
      } else {
        return;
      }
    } else {
      console.log('✓ サインイン成功:', authData.user?.id);
    }
    
    // 現在のユーザーを取得
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('ユーザー情報を取得できませんでした');
      return;
    }
    
    const userId = user.id;
    
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
    
    // 3. スワイプデータを1つずつ挿入（認証されたユーザーとして）
    console.log('\n3. スワイプデータを挿入中...');
    let successCount = 0;
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const result = i % 2 === 0 ? 'yes' : 'no';
      
      const { data, error } = await supabase
        .from('swipes')
        .insert({
          user_id: userId,
          product_id: product.id,
          result: result,
        })
        .select()
        .single();
      
      if (error) {
        console.error(`スワイプ挿入エラー (${product.title}):`, error.message);
      } else {
        console.log(`✓ スワイプを挿入: ${product.title} - ${result}`);
        successCount++;
      }
    }
    
    console.log(`\n${successCount}/${products.length}件のスワイプを挿入しました`);
    
    // 4. 挿入結果を確認
    console.log('\n4. 挿入結果を確認中...');
    const { data: verifySwipes, error: verifyError } = await supabase
      .from('swipes')
      .select(`
        *,
        product:external_products(id, title, brand)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (verifyError) {
      console.error('確認エラー:', verifyError);
    } else {
      console.log(`\nユーザー ${testEmail} のスワイプ数: ${verifySwipes?.length || 0}`);
      
      if (verifySwipes && verifySwipes.length > 0) {
        console.log('\nスワイプリスト:');
        verifySwipes.forEach((swipe, index) => {
          console.log(`${index + 1}. ${swipe.product?.title || 'Unknown'} - ${swipe.result}`);
        });
        
        // Yes/Noの統計
        const yesCount = verifySwipes.filter(s => s.result === 'yes').length;
        const noCount = verifySwipes.filter(s => s.result === 'no').length;
        
        console.log('\n統計情報:');
        console.log(`- Yes: ${yesCount}件`);
        console.log(`- No: ${noCount}件`);
        console.log(`- 合計: ${yesCount + noCount}件`);
      }
    }
    
    // 5. サインアウト
    await supabase.auth.signOut();
    console.log('\n✓ サインアウトしました');
    
    console.log('\n=== 完了 ===');
    console.log('テストアカウント情報:');
    console.log(`- Email: ${testEmail}`);
    console.log(`- Password: ${testPassword}`);
    console.log(`- User ID: ${userId}`);
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

// Run the insertion
insertSwipesWithAuth();
