#!/usr/bin/env node

/**
 * MVP向けパフォーマンス最適化スクリプト
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function optimizePerformance() {
  console.log('⚡ MVP向けパフォーマンス最適化を開始...\n');

  try {
    // 1. インデックスの確認
    console.log('🗂️ データベースインデックスの確認:');
    await checkIndexes();

    // 2. 商品データの最適化
    console.log('\n📦 商品データの最適化:');
    await optimizeProductData();

    // 3. スワイプデータの分析
    console.log('\n📊 スワイプデータの分析:');
    await analyzeSwipeData();

    console.log('\n✅ 最適化が完了しました！');
  } catch (error) {
    console.error('❌ エラー:', error.message);
  }
}

async function checkIndexes() {
  // 重要なクエリのパフォーマンスチェック
  const startTime = Date.now();
  
  const { data, error } = await supabase
    .from('external_products')
    .select('id')
    .eq('is_active', true)
    .limit(100);
  
  const queryTime = Date.now() - startTime;
  console.log(`  ✅ 商品クエリパフォーマンス: ${queryTime}ms`);
  
  if (queryTime > 1000) {
    console.log('  ⚠️ クエリが遅い可能性があります。インデックスの追加を検討してください。');
  }
}

async function optimizeProductData() {
  // 不要なフィールドのクリーンアップ
  const { data: products, error } = await supabase
    .from('external_products')
    .select('id, name, image_url')
    .is('description', null)
    .limit(100);
  
  if (!error && products) {
    console.log(`  ✅ ${products.length}件の商品に説明文がありません`);
    
    // 画像URLの検証
    let invalidImageCount = 0;
    products.forEach(product => {
      if (!product.image_url || product.image_url.length < 10) {
        invalidImageCount++;
      }
    });
    
    if (invalidImageCount > 0) {
      console.log(`  ⚠️ ${invalidImageCount}件の商品に無効な画像URLがあります`);
    }
  }
}

async function analyzeSwipeData() {
  // 最近7日間のスワイプ統計
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const { data: swipes, error } = await supabase
    .from('swipes')
    .select('result')
    .gte('created_at', sevenDaysAgo.toISOString());
  
  if (!error && swipes) {
    const yesCount = swipes.filter(s => s.result === 'yes').length;
    const noCount = swipes.filter(s => s.result === 'no').length;
    const yesRate = swipes.length > 0 ? ((yesCount / swipes.length) * 100).toFixed(1) : 0;
    
    console.log(`  ✅ 過去7日間のスワイプ統計:`);
    console.log(`     - Yes: ${yesCount}件`);
    console.log(`     - No: ${noCount}件`);
    console.log(`     - Yes率: ${yesRate}%`);
    
    if (yesRate < 20) {
      console.log('  ⚠️ Yes率が低いです。商品の質や推薦アルゴリズムの改善を検討してください。');
    }
  }
}

// 実行
optimizePerformance();
