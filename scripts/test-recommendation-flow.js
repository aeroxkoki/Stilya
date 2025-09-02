const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase credentials not found in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testRecommendationFlow() {
  console.log('=== Testing Recommendation Flow ===\n');
  
  try {
    // 1. 推薦システムと同じクエリを実行
    console.log('1. Fetching products as in recommendation service...\n');
    
    // recommendationServiceと同じクエリ
    const { data: recommendedProducts, error: recError } = await supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .not('image_url', 'eq', '')
      .order('priority', { ascending: true, nullsFirst: false })
      .order('last_synced', { ascending: false })
      .limit(20);
    
    if (recError) {
      console.error('Error fetching recommended products:', recError);
      return;
    }
    
    console.log(`Found ${recommendedProducts?.length || 0} recommended products\n`);
    
    if (recommendedProducts && recommendedProducts.length > 0) {
      console.log('First 5 products:');
      console.log('==================');
      
      recommendedProducts.slice(0, 5).forEach((product, index) => {
        console.log(`\n${index + 1}. ${product.title}`);
        console.log(`   ID: ${product.id}`);
        console.log(`   Brand: ${product.brand}`);
        console.log(`   Price: ¥${product.price}`);
        console.log(`   Image URL: ${product.image_url ? 'Present' : 'Missing'}`);
        
        if (product.image_url) {
          // 画像URLの詳細分析
          const url = product.image_url;
          console.log(`   URL Pattern:`);
          
          if (url.startsWith('https://')) {
            console.log(`     ✅ HTTPS`);
          } else if (url.startsWith('http://')) {
            console.log(`     ⚠️  HTTP (needs HTTPS)`);
          } else {
            console.log(`     ❌ Invalid protocol`);
          }
          
          if (url.includes('rakuten')) {
            console.log(`     📦 Rakuten image`);
            
            if (url.includes('_ex=')) {
              const sizeMatch = url.match(/_ex=(\d+x\d+)/);
              if (sizeMatch) {
                console.log(`     📐 Size: ${sizeMatch[1]}`);
              }
            } else {
              console.log(`     ⚠️  No size parameter`);
            }
          }
          
          console.log(`   Full URL: ${url.substring(0, 150)}${url.length > 150 ? '...' : ''}`);
        }
      });
    }
    
    // 2. ランダム商品の取得（トレンド用）
    console.log('\n\n2. Testing randomized products fetch (for trending)...\n');
    
    const totalCount = await supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    console.log(`Total active products: ${totalCount.count}`);
    
    // シード付きランダムクエリのテスト
    const seed = `trending-${new Date().toDateString()}`;
    const seedValue = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 100 / 100;
    
    console.log(`Using seed: "${seed}" -> ${seedValue}`);
    
    // PostgreSQLのランダム関数を使用
    const { data: trendingProducts, error: trendError } = await supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .not('image_url', 'eq', '')
      .order('priority', { ascending: true })
      .limit(6);
    
    if (trendError) {
      console.error('Error fetching trending products:', trendError);
    } else {
      console.log(`\nFound ${trendingProducts?.length || 0} trending products`);
      
      if (trendingProducts && trendingProducts.length > 0) {
        console.log('\nFirst 3 trending products:');
        trendingProducts.slice(0, 3).forEach((product, index) => {
          console.log(`  ${index + 1}. ${product.title.substring(0, 50)}...`);
          console.log(`     Image: ${product.image_url ? '✅' : '❌'}`);
        });
      }
    }
    
    // 3. 画像URLの変換テスト
    console.log('\n\n3. Testing image URL optimization...\n');
    
    const testUrls = [
      'http://thumbnail.image.rakuten.co.jp/@0_mall/test/image.jpg',
      'https://thumbnail.image.rakuten.co.jp/@0_mall/test/image.jpg',
      'https://thumbnail.image.rakuten.co.jp/@0_mall/test/image.jpg?_ex=800x800',
      'https://shop.r10s.jp/test/image.jpg',
      'https://image.rakuten.co.jp/test/cabinet/image.jpg',
      '',
      null
    ];
    
    testUrls.forEach((url, index) => {
      console.log(`Test ${index + 1}: ${url || 'null/empty'}`);
      
      // optimizeImageUrl 関数のロジックを再現
      let optimizedUrl = url;
      
      if (!url || typeof url !== 'string' || url.trim() === '') {
        optimizedUrl = 'https://via.placeholder.com/800x800/f5f5f5/cccccc?text=No+Image';
        console.log(`  → Placeholder: ${optimizedUrl}`);
      } else {
        optimizedUrl = url.trim();
        
        // HTTPをHTTPSに変換
        if (optimizedUrl.startsWith('http://')) {
          optimizedUrl = optimizedUrl.replace('http://', 'https://');
          console.log(`  → HTTPS converted`);
        }
        
        // 楽天の画像URL最適化
        if (optimizedUrl.includes('rakuten.co.jp')) {
          if (optimizedUrl.includes('thumbnail.image.rakuten.co.jp')) {
            const urlParts = optimizedUrl.split('?');
            const baseUrl = urlParts[0];
            optimizedUrl = `${baseUrl}?_ex=800x800`;
            console.log(`  → Size parameter added: _ex=800x800`);
          }
        }
        
        console.log(`  → Result: ${optimizedUrl}`);
      }
      console.log('');
    });
    
    console.log('\n=== Test Complete ===');
    
  } catch (error) {
    console.error('Unexpected error during test:', error);
  }
}

testRecommendationFlow().catch(console.error);
