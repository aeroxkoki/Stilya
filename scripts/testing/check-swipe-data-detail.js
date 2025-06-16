#!/usr/bin/env node

/**
 * スワイプ数と商品の関係を調査
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSwipeData() {
  console.log('=== スワイプデータの詳細調査 ===\n');
  
  try {
    // 1. 全スワイプ数
    const { count: totalSwipes } = await supabase
      .from('swipes')
      .select('*', { count: 'exact', head: true });
    
    console.log(`✅ 全スワイプ数: ${totalSwipes}件`);
    
    // 2. ユニークな商品ID数を確認
    const { data: swipes } = await supabase
      .from('swipes')
      .select('product_id');
    
    if (swipes) {
      const uniqueProductIds = new Set(swipes.map(s => s.product_id));
      console.log(`✅ スワイプされたユニークな商品数: ${uniqueProductIds.size}件`);
      
      // 3. 全商品数と比較
      const { count: totalProducts } = await supabase
        .from('external_products')
        .select('*', { count: 'exact', head: true });
      
      console.log(`✅ 全商品数: ${totalProducts}件`);
      console.log(`❗ 未スワイプ商品数: ${totalProducts - uniqueProductIds.size}件`);
      
      // 4. 最も多くスワイプされた商品
      const productSwipeCount = {};
      swipes.forEach(s => {
        productSwipeCount[s.product_id] = (productSwipeCount[s.product_id] || 0) + 1;
      });
      
      const sortedProducts = Object.entries(productSwipeCount)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      
      console.log('\n--- 最も多くスワイプされた商品TOP5 ---');
      for (let i = 0; i < sortedProducts.length; i++) {
        const [productId, count] = sortedProducts[i];
        console.log(`${i + 1}. ${productId}: ${count}回`);
      }
      
      // 5. ユーザー別のスワイプ数
      const { data: userSwipes } = await supabase
        .from('swipes')
        .select('user_id');
      
      if (userSwipes) {
        const userSwipeCount = {};
        userSwipes.forEach(s => {
          userSwipeCount[s.user_id] = (userSwipeCount[s.user_id] || 0) + 1;
        });
        
        console.log('\n--- ユーザー別スワイプ数 ---');
        Object.entries(userSwipeCount)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .forEach(([userId, count], i) => {
            console.log(`${i + 1}. ${userId}: ${count}件`);
          });
      }
      
      // 6. 最初の商品を確認
      const { data: firstProducts } = await supabase
        .from('external_products')
        .select('id, title')
        .order('created_at', { ascending: false })
        .limit(10);
      
      console.log('\n--- 最初に表示される商品10件 ---');
      if (firstProducts) {
        firstProducts.forEach((product, i) => {
          const isSwipedCount = productSwipeCount[product.id] || 0;
          console.log(`${i + 1}. ${product.id} - スワイプ回数: ${isSwipedCount}回`);
        });
      }
    }
    
  } catch (error) {
    console.error('❌ エラーが発生しました:', error);
  }
}

// 実行
checkSwipeData().then(() => {
  console.log('\n調査完了');
  process.exit(0);
}).catch(error => {
  console.error('エラー:', error);
  process.exit(1);
});
