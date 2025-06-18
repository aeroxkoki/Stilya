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

async function testSwipeHistory() {
  console.log('=== スワイプ履歴機能のテスト開始 ===');
  
  try {
    // 1. ユーザー一覧を取得
    console.log('\n1. ユーザー一覧を確認中...');
    const { data: users, error: userError } = await supabase
      .from('users')
      .select('id, email')
      .limit(5);
    
    if (userError) {
      console.error('ユーザー取得エラー:', userError);
      return;
    }
    
    console.log('ユーザー数:', users?.length || 0);
    if (users && users.length > 0) {
      console.log('最初のユーザー:', users[0]);
    }
    
    // 2. スワイプテーブルの構造を確認
    console.log('\n2. スワイプテーブルの構造を確認中...');
    const { data: swipeColumns, error: columnsError } = await supabase
      .from('swipes')
      .select('*')
      .limit(1);
    
    if (columnsError) {
      console.error('スワイプテーブル構造確認エラー:', columnsError);
    } else {
      console.log('スワイプテーブルのカラム:', swipeColumns?.length > 0 ? Object.keys(swipeColumns[0]) : 'データなし');
    }
    
    // 3. スワイプ履歴を取得
    console.log('\n3. スワイプ履歴を取得中...');
    const { data: swipes, error: swipeError } = await supabase
      .from('swipes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    
    if (swipeError) {
      console.error('スワイプ履歴取得エラー:', swipeError);
      return;
    }
    
    console.log('スワイプ履歴数:', swipes?.length || 0);
    if (swipes && swipes.length > 0) {
      console.log('最新のスワイプ:', swipes[0]);
    }
    
    // 4. 商品テーブルの確認
    console.log('\n4. 商品テーブルを確認中...');
    const { data: products, error: productError } = await supabase
      .from('external_products')
      .select('id, title, brand')
      .limit(5);
    
    if (productError) {
      console.error('商品取得エラー:', productError);
      return;
    }
    
    console.log('商品数:', products?.length || 0);
    
    // 5. テストデータの挿入（ユーザーと商品が存在する場合）
    if (users && users.length > 0 && products && products.length > 0) {
      console.log('\n5. テストスワイプデータを挿入中...');
      const testUser = users[0];
      const testProduct = products[0];
      
      const { data: newSwipe, error: insertError } = await supabase
        .from('swipes')
        .insert({
          user_id: testUser.id,
          product_id: testProduct.id,
          result: 'yes'
        })
        .select()
        .single();
      
      if (insertError) {
        console.error('スワイプ挿入エラー:', insertError);
      } else {
        console.log('テストスワイプが正常に挿入されました:', newSwipe);
      }
      
      // 6. 挿入したデータの確認
      console.log('\n6. 挿入したデータを確認中...');
      const { data: userSwipes, error: userSwipeError } = await supabase
        .from('swipes')
        .select('*')
        .eq('user_id', testUser.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (userSwipeError) {
        console.error('ユーザースワイプ取得エラー:', userSwipeError);
      } else {
        console.log(`ユーザー ${testUser.email} のスワイプ数:`, userSwipes?.length || 0);
      }
    }
    
    // 7. 統計情報
    console.log('\n7. 統計情報を取得中...');
    const { count: totalSwipes, error: countError } = await supabase
      .from('swipes')
      .select('*', { count: 'exact', head: true });
    
    if (!countError) {
      console.log('総スワイプ数:', totalSwipes);
    }
    
    console.log('\n=== テスト完了 ===');
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// Run the test
testSwipeHistory();
