#!/usr/bin/env node

/**
 * 実際のfetchMixedProductsの動作を詳細にトレース
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ 環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 実際のfetchRandomizedProductsの簡易版
async function testFetchRandomizedProducts(limit = 20, offset = 0, filters = {}) {
  console.log('\n🔄 fetchRandomizedProducts詳細トレース');
  console.log('入力:', { limit, offset, filters });
  
  // 時間ベースのオフセット（実際のコードと同じロジック）
  const timeOffset = new Date().getHours() % 24;
  const adjustedOffset = offset + timeOffset;
  
  // poolSizeの計算
  const poolSize = limit * 3;
  
  console.log('計算値:', {
    timeOffset,
    adjustedOffset,
    poolSize
  });
  
  // クエリの構築
  let query = supabase
    .from('external_products')
    .select('*')
    .eq('is_active', true);
  
  // フィルター適用
  if (filters.includeUsed === false) {
    query = query.eq('is_used', false);
  }
  
  // カウント取得（別クエリ）
  let countQuery = supabase
    .from('external_products')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true);
  
  if (filters.includeUsed === false) {
    countQuery = countQuery.eq('is_used', false);
  }
  
  const { count: totalCount } = await countQuery;
  console.log('総商品数:', totalCount);
  
  // offset調整
  let actualOffset = adjustedOffset;
  if (totalCount && actualOffset >= totalCount) {
    actualOffset = Math.floor(Math.random() * Math.max(0, totalCount - poolSize));
    console.log('オフセット調整:', actualOffset);
  }
  
  // 実際のデータ取得
  const randomOrder = Math.random() > 0.5 ? 'created_at' : 'last_synced';
  const randomDirection = Math.random() > 0.5;
  
  console.log('クエリ設定:', {
    order: randomOrder,
    ascending: randomDirection,
    rangeStart: actualOffset,
    rangeEnd: actualOffset + poolSize - 1
  });
  
  const { data, error } = await query
    .order(randomOrder, { ascending: randomDirection })
    .range(actualOffset, actualOffset + poolSize - 1);
  
  if (error) {
    console.error('❌ エラー:', error);
    return { success: false, error: error.message };
  }
  
  console.log('取得結果:', {
    要求数: poolSize,
    実際の取得数: data?.length || 0,
    rangeの問題: actualOffset + poolSize > totalCount ? `範囲超過: ${actualOffset + poolSize} > ${totalCount}` : 'OK'
  });
  
  // 最終的な商品数（limit分だけ返す）
  const finalProducts = data?.slice(0, limit) || [];
  console.log('最終商品数:', finalProducts.length);
  
  return { success: true, data: finalProducts };
}

// メイン実行
async function main() {
  console.log('🚀 fetchMixedProductsの動作詳細調査\n');
  
  // 実際のfetchMixedProductsと同じパラメータでテスト
  const limit = 20;
  const offset = 0;
  const filters = { includeUsed: false };
  
  const bufferMultiplier = 1.5;
  const randomCount = Math.floor(limit * 0.7 * bufferMultiplier);
  const personalizedCount = Math.floor(limit * 0.3 * bufferMultiplier);
  
  console.log('fetchMixedProductsのパラメータ:');
  console.log(`ランダム商品数: ${randomCount}`);
  console.log(`パーソナライズ商品数: ${personalizedCount}`);
  
  // ランダム商品の取得テスト
  const randomResult = await testFetchRandomizedProducts(randomCount, offset, filters);
  
  // パーソナライズ商品の取得テスト（通常のfetchProductsをシミュレート）
  console.log('\n📦 通常の商品取得（パーソナライズ用）');
  const { data: normalData, error: normalError } = await supabase
    .from('external_products')
    .select('*')
    .eq('is_active', true)
    .eq('is_used', false)
    .order('priority', { ascending: true })
    .order('last_synced', { ascending: false })
    .range(0, personalizedCount - 1);
  
  console.log('パーソナライズ商品取得結果:', normalData ? `${normalData.length}件` : 'エラー');
}

main()
  .then(() => {
    console.log('\n✅ 調査完了');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ エラー:', error);
    process.exit(1);
  });
