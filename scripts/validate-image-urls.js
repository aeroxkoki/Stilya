require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function validateImageUrls() {
  console.log('🔍 Validating image URLs...\n');

  try {
    // 画像URLがHTTPSを使用しているか確認
    const { data: httpProducts } = await supabase
      .from('external_products')
      .select('id, title, image_url')
      .like('image_url', 'http://%')
      .limit(10);

    if (httpProducts && httpProducts.length > 0) {
      console.log('⚠️ Found products with HTTP URLs:');
      for (const product of httpProducts) {
        console.log(`- ${product.id}: ${product.image_url}`);
      }

      // HTTPSに変換
      console.log('\n🔧 Converting HTTP to HTTPS...');
      const { error } = await supabase
        .from('external_products')
        .update({ 
          image_url: supabase.sql`REPLACE(image_url, 'http://', 'https://')`
        })
        .like('image_url', 'http://%');

      if (error) {
        console.error('❌ Error converting URLs:', error);
      } else {
        console.log('✅ Converted all HTTP URLs to HTTPS');
      }
    } else {
      console.log('✅ All image URLs are already using HTTPS');
    }

    // 画像URLのドメインを集計
    const { data: allProducts } = await supabase
      .from('external_products')
      .select('image_url')
      .not('image_url', 'is', null)
      .not('image_url', 'eq', '');

    const domains = new Map();
    for (const product of allProducts || []) {
      try {
        const url = new URL(product.image_url);
        const domain = url.hostname;
        domains.set(domain, (domains.get(domain) || 0) + 1);
      } catch (e) {
        // Invalid URL
      }
    }

    console.log('\n📊 Image URL domains:');
    for (const [domain, count] of domains) {
      console.log(`- ${domain}: ${count} images`);
    }

    // 楽天画像URLのプロトコルを確認
    const { data: rakutenSample } = await supabase
      .from('external_products')
      .select('id, image_url')
      .like('image_url', '%rakuten%')
      .limit(5);

    console.log('\n🔍 Sample Rakuten image URLs:');
    for (const product of rakutenSample || []) {
      console.log(`- ${product.image_url}`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// 実行
validateImageUrls();
