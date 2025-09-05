const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testSwipeImages() {
  console.log('🔍 Testing Swipe Screen Image Display...\n');

  try {
    // 1. 商品データの取得テスト
    console.log('1️⃣ Fetching products from database...');
    const { data: products, error } = await supabase
      .from('external_products')
      .select('*')
      .limit(10);

    if (error) {
      console.error('❌ Error fetching products:', error);
      return;
    }

    console.log(`✅ Found ${products.length} products\n`);

    // 2. 画像URLの検証
    console.log('2️⃣ Checking image URLs...');
    let validImages = 0;
    let invalidImages = 0;
    let missingImages = 0;

    for (const product of products) {
      const imageUrl = product.image_url || product.imageUrl || product.image;
      
      if (!imageUrl) {
        missingImages++;
        console.log(`⚠️ Missing image - Product: ${product.title?.substring(0, 50)}... (ID: ${product.id})`);
      } else if (imageUrl.startsWith('http://')) {
        invalidImages++;
        console.log(`⚠️ HTTP URL - Product: ${product.title?.substring(0, 50)}... (ID: ${product.id})`);
        console.log(`   URL: ${imageUrl.substring(0, 100)}...`);
      } else {
        validImages++;
        // 楽天URLの詳細チェック
        if (imageUrl.includes('rakuten')) {
          const hasSize = imageUrl.includes('_ex=') || imageUrl.includes('PC=');
          console.log(`✅ Rakuten image - Product: ${product.title?.substring(0, 50)}...`);
          console.log(`   Has size param: ${hasSize}`);
          if (!hasSize) {
            console.log(`   ⚠️ Missing size parameter - may load slowly`);
          }
        }
      }
    }

    console.log(`\n📊 Image URL Summary:`);
    console.log(`   ✅ Valid HTTPS URLs: ${validImages}`);
    console.log(`   ⚠️ Invalid HTTP URLs: ${invalidImages}`);
    console.log(`   ❌ Missing images: ${missingImages}`);

    // 3. 楽天APIの画像サイズパラメータチェック
    console.log('\n3️⃣ Checking Rakuten image optimization...');
    const rakutenProducts = products.filter(p => {
      const url = p.image_url || p.imageUrl || p.image;
      return url && url.includes('rakuten');
    });

    if (rakutenProducts.length > 0) {
      console.log(`Found ${rakutenProducts.length} Rakuten products`);
      
      const optimizedCount = rakutenProducts.filter(p => {
        const url = p.image_url || p.imageUrl || p.image;
        return url.includes('_ex=800x800') || url.includes('_ex=');
      }).length;

      console.log(`   ${optimizedCount}/${rakutenProducts.length} have size parameters`);
      
      if (optimizedCount < rakutenProducts.length) {
        console.log('   ⚠️ Some Rakuten images may not be optimized for performance');
      }
    }

    // 4. データベーススキーマチェック
    console.log('\n4️⃣ Checking database schema...');
    
    if (products && products.length > 0) {
      const columns = Object.keys(products[0]);
      const imageFields = columns.filter(col => 
        col.includes('image') || col.includes('thumbnail')
      );
      console.log('   Available image fields:', imageFields);
    }

    // 5. 推奨事項
    console.log('\n📝 Recommendations:');
    if (invalidImages > 0) {
      console.log('   1. Run image URL fix script to convert HTTP to HTTPS');
    }
    if (missingImages > 0) {
      console.log('   2. Update products with missing images or provide placeholders');
    }
    if (rakutenProducts.length > 0 && optimizedCount < rakutenProducts.length) {
      console.log('   3. Add size parameters to Rakuten URLs for better performance');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// RPCファンクションが存在しない場合の代替
async function getTableColumns() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .limit(1);

  if (data && data.length > 0) {
    return Object.keys(data[0]);
  }
  return [];
}

testSwipeImages();