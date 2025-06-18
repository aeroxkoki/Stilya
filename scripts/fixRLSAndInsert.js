const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.EXPO_PUBLIC_SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Supabase環境変数が設定されていません。サービスキーが必要です。');
  console.log('EXPO_PUBLIC_SUPABASE_URL:', supabaseUrl ? '設定済み' : '未設定');
  console.log('EXPO_PUBLIC_SUPABASE_SERVICE_KEY:', supabaseServiceKey ? '設定済み' : '未設定');
  process.exit(1);
}

// Service roleキーを使用
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixRLSAndInsertData() {
  console.log('=== RLS修正とテストデータ挿入 ===');
  
  try {
    // 1. 現在のRLSポリシーを確認
    console.log('\n1. 現在のRLSポリシーを確認中...');
    const { data: policies, error: policyError } = await supabase
      .rpc('get_policies_for_table', { table_name: 'swipes' });
    
    if (policyError) {
      console.log('RLSポリシー確認エラー（予想内）:', policyError.message);
    } else {
      console.log('現在のポリシー:', policies);
    }
    
    // 2. サービスロールでテストデータを挿入（RLSをバイパス）
    console.log('\n2. サービスロールでテストデータを挿入中...');
    
    // まずテストユーザーをusersテーブルに挿入
    const testUserId = '8e85caf4-5431-4ac4-a8d4-75d289e45a3a';
    const testEmail = 'test_1750213971091@example.com';
    
    const { error: userError } = await supabase
      .from('users')
      .upsert({
        id: testUserId,
        email: testEmail,
        created_at: new Date().toISOString()
      }, { onConflict: 'id' });
    
    if (userError) {
      console.log('ユーザー挿入エラー（既存の場合は無視）:', userError.message);
    } else {
      console.log('✓ ユーザーデータを確認/作成しました');
    }
    
    // 3. 商品を取得
    const { data: products, error: productError } = await supabase
      .from('external_products')
      .select('id, title')
      .limit(5);
    
    if (productError || !products || products.length === 0) {
      console.error('商品取得エラー:', productError);
      return;
    }
    
    console.log(`\n${products.length}件の商品を使用します`);
    
    // 4. スワイプデータを挿入（バッチ挿入）
    const swipeData = products.map((product, index) => ({
      user_id: testUserId,
      product_id: product.id,
      result: index % 2 === 0 ? 'yes' : 'no',
      created_at: new Date(Date.now() - index * 60000).toISOString() // 時間をずらす
    }));
    
    const { data: insertedSwipes, error: insertError } = await supabase
      .from('swipes')
      .insert(swipeData)
      .select();
    
    if (insertError) {
      console.error('スワイプ挿入エラー:', insertError);
      
      // RLSが原因の場合、SQLで直接挿入を試みる
      if (insertError.code === '42501') {
        console.log('\n3. RLSエラーのため、別の方法を試します...');
        
        // Supabase管理画面で実行するSQLを生成
        console.log('\n=== Supabase管理画面で実行するSQL ===');
        console.log('-- 1. RLSを一時的に無効化');
        console.log('ALTER TABLE swipes DISABLE ROW LEVEL SECURITY;');
        console.log('');
        console.log('-- 2. テストデータを挿入');
        swipeData.forEach((swipe, index) => {
          console.log(`INSERT INTO swipes (user_id, product_id, result, created_at) VALUES ('${swipe.user_id}', '${swipe.product_id}', '${swipe.result}', '${swipe.created_at}');`);
        });
        console.log('');
        console.log('-- 3. RLSを再度有効化（必要に応じて）');
        console.log('-- ALTER TABLE swipes ENABLE ROW LEVEL SECURITY;');
        console.log('\n=== SQLここまで ===');
      }
    } else {
      console.log(`✓ ${insertedSwipes?.length || 0}件のスワイプを挿入しました`);
    }
    
    // 5. 結果を確認
    console.log('\n4. 挿入結果を確認中...');
    const { data: verifySwipes, count } = await supabase
      .from('swipes')
      .select('*', { count: 'exact' })
      .eq('user_id', testUserId);
    
    console.log(`\nユーザー ${testEmail} のスワイプ数: ${count || 0}`);
    
    if (verifySwipes && verifySwipes.length > 0) {
      console.log('\nスワイプリスト:');
      verifySwipes.forEach((swipe, index) => {
        console.log(`${index + 1}. Product: ${swipe.product_id}, Result: ${swipe.result}, Created: ${swipe.created_at}`);
      });
    }
    
    console.log('\n=== 完了 ===');
    
  } catch (error) {
    console.error('エラー:', error);
  }
}

// Run the fix
fixRLSAndInsertData();
