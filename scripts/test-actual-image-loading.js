const { createClient } = require('@supabase/supabase-js');
const fetch = require('node-fetch');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testActualImageLoading() {
  console.log('=== Testing Actual Image Loading ===\n');
  
  try {
    // 1. データベースから商品を取得
    const { data: products, error } = await supabase
      .from('external_products')
      .select('id, title, image_url')
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .limit(3);
    
    if (error) {
      console.error('Error fetching products:', error);
      return;
    }
    
    console.log(`Testing ${products.length} product images...\n`);
    
    // 2. 各画像URLの実際のアクセス可能性をテスト
    for (const product of products) {
      console.log(`\nProduct: ${product.title.substring(0, 50)}...`);
      console.log(`URL: ${product.image_url}`);
      
      try {
        // 画像をフェッチ
        const response = await fetch(product.image_url);
        
        console.log(`  Status: ${response.status} ${response.statusText}`);
        console.log(`  Content-Type: ${response.headers.get('content-type')}`);
        console.log(`  Content-Length: ${response.headers.get('content-length')} bytes`);
        
        if (response.ok) {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.startsWith('image/')) {
            console.log('  ✅ Image is accessible and valid');
          } else {
            console.log(`  ⚠️ Unexpected content type: ${contentType}`);
          }
        } else {
          console.log(`  ❌ Failed to load image: ${response.status}`);
        }
        
        // CORSヘッダーをチェック
        const accessControl = response.headers.get('access-control-allow-origin');
        if (accessControl) {
          console.log(`  CORS: ${accessControl}`);
        } else {
          console.log('  CORS: No Access-Control-Allow-Origin header');
        }
        
      } catch (fetchError) {
        console.error(`  ❌ Error fetching image:`, fetchError.message);
      }
    }
    
    console.log('\n\n=== Testing Image URL Optimization ===\n');
    
    // 3. imageUtils.tsの最適化ロジックをテスト
    const testUrls = [
      products[0]?.image_url,
      'https://thumbnail.image.rakuten.co.jp/@0_mall/test/image.jpg',
      'https://thumbnail.image.rakuten.co.jp/@0_mall/test/image.jpg?_ex=800x800',
      'https://thumbnail.image.rakuten.co.jp/@0_mall/test/image.jpg?param=value',
    ];
    
    for (const url of testUrls) {
      if (!url) continue;
      
      console.log(`\nOriginal: ${url}`);
      
      let optimized = url;
      
      // 最適化ロジックを再現
      if (url.includes('thumbnail.image.rakuten.co.jp')) {
        if (url.includes('?_ex=')) {
          console.log('  → Already has _ex parameter, keeping as is');
        } else if (url.includes('?')) {
          optimized = url + '&_ex=800x800';
          console.log('  → Added _ex to existing query');
        } else {
          optimized = url + '?_ex=800x800';
          console.log('  → Added new _ex parameter');
        }
      }
      
      console.log(`Optimized: ${optimized}`);
    }
    
    console.log('\n=== Test Complete ===');
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testActualImageLoading().catch(console.error);
