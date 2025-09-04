#!/usr/bin/env node

/**
 * スワイプ問題のテストスクリプト
 * 2枚目のカードがスワイプできない問題を調査
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProductFetching() {
  console.log('\n🔍 商品取得テスト開始...\n');
  
  try {
    // 最初の100件を取得
    const { data: firstBatch, error: firstError } = await supabase
      .from('external_products')
      .select('*')
      .not('image_url', 'is', null)
      .limit(100)
      .order('created_at', { ascending: false });
    
    if (firstError) throw firstError;
    
    console.log('✅ 最初のバッチ:', firstBatch.length, '商品');
    
    if (firstBatch.length > 0) {
      console.log('  最初の商品:', firstBatch[0].title);
      console.log('  最初の商品ID:', firstBatch[0].id);
    }
    
    // オフセットを使って次の100件を取得
    const { data: secondBatch, error: secondError } = await supabase
      .from('external_products')
      .select('*')
      .not('image_url', 'is', null)
      .limit(100)
      .range(100, 199)
      .order('created_at', { ascending: false });
    
    if (secondError) throw secondError;
    
    console.log('✅ 2番目のバッチ:', secondBatch.length, '商品');
    
    if (secondBatch.length > 0) {
      console.log('  最初の商品:', secondBatch[0].title);
      console.log('  最初の商品ID:', secondBatch[0].id);
    }
    
    // IDの重複チェック
    const firstBatchIds = new Set(firstBatch.map(p => p.id));
    const duplicates = secondBatch.filter(p => firstBatchIds.has(p.id));
    
    if (duplicates.length > 0) {
      console.log('⚠️ 重複商品が見つかりました:', duplicates.length, '件');
      duplicates.forEach(p => {
        console.log('  重複ID:', p.id, '商品名:', p.title);
      });
    } else {
      console.log('✅ 重複商品はありません');
    }
    
    // 連続取得のテスト
    console.log('\n📦 連続取得テスト...');
    const allProducts = [];
    for (let i = 0; i < 5; i++) {
      const offset = i * 50;
      const { data, error } = await supabase
        .from('external_products')
        .select('id, title')
        .not('image_url', 'is', null)
        .limit(50)
        .range(offset, offset + 49)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.log(`❌ バッチ ${i + 1} エラー:`, error);
        continue;
      }
      
      allProducts.push(...data);
      console.log(`  バッチ ${i + 1}:`, data.length, '商品 (合計:', allProducts.length, ')');
    }
    
    // ユニークIDの確認
    const uniqueIds = new Set(allProducts.map(p => p.id));
    console.log('\n📊 統計情報:');
    console.log('  取得した商品総数:', allProducts.length);
    console.log('  ユニーク商品数:', uniqueIds.size);
    console.log('  重複数:', allProducts.length - uniqueIds.size);
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

async function testSwipeHistory(userId = '73bb22f3-dab0-44f6-af66-01f4c456e3f3') {
  console.log('\n🎯 スワイプ履歴テスト...\n');
  
  try {
    const { data: swipes, error } = await supabase
      .from('swipes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);
    
    if (error) throw error;
    
    console.log('📝 最新のスワイプ履歴:', swipes.length, '件');
    
    if (swipes.length > 0) {
      console.log('\n最新5件のスワイプ:');
      swipes.slice(0, 5).forEach((swipe, index) => {
        console.log(`  ${index + 1}. 商品ID: ${swipe.product_id}`);
        console.log(`     結果: ${swipe.result}`);
        console.log(`     時刻: ${new Date(swipe.created_at).toLocaleString('ja-JP')}`);
      });
    }
    
    // 同じ商品を複数回スワイプしているかチェック
    const productCounts = {};
    swipes.forEach(swipe => {
      productCounts[swipe.product_id] = (productCounts[swipe.product_id] || 0) + 1;
    });
    
    const duplicateSwipes = Object.entries(productCounts).filter(([_, count]) => count > 1);
    
    if (duplicateSwipes.length > 0) {
      console.log('\n⚠️ 複数回スワイプされた商品:');
      duplicateSwipes.forEach(([productId, count]) => {
        console.log(`  商品ID ${productId}: ${count}回`);
      });
    } else {
      console.log('\n✅ 重複スワイプはありません');
    }
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

// メイン実行
(async () => {
  console.log('=====================================');
  console.log('   Stilya スワイプ問題診断ツール    ');
  console.log('=====================================');
  
  await testProductFetching();
  await testSwipeHistory();
  
  console.log('\n✅ テスト完了\n');
})();
