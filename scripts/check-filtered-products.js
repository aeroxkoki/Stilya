const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Environment variables not found');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkFilteredProducts() {
  console.log('Checking filtered product counts...\n');

  try {
    // is_active = true の商品数
    const { count: activeCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    console.log(`Active products (is_active = true): ${activeCount}`);

    // is_used = false の商品数（新品のみ）
    const { count: newProductsCount } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('is_used', false);

    console.log(`New products (is_used = false): ${newProductsCount}`);

    // カテゴリ別の商品数
    console.log('\nProducts by category:');
    const categories = ['トップス', 'ボトムス', 'ワンピース', 'スカート', 'アウター', 'バッグ', 'シューズ', 'アクセサリー'];
    
    for (const category of categories) {
      const { count } = await supabase
        .from('external_products')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)
        .eq('category', category);
      
      if (count > 0) {
        console.log(`  ${category}: ${count}`);
      }
    }

    // offset別の商品取得テスト
    console.log('\nTesting different offsets:');
    const poolSize = 60; // limit * 3
    
    for (let offset = 0; offset <= 300; offset += 60) {
      const { data, error } = await supabase
        .from('external_products')
        .select('id, title')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .range(offset, offset + poolSize - 1);
      
      if (error) {
        console.log(`  Offset ${offset}: Error - ${error.message}`);
      } else {
        console.log(`  Offset ${offset}: ${data.length} products fetched`);
      }
    }

    // 循環offset計算のテスト
    console.log('\nTesting circular offset calculation:');
    const totalCount = activeCount || 0;
    const maxOffset = Math.max(0, totalCount - poolSize);
    
    for (let page = 0; page <= 10; page++) {
      const offset = page * 20;
      const timeOffset = 230; // 固定値でテスト
      const actualOffset = maxOffset > 0 ? (offset + timeOffset) % maxOffset : 0;
      
      console.log(`  Page ${page}: offset=${offset}, actualOffset=${actualOffset}`);
    }

  } catch (error) {
    console.error('Error:', error);
  }
}

checkFilteredProducts();
