const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function deepAnalyzeProducts() {
  try {
    console.log('Deep analyzing product data...\n');
    
    // 1. 全商品数を確認（アクティブ・非アクティブ別）
    const { count: totalCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true });
      
    const { count: activeCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
      
    const { count: inactiveCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', false);
      
    console.log(`Total products: ${totalCount}`);
    console.log(`Active products: ${activeCount}`);
    console.log(`Inactive products: ${inactiveCount}`);
    
    // 2. ユニークなsource値を確認
    const { data: allSources, error: sourceError } = await supabase
      .from('external_products')
      .select('source')
      .limit(20000); // 大量のデータを取得
      
    if (sourceError) {
      console.error('Error fetching sources:', sourceError);
      return;
    }
    
    const uniqueSources = new Set();
    const sourceCounts = {};
    
    allSources.forEach(item => {
      const source = item.source;
      uniqueSources.add(source);
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });
    
    console.log('\nUnique source values:');
    Array.from(uniqueSources).forEach(source => {
      console.log(`  "${source}": ${sourceCounts[source]} products`);
    });
    
    // 3. スワイプ済み商品をフィルタリングした後の利用可能商品数を確認
    const { data: swipes } = await supabase
      .from('swipes')
      .select('product_id');
      
    const swipedProductIds = new Set(swipes?.map(s => s.product_id) || []);
    
    // 4. 最初の100件の商品を取得して、利用可能な商品を確認
    const { data: firstProducts } = await supabase
      .from('external_products')
      .select('id, title, source, is_active')
      .eq('is_active', true)
      .order('priority', { ascending: true, nullsFirst: false })
      .order('last_synced', { ascending: false })
      .limit(100);
      
    let availableCount = 0;
    let swipedCount = 0;
    
    firstProducts?.forEach(product => {
      if (swipedProductIds.has(product.id)) {
        swipedCount++;
      } else {
        availableCount++;
      }
    });
    
    console.log(`\nFirst 100 products analysis:`);
    console.log(`  Available (not swiped): ${availableCount}`);
    console.log(`  Already swiped: ${swipedCount}`);
    
    // 5. source別の商品分布を詳しく確認
    console.log('\nDetailed source distribution:');
    
    // sourceがnullまたは空文字の数を確認
    const { count: nullCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .is('source', null);
      
    const { count: emptyCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('source', '');
      
    console.log(`  NULL source: ${nullCount}`);
    console.log(`  Empty string source: ${emptyCount}`);
    
    // 6. 特定のsource値を持つ商品の総数を再確認
    const sourcesToCheck = ['rakuten', 'manual', 'test', 'sample_data'];
    
    for (const source of sourcesToCheck) {
      const { count } = await supabase
        .from('external_products')
        .select('*', { count: 'exact', head: true })
        .eq('source', source);
        
      console.log(`  ${source}: ${count}`);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

deepAnalyzeProducts();
