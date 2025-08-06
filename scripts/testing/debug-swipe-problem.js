#!/usr/bin/env node

/**
 * スワイプデータのデバッグスクリプト
 * 5つで商品が出なくなる問題の調査
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function investigateSwipeProblem() {
  console.log('=== 5つで商品が出なくなる問題の調査 ===\n');
  
  try {
    // 1. 商品の総数を確認
    const { count: totalProducts } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    console.log(`✅ アクティブな商品総数: ${totalProducts}件`);
    
    // 2. テストユーザーでログイン
    const { data: { user }, error: authError } = await supabase.auth.signInWithPassword({
      email: 'test@stilya.com',
      password: 'test123456'
    });
    
    if (authError || !user) {
      console.error('❌ テストユーザーでのログインに失敗:', authError?.message);
      console.log('\nテストユーザーなしで調査を続行...');
    } else {
      console.log(`\n✅ テストユーザーでログイン成功`);
      console.log(`ユーザーID: ${user.id}`);
      
      // 3. このユーザーのスワイプ履歴を確認
      const { data: swipes, count: swipeCount } = await supabase
        .from('swipes')
        .select('*', { count: 'exact' })
        .eq('user_id', user.id);
      
      console.log(`\nこのユーザーのスワイプ履歴: ${swipeCount}件`);
      
      if (swipes && swipes.length > 0) {
        // スワイプ済み商品IDのリスト
        const swipedProductIds = swipes.map(s => s.product_id);
        console.log('\nスワイプ済み商品ID（最初の10件）:');
        swipedProductIds.slice(0, 10).forEach((id, i) => {
          console.log(`${i + 1}. ${id}`);
        });
        
        // 4. スワイプ済みを除外した場合の残り商品数
        const { count: remainingProducts } = await supabase
          .from('external_products')
          .select('*', { count: 'exact', head: true })
          .eq('is_active', true)
          .not('id', 'in', `(${swipedProductIds.join(',')})`);
        
        console.log(`\n❗ スワイプ済みを除外した残り商品数: ${remainingProducts}件`);
        
        if (remainingProducts === 0) {
          console.log('\n⚠️ 問題発見: すべての商品がスワイプ済みです！');
        }
      }
      
      await supabase.auth.signOut();
    }
    
    // 5. 商品IDの形式を確認
    const { data: sampleProducts } = await supabase
      .from('external_products')
      .select('id, title')
      .limit(5);
    
    console.log('\n--- 商品IDの形式確認 ---');
    if (sampleProducts) {
      sampleProducts.forEach((product, i) => {
        console.log(`${i + 1}. ID: ${product.id} (型: ${typeof product.id})`);
      });
    }
    
    // 6. スワイプデータのサンプル
    const { data: sampleSwipes } = await supabase
      .from('swipes')
      .select('*')
      .limit(5);
    
    console.log('\n--- スワイプデータのサンプル ---');
    if (sampleSwipes) {
      sampleSwipes.forEach((swipe, i) => {
        console.log(`${i + 1}. product_id: ${swipe.product_id} (型: ${typeof swipe.product_id})`);
      });
    }
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

// 実行
investigateSwipeProblem().then(() => {
  console.log('\n調査完了');
  process.exit(0);
}).catch(error => {
  console.error('エラー:', error);
  process.exit(1);
});
