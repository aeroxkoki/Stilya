const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function fixMissingSourceData() {
  try {
    console.log('Fixing missing source data...\n');
    
    // sourceがnullの商品を取得
    const { data: nullSourceProducts, error: fetchError } = await supabase
      .from('external_products')
      .select('id, title, brand, source')
      .is('source', null);
      
    if (fetchError) {
      console.error('Error fetching null source products:', fetchError);
      return;
    }
    
    if (!nullSourceProducts || nullSourceProducts.length === 0) {
      console.log('No products with null source found.');
      return;
    }
    
    console.log(`Found ${nullSourceProducts.length} products with null source`);
    
    // バッチ処理でsource情報を更新
    const updatePromises = [];
    const batchSize = 100;
    
    for (let i = 0; i < nullSourceProducts.length; i += batchSize) {
      const batch = nullSourceProducts.slice(i, i + batchSize);
      const updateBatch = batch.map(product => ({
        id: product.id,
        source: 'rakuten' // デフォルトで楽天に設定
      }));
      
      const promise = supabase
        .from('external_products')
        .upsert(updateBatch, { onConflict: 'id' })
        .then(({ error }) => {
          if (error) {
            console.error(`Error updating batch ${i/batchSize + 1}:`, error);
          } else {
            console.log(`Updated batch ${i/batchSize + 1} (${updateBatch.length} products)`);
          }
        });
        
      updatePromises.push(promise);
    }
    
    // すべての更新を待つ
    await Promise.all(updatePromises);
    
    // 更新後の確認
    const { count: updatedCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('source', 'rakuten');
      
    console.log(`\nUpdate complete. Total products with 'rakuten' source: ${updatedCount}`);
    
    // 各ソースの最終的な商品数を確認
    const { data: allProducts } = await supabase
      .from('external_products')
      .select('source');
      
    const sourceCounts = {};
    allProducts.forEach(product => {
      const source = product.source || 'NULL';
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });
    
    console.log('\nFinal product count by source:');
    Object.entries(sourceCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([source, count]) => {
        console.log(`  ${source}: ${count}`);
      });
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

// 実行
fixMissingSourceData();
