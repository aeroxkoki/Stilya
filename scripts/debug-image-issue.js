const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function debugImageIssue() {
  console.log('=== Debugging Image Display Issue ===\n');
  
  try {
    // 1. データベースの商品数を確認
    const { count: totalCount, error: countError } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    if (countError) {
      console.error('Error counting products:', countError);
      return;
    }
    
    console.log(`Total active products in database: ${totalCount}\n`);
    
    // 2. 画像URLの状態を確認
    const { data: imageStats, error: imageStatsError } = await supabase
      .from('external_products')
      .select('id, title, image_url, brand, source')
      .eq('is_active', true)
      .limit(10);
    
    if (imageStatsError) {
      console.error('Error fetching image stats:', imageStatsError);
      return;
    }
    
    console.log('Sample products with image URLs:');
    console.log('================================');
    
    imageStats.forEach((product, index) => {
      console.log(`\n${index + 1}. ${product.title} (${product.brand})`);
      console.log(`   ID: ${product.id}`);
      console.log(`   Source: ${product.source}`);
      console.log(`   Image URL: ${product.image_url ? product.image_url.substring(0, 100) + '...' : 'NULL or EMPTY'}`);
      
      // 画像URLの問題をチェック
      if (!product.image_url) {
        console.log('   ⚠️  WARNING: No image URL');
      } else if (product.image_url.startsWith('http://')) {
        console.log('   ⚠️  WARNING: HTTP URL (needs HTTPS)');
      } else if (!product.image_url.includes('rakuten') && !product.image_url.includes('https://')) {
        console.log('   ⚠️  WARNING: Invalid URL format');
      } else {
        console.log('   ✅ Image URL looks valid');
      }
    });
    
    // 3. 画像URLがNULLまたは空の商品数を確認
    const { count: nullImageCount, error: nullImageError } = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .or('image_url.is.null,image_url.eq.');
    
    if (!nullImageError) {
      console.log(`\n\nProducts with NULL or empty image URLs: ${nullImageCount}/${totalCount}`);
      
      if (nullImageCount > 0) {
        console.log('⚠️  WARNING: Some products have missing image URLs');
      }
    }
    
    // 4. HTTPのURLを持つ商品数を確認
    const { data: httpProducts, error: httpError } = await supabase
      .from('external_products')
      .select('id, title, image_url')
      .eq('is_active', true)
      .like('image_url', 'http://%')
      .limit(5);
    
    if (!httpError && httpProducts.length > 0) {
      console.log(`\n\n⚠️  Found ${httpProducts.length} products with HTTP URLs (should be HTTPS):`);
      httpProducts.forEach(p => {
        console.log(`   - ${p.title}: ${p.image_url.substring(0, 50)}...`);
      });
    }
    
    // 5. 楽天の画像URLのパターンを確認
    const { data: rakutenProducts, error: rakutenError } = await supabase
      .from('external_products')
      .select('id, title, image_url, source')
      .eq('is_active', true)
      .like('image_url', '%rakuten%')
      .limit(5);
    
    if (!rakutenError && rakutenProducts.length > 0) {
      console.log(`\n\nRakuten image URL patterns:`);
      console.log('============================');
      rakutenProducts.forEach(p => {
        console.log(`\n${p.title}`);
        console.log(`  URL: ${p.image_url}`);
        
        // URLパターンを分析
        if (p.image_url.includes('thumbnail.image.rakuten.co.jp')) {
          console.log('  Pattern: thumbnail.image.rakuten.co.jp');
          if (!p.image_url.includes('_ex=')) {
            console.log('  ⚠️  Missing size parameter (_ex=)');
          }
        } else if (p.image_url.includes('shop.r10s.jp')) {
          console.log('  Pattern: shop.r10s.jp');
        } else if (p.image_url.includes('image.rakuten.co.jp')) {
          console.log('  Pattern: image.rakuten.co.jp');
        }
      });
    }
    
    // 6. 最新の同期日時を確認
    const { data: latestSync, error: syncError } = await supabase
      .from('external_products')
      .select('last_synced')
      .eq('is_active', true)
      .order('last_synced', { ascending: false })
      .limit(1);
    
    if (!syncError && latestSync.length > 0) {
      console.log(`\n\nLatest sync: ${new Date(latestSync[0].last_synced).toLocaleString()}`);
    }
    
    console.log('\n\n=== Debug Complete ===');
    
  } catch (error) {
    console.error('Unexpected error during debug:', error);
  }
}

debugImageIssue().catch(console.error);
