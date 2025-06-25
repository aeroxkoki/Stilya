#!/usr/bin/env node

/**
 * 商品取得プロセスのデバッグスクリプト
 * fetchMixedProductsの動作を検証
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

// fetchMixedProductsの簡易実装
async function fetchRandomizedProducts(limit = 20, offset = 0, filters = {}) {
  console.log('\n🔄 fetchRandomizedProducts呼び出し:', { limit, offset, filters });
  
  let query = supabase
    .from('external_products')
    .select('*')
    .eq('is_active', true);
  
  // フィルター適用
  if (filters.includeUsed === false) {
    query = query.eq('is_used', false);
  }
  
  // 総数を取得
  const { count: totalCount } = await query
    .select('id', { count: 'exact', head: true });
  
  console.log('📊 フィルター後の総商品数:', totalCount);
  
  // 実際のデータを取得
  const { data, error } = await query
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  
  if (error) {
    console.error('❌ エラー:', error);
    return { success: false, error: error.message };
  }
  
  console.log(`✅ 取得成功: ${data?.length || 0}件`);
  return { success: true, data: data || [] };
}

async function fetchPersonalizedProducts(userId, limit = 20, offset = 0, filters = {}) {
  console.log('\n🎯 fetchPersonalizedProducts呼び出し:', { userId, limit, offset, filters });
  
  // スワイプ履歴を取得
  const { data: swipeData } = await supabase
    .from('swipes')
    .select('product_id, result')
    .eq('user_id', userId)
    .eq('result', 'yes')
    .limit(100);
  
  console.log('👍 Yesスワイプ数:', swipeData?.length || 0);
  
  if (!swipeData || swipeData.length === 0) {
    console.log('🔄 スワイプ履歴なし、通常の商品取得にフォールバック');
    return fetchRandomizedProducts(limit, offset, filters);
  }
  
  // 通常の商品取得
  return fetchRandomizedProducts(limit, offset, filters);
}

async function fetchMixedProducts(userId = null, limit = 20, offset = 0, filters = {}) {
  console.log('\n🌀 fetchMixedProducts呼び出し:', { userId, limit, offset, filters });
  
  const randomCount = Math.floor(limit * 0.7);
  const personalizedCount = limit - randomCount;
  
  console.log('📊 商品の内訳 - ランダム:', randomCount, 'パーソナライズ:', personalizedCount);
  
  // 並列で両方の商品を取得
  const [randomResult, personalizedResult] = await Promise.all([
    fetchRandomizedProducts(randomCount, offset, filters),
    userId 
      ? fetchPersonalizedProducts(userId, personalizedCount, Math.floor(offset * 1.5), filters)
      : fetchRandomizedProducts(personalizedCount, Math.floor(offset * 1.5), filters)
  ]);
  
  console.log('\n📦 結果:');
  console.log('ランダム商品:', randomResult.success ? `${randomResult.data.length}件` : 'エラー');
  console.log('パーソナライズ商品:', personalizedResult.success ? `${personalizedResult.data.length}件` : 'エラー');
  
  const randomProducts = randomResult.success ? randomResult.data : [];
  const personalizedProducts = personalizedResult.success ? personalizedResult.data : [];
  
  // 重複除去
  const productIdSet = new Set();
  const uniqueProducts = [];
  
  [...randomProducts, ...personalizedProducts].forEach(product => {
    if (!productIdSet.has(product.id)) {
      productIdSet.add(product.id);
      uniqueProducts.push(product);
    }
  });
  
  console.log('🎯 重複除去後の商品数:', uniqueProducts.length);
  
  return { success: true, data: uniqueProducts.slice(0, limit) };
}

// メインの実行関数
async function debugProductFetching() {
  console.log('🚀 商品取得のデバッグを開始します...\n');
  
  // 1. 通常の商品取得（新品のみ）
  console.log('=== テスト1: 新品のみの商品取得 ===');
  const result1 = await fetchMixedProducts(null, 20, 0, { includeUsed: false });
  console.log('最終結果:', result1.success ? `${result1.data.length}件の商品を取得` : 'エラー');
  
  // 2. 中古品を含む商品取得
  console.log('\n=== テスト2: 新品・中古品を含む商品取得 ===');
  const result2 = await fetchMixedProducts(null, 20, 0, { includeUsed: true });
  console.log('最終結果:', result2.success ? `${result2.data.length}件の商品を取得` : 'エラー');
  
  // 3. フィルターなしの商品取得
  console.log('\n=== テスト3: フィルターなしの商品取得 ===');
  const result3 = await fetchMixedProducts(null, 20, 0, {});
  console.log('最終結果:', result3.success ? `${result3.data.length}件の商品を取得` : 'エラー');
  
  // 4. 直接データベースから商品数を確認
  console.log('\n=== データベースの状態確認 ===');
  const { count: totalCount } = await supabase
    .from('external_products')
    .select('id', { count: 'exact', head: true });
  
  const { count: activeCount } = await supabase
    .from('external_products')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true);
  
  const { count: newCount } = await supabase
    .from('external_products')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true)
    .eq('is_used', false);
  
  const { count: usedCount } = await supabase
    .from('external_products')
    .select('id', { count: 'exact', head: true })
    .eq('is_active', true)
    .eq('is_used', true);
  
  console.log('📊 総商品数:', totalCount);
  console.log('✅ アクティブ商品数:', activeCount);
  console.log('🆕 新品商品数:', newCount);
  console.log('♻️  中古品商品数:', usedCount);
  
  // 5. サンプル商品を表示
  console.log('\n=== サンプル商品（最新10件） ===');
  const { data: sampleProducts } = await supabase
    .from('external_products')
    .select('id, title, brand, is_used, is_active')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(10);
  
  sampleProducts?.forEach((p, i) => {
    console.log(`${i + 1}. ${p.title} (${p.brand}) - ${p.is_used ? '中古' : '新品'}`);
  });
}

// 実行
debugProductFetching()
  .then(() => {
    console.log('\n✅ デバッグ完了');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n❌ エラー:', error);
    process.exit(1);
  });
