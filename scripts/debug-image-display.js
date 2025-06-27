require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugImageDisplay() {
  console.log('🔍 Starting image display debug...\n');

  try {
    // 1. 最新の商品を10件取得
    const { data: products, error } = await supabase
      .from('external_products')
      .select('id, title, image_url, source, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('❌ Error fetching products:', error);
      return;
    }

    console.log(`📦 Found ${products.length} products\n`);

    // 2. 各商品の画像URL情報を確認
    for (const product of products) {
      console.log('---');
      console.log(`📱 Product: ${product.title?.substring(0, 50)}...`);
      console.log(`🆔 ID: ${product.id}`);
      console.log(`🏷️ Source: ${product.source}`);
      console.log(`📅 Created: ${product.created_at}`);
      console.log(`🖼️ image_url: ${product.image_url || 'NULL/EMPTY'}`);
      
      // 画像URLの検証
      const imageUrl = product.image_url;
      if (!imageUrl) {
        console.log('❌ No image URL found!');
      } else {
        console.log(`✅ Image URL: ${imageUrl}`);
        
        // 楽天URLの場合の検証
        if (imageUrl.includes('rakuten')) {
          if (imageUrl.includes('thumbnail.image.rakuten.co.jp')) {
            console.log('⚠️ This is a thumbnail URL');
          } else if (imageUrl.includes('image.rakuten.co.jp')) {
            console.log('✅ This is a full-size image URL');
          }
        }
      }
      console.log('');
    }

    // 3. 画像URLがNULLまたは空の商品数を確認
    const { count: nullImageCount } = await supabase
      .from('external_products')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)
      .or('image_url.is.null,image_url.eq.');

    console.log(`\n📊 Statistics:`);
    console.log(`- Total active products with NULL/empty image_url: ${nullImageCount}`);

    // 4. 各sourceごとの画像URL状況を確認
    const { data: sourceStats } = await supabase
      .from('external_products')
      .select('source')
      .eq('is_active', true);

    const sourceCounts = {};
    for (const item of sourceStats || []) {
      sourceCounts[item.source] = (sourceCounts[item.source] || 0) + 1;
    }

    console.log('\n📊 Products by source:');
    for (const [source, count] of Object.entries(sourceCounts)) {
      console.log(`- ${source}: ${count} products`);
    }

    // 5. 画像URLが正しく設定されている商品の例を表示
    const { data: goodProducts } = await supabase
      .from('external_products')
      .select('id, title, image_url, source')
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .not('image_url', 'eq', '')
      .limit(5);

    console.log('\n✅ Products with valid image URLs:');
    for (const product of goodProducts || []) {
      console.log(`- ${product.title?.substring(0, 30)}... | ${product.image_url?.substring(0, 50)}...`);
    }

  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// 実行
debugImageDisplay();
