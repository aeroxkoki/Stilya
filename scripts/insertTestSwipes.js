const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase環境変数が設定されていません。');
  process.exit(1);
}

// Service roleを使用してRLSをバイパス
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function insertTestSwipeData() {
  console.log('=== テストスワイプデータの挿入（サービスロール） ===');
  
  try {
    // 1. 商品を取得
    console.log('\n1. 商品データを取得中...');
    const { data: products, error: productError } = await supabase
      .from('external_products')
      .select('id, title, brand')
      .limit(5);
    
    if (productError || !products || products.length === 0) {
      console.error('商品取得エラー:', productError);
      return;
    }
    
    console.log(`${products.length}件の商品を取得しました`);
    
    // 2. テストユーザーID（先ほど作成したユーザー）
    const testUserId = '8e85caf4-5431-4ac4-a8d4-75d289e45a3a';
    
    // 3. スワイプデータを作成
    console.log('\n2. スワイプデータを挿入中...');
    
    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const result = i % 2 === 0 ? 'yes' : 'no';
      
      const { data, error } = await supabase
        .from('swipes')
        .insert({
          user_id: testUserId,
          product_id: product.id,
          result: result,
          created_at: new Date().toISOString()
        })
        .select()
        .single();
      
      if (error) {
        console.error(`スワイプ挿入エラー (${product.title}):`, error);
      } else {
        console.log(`✓ スワイプを挿入: ${product.title} - ${result}`);
      }
    }
    
    // 4. 挿入結果を確認
    console.log('\n3. 挿入結果を確認中...');
    const { data: verifySwipes, error: verifyError } = await supabase
      .from('swipes')
      .select('*')
      .eq('user_id', testUserId)
      .order('created_at', { ascending: false });
    
    if (verifyError) {
      console.error('確認エラー:', verifyError);
    } else {
      console.log(`\n挿入されたスワイプ数: ${verifySwipes?.length || 0}`);
      if (verifySwipes && verifySwipes.length > 0) {
        console.log('\nスワイプリスト:');
        verifySwipes.forEach((swipe, index) => {
          console.log(`${index + 1}. Product ID: ${swipe.product_id}, Result: ${swipe.result}`);
        });
      }
    }
    
    // 5. テーブル全体の統計
    console.log('\n4. テーブル全体の統計...');
    const { count, error: countError } = await supabase
      .from('swipes')
      .select('*', { count: 'exact', head: true });
    
    if (!countError) {
      console.log(`スワイプテーブルの総レコード数: ${count}`);
    }
    
    console.log('\n=== 完了 ===');
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

// Run the insertion
insertTestSwipeData();
