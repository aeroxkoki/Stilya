const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

// randomUtils.jsからコピー
function getTimeBasedOffset() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const minutesSinceStartOfDay = Math.floor((now.getTime() - startOfDay.getTime()) / (1000 * 60));
  
  // 5分ごとに異なるオフセット（0-287の範囲）
  const offsetIndex = Math.floor(minutesSinceStartOfDay / 5);
  
  // 各offsetIndexに対して異なる乱数を生成
  const seed = offsetIndex * 7919; // 素数を使用
  const randomOffset = (seed % 500) * 10; // 0-4990の範囲で10刻み
  
  return randomOffset;
}

async function simulateProductFetching() {
  try {
    console.log('Simulating product fetching logic...\n');
    
    const limit = 20;
    const offset = 0;
    
    // fetchMixedProductsのロジックをシミュレート
    const randomCount = Math.floor(limit * 0.7); // 14
    const personalizedCount = limit - randomCount; // 6
    
    console.log(`Mixed products split - Random: ${randomCount}, Personalized: ${personalizedCount}`);
    
    // 1. fetchRandomizedProductsのシミュレーション
    console.log('\n--- Simulating fetchRandomizedProducts ---');
    const timeOffset = getTimeBasedOffset();
    const actualOffset = offset + timeOffset;
    const poolSize = randomCount * 3; // 42
    
    console.log(`Time offset: ${timeOffset}`);
    console.log(`Actual offset: ${actualOffset}`);
    console.log(`Pool size: ${poolSize}`);
    console.log(`Query range: ${actualOffset} to ${actualOffset + poolSize - 1}`);
    
    // ランダム商品の取得をシミュレート
    const randomOrder = Math.random() > 0.5 ? 'created_at' : 'last_synced';
    const randomDirection = Math.random() > 0.5;
    
    console.log(`Order by: ${randomOrder}, Ascending: ${randomDirection}`);
    
    const { data: randomProducts, error: randomError } = await supabase
      .from('external_products')
      .select('id, title, source')
      .eq('is_active', true)
      .order(randomOrder, { ascending: randomDirection })
      .range(actualOffset, actualOffset + poolSize - 1);
      
    if (randomError) {
      console.error('Random products error:', randomError);
    } else {
      console.log(`\nRandom products fetched: ${randomProducts?.length || 0}`);
      if (randomProducts && randomProducts.length > 0) {
        console.log('First 3 random products:');
        randomProducts.slice(0, 3).forEach((p, i) => {
          console.log(`  ${i + 1}. ${p.title} (${p.source})`);
        });
      }
    }
    
    // 2. fetchPersonalizedProductsのシミュレーション（スワイプ履歴なしの場合）
    console.log('\n--- Simulating fetchPersonalizedProducts (no swipe history) ---');
    
    // スワイプ履歴がないので、通常のfetchProductsにフォールバック
    const { data: personalizedProducts, error: personalizedError } = await supabase
      .from('external_products')
      .select('id, title, source')
      .eq('is_active', true)
      .order('priority', { ascending: true, nullsFirst: false })
      .order('last_synced', { ascending: false })
      .range(offset, offset + personalizedCount - 1);
      
    if (personalizedError) {
      console.error('Personalized products error:', personalizedError);
    } else {
      console.log(`\nPersonalized products fetched: ${personalizedProducts?.length || 0}`);
      if (personalizedProducts && personalizedProducts.length > 0) {
        console.log('First 3 personalized products:');
        personalizedProducts.slice(0, 3).forEach((p, i) => {
          console.log(`  ${i + 1}. ${p.title} (${p.source})`);
        });
      }
    }
    
    // 3. 合計を確認
    const totalFetched = (randomProducts?.length || 0) + (personalizedProducts?.length || 0);
    console.log(`\nTotal products that would be fetched: ${totalFetched}`);
    
    // 4. 次のページの取得をシミュレート
    console.log('\n--- Simulating next page fetch ---');
    const nextOffset = offset + limit; // 20
    const nextActualOffset = nextOffset + timeOffset;
    
    console.log(`Next page offset: ${nextOffset}`);
    console.log(`Next actual offset: ${nextActualOffset}`);
    console.log(`Next query range: ${nextActualOffset} to ${nextActualOffset + poolSize - 1}`);
    
    const { data: nextRandomProducts } = await supabase
      .from('external_products')
      .select('id')
      .eq('is_active', true)
      .order(randomOrder, { ascending: randomDirection })
      .range(nextActualOffset, nextActualOffset + poolSize - 1);
      
    console.log(`Next page would fetch: ${nextRandomProducts?.length || 0} random products`);
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

simulateProductFetching();
