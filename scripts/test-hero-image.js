require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

async function testHeroImage() {
  console.log('📸 Testing Hero Image Display Issue...\n');
  
  try {
    // 1. ランダムな商品を取得（ヒーロー商品として使われるもの）
    console.log('1. Fetching products that could be used as hero...');
    const { data: products, error } = await supabase
      .from('products')
      .select('id, title, brand, price, imageUrl, category, tags, created_at')
      .order('created_at', { ascending: false })
      .limit(5);
    
    if (error) {
      console.error('Error fetching products:', error);
      return;
    }
    
    console.log(`Found ${products?.length || 0} products\n`);
    
    if (products && products.length > 0) {
      console.log('Hero Product Candidates:');
      console.log('========================');
      
      products.forEach((product, index) => {
        console.log(`\n${index + 1}. ${product.title || 'No Title'}`);
        console.log('   ID:', product.id);
        console.log('   Brand:', product.brand || 'No Brand');
        console.log('   Price:', product.price ? `¥${product.price.toLocaleString()}` : 'No Price');
        console.log('   Category:', product.category || 'No Category');
        console.log('   Tags:', product.tags?.join(', ') || 'No Tags');
        console.log('   Image URL:', product.imageUrl ? 
          (product.imageUrl.substring(0, 100) + '...') : 
          '❌ NO IMAGE URL');
        console.log('   Image URL Length:', product.imageUrl?.length || 0);
        console.log('   Has HTTPS:', product.imageUrl?.startsWith('https://') ? '✅' : '❌');
        console.log('   Image Domain:', product.imageUrl ? 
          new URL(product.imageUrl).hostname : 
          'N/A');
      });
      
      // 画像URLがない商品をカウント
      const noImageCount = products.filter(p => !p.imageUrl || p.imageUrl.trim() === '').length;
      const httpCount = products.filter(p => p.imageUrl && p.imageUrl.startsWith('http://')).length;
      
      console.log('\n📊 Summary:');
      console.log('==========');
      console.log(`Total Products: ${products.length}`);
      console.log(`Products without image: ${noImageCount}`);
      console.log(`Products with HTTP (not HTTPS): ${httpCount}`);
      console.log(`Products with valid HTTPS image: ${products.length - noImageCount - httpCount}`);
      
      // 最初の商品の画像URLを詳しく調査
      if (products[0]?.imageUrl) {
        console.log('\n🔍 Detailed Analysis of First Product Image:');
        console.log('============================================');
        const url = products[0].imageUrl;
        console.log('Full URL:', url);
        
        try {
          const urlObj = new URL(url);
          console.log('Protocol:', urlObj.protocol);
          console.log('Hostname:', urlObj.hostname);
          console.log('Pathname:', urlObj.pathname);
          console.log('Search Params:', urlObj.search);
          
          // 楽天の画像URLかチェック
          if (url.includes('rakuten')) {
            console.log('✅ This is a Rakuten image URL');
            if (url.includes('thumbnail.image.rakuten.co.jp')) {
              console.log('  Type: Rakuten Thumbnail CDN');
            } else if (url.includes('shop.r10s.jp')) {
              console.log('  Type: Rakuten Shop CDN');
            } else if (url.includes('image.rakuten.co.jp')) {
              console.log('  Type: Rakuten Image CDN');
            }
          }
        } catch (e) {
          console.log('❌ Invalid URL format:', e.message);
        }
      }
    } else {
      console.log('❌ No products found in database!');
    }
    
    // 2. ユーザーのレコメンデーション用データを確認
    console.log('\n\n2. Checking recommendation data...');
    const { data: swipes, error: swipeError } = await supabase
      .from('swipes')
      .select('id')
      .limit(1);
    
    if (swipeError) {
      console.error('Error checking swipes:', swipeError);
    } else {
      console.log(`Swipes in database: ${swipes?.length > 0 ? '✅ Yes' : '❌ No'}`);
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testHeroImage();
