const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProductCount() {
  try {
    console.log('Checking product count in database...\n');
    
    // 総商品数を確認
    const { count: totalCount, error: countError } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error('Error counting products:', countError);
      return;
    }
    
    console.log(`Total products in database: ${totalCount}`);
    
    // アクティブな商品数を確認
    const { count: activeCount, error: activeError } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
      
    if (activeError) {
      console.error('Error counting active products:', activeError);
      return;
    }
    
    console.log(`Active products: ${activeCount}`);
    
    // ソース別の商品数を確認
    const { data: sources, error: sourceError } = await supabase
      .from('external_products')
      .select('source')
      .eq('is_active', true);
      
    if (sourceError) {
      console.error('Error fetching sources:', sourceError);
      return;
    }
    
    const sourceCounts = {};
    sources.forEach(item => {
      sourceCounts[item.source] = (sourceCounts[item.source] || 0) + 1;
    });
    
    console.log('\nProducts by source:');
    Object.entries(sourceCounts).forEach(([source, count]) => {
      console.log(`  ${source}: ${count}`);
    });
    
    // 最新の商品10件を表示
    const { data: latestProducts, error: latestError } = await supabase
      .from('external_products')
      .select('id, title, brand, source, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(10);
      
    if (latestError) {
      console.error('Error fetching latest products:', latestError);
      return;
    }
    
    console.log('\nLatest 10 products:');
    latestProducts.forEach((product, index) => {
      console.log(`${index + 1}. ${product.title} (${product.brand}) - ${product.source} - ${new Date(product.created_at).toLocaleDateString()}`);
    });
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

checkProductCount();
