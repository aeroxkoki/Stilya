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

async function debugSwipeHistory() {
  console.log('=== スワイプ履歴デバッグ ===');
  
  try {
    // 1. 全てのスワイプを確認
    console.log('\n1. スワイプテーブルの全データを確認...');
    const { data: allSwipes, error: allSwipesError } = await supabase
      .from('swipes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (allSwipesError) {
      console.error('全スワイプ取得エラー:', allSwipesError);
      return;
    }
    
    console.log('全スワイプ数:', allSwipes?.length || 0);
    if (allSwipes && allSwipes.length > 0) {
      console.log('\n最初の5件のスワイプ:');
      allSwipes.slice(0, 5).forEach((swipe, index) => {
        console.log(`${index + 1}. User: ${swipe.user_id}, Product: ${swipe.product_id}, Result: ${swipe.result}`);
        console.log(`   Created: ${swipe.created_at}`);
      });
    }
    
    // 2. 特定のユーザーIDでクエリ
    const testUserId = '8e85caf4-5431-4ac4-a8d4-75d289e45a3a';
    console.log(`\n2. ユーザーID ${testUserId} のスワイプを検索...`);
    
    const { data: userSwipes, error: userSwipesError } = await supabase
      .from('swipes')
      .select('*')
      .eq('user_id', testUserId);
    
    if (userSwipesError) {
      console.error('ユーザースワイプ取得エラー:', userSwipesError);
    } else {
      console.log('見つかったスワイプ数:', userSwipes?.length || 0);
    }
    
    // 3. 全ユーザーIDを確認
    console.log('\n3. スワイプテーブルに存在するユニークなユーザーIDを確認...');
    const { data: uniqueUserIds, error: uniqueError } = await supabase
      .from('swipes')
      .select('user_id');
    
    if (!uniqueError && uniqueUserIds) {
      const uniqueIds = [...new Set(uniqueUserIds.map(s => s.user_id))];
      console.log('ユニークなユーザーID数:', uniqueIds.length);
      console.log('ユーザーIDリスト:', uniqueIds);
    }
    
    // 4. 最新のスワイプを取得して詳細確認
    console.log('\n4. 最新のスワイプの詳細を確認...');
    const { data: latestSwipe, error: latestError } = await supabase
      .from('swipes')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();
    
    if (!latestError && latestSwipe) {
      console.log('最新のスワイプ:', JSON.stringify(latestSwipe, null, 2));
    }
    
  } catch (error) {
    console.error('デバッグエラー:', error);
  }
}

// Run debug
debugSwipeHistory();
