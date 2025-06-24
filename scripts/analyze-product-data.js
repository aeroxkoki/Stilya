const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function analyzeProductData() {
  try {
    console.log('Analyzing product data...\n');
    
    // ソースがnullまたは空の商品数を確認
    const { count: nullSourceCount, error: nullError } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .is('source', null);
      
    if (nullError) {
      console.error('Error counting null source products:', nullError);
    } else {
      console.log(`Products with NULL source: ${nullSourceCount}`);
    }
    
    // 空文字のソースを確認
    const { count: emptySourceCount, error: emptyError } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('source', '');
      
    if (emptyError) {
      console.error('Error counting empty source products:', emptyError);
    } else {
      console.log(`Products with empty source: ${emptySourceCount}`);
    }
    
    // ソース別の詳細な商品数を確認
    const { data: products, error: productError } = await supabase
      .from('external_products')
      .select('source')
      .eq('is_active', true);
      
    if (productError) {
      console.error('Error fetching products:', productError);
      return;
    }
    
    const sourceCounts = {};
    products.forEach(product => {
      const source = product.source || 'NULL';
      sourceCounts[source] = (sourceCounts[source] || 0) + 1;
    });
    
    console.log('\nDetailed product count by source:');
    Object.entries(sourceCounts)
      .sort(([,a], [,b]) => b - a)
      .forEach(([source, count]) => {
        console.log(`  ${source}: ${count}`);
      });
    
    // 商品のサンプルを取得して構造を確認
    const { data: sampleProducts, error: sampleError } = await supabase
      .from('external_products')
      .select('*')
      .is('source', null)
      .limit(5);
      
    if (!sampleError && sampleProducts && sampleProducts.length > 0) {
      console.log('\nSample products with NULL source:');
      sampleProducts.forEach((product, index) => {
        console.log(`\n${index + 1}. ${product.title} (${product.brand})`);
        console.log(`   ID: ${product.id}`);
        console.log(`   Price: ¥${product.price}`);
        console.log(`   Created: ${new Date(product.created_at).toLocaleDateString()}`);
        console.log(`   Tags: ${product.tags ? product.tags.join(', ') : 'None'}`);
      });
    }
    
    // productServiceのfetchMixedProductsで使用されるクエリをシミュレート
    console.log('\nSimulating fetchMixedProducts query...');
    const { data: simulatedData, error: simulatedError, count } = await supabase
      .from('external_products')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('priority', { ascending: true, nullsFirst: false })
      .order('last_synced', { ascending: false })
      .range(0, 19);
      
    if (simulatedError) {
      console.error('Simulated query error:', simulatedError);
    } else {
      console.log(`\nSimulated query returned ${simulatedData?.length || 0} products out of ${count} total`);
      if (simulatedData && simulatedData.length > 0) {
        console.log('First 5 products from simulated query:');
        simulatedData.slice(0, 5).forEach((product, index) => {
          console.log(`${index + 1}. ${product.title} - source: ${product.source || 'NULL'}`);
        });
      }
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

analyzeProductData();
