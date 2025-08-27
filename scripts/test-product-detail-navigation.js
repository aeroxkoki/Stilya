const { createClient } = require('@supabase/supabase-js');

// 環境変数の設定（.envから読み込み）
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ProductDetailScreenの商品取得フローをテスト
async function testProductDetailNavigation() {
  console.log('=== Product Detail Navigation Test ===\n');
  
  try {
    // 1. 商品リストを取得
    console.log('1. Fetching products from Supabase...');
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(5);
      
    if (error) {
      console.error('Error fetching products:', error);
      return;
    }
    
    if (!products || products.length === 0) {
      console.log('No products found in database');
      return;
    }
    
    console.log(`Found ${products.length} products`);
    console.log('First product:', {
      id: products[0].id,
      title: products[0].title,
      brand: products[0].brand,
      price: products[0].price
    });
    
    // 2. 特定の商品IDで商品を取得（ProductDetailScreenの処理を模倣）
    const testProductId = products[0].id;
    console.log(`\n2. Testing fetchProductById with ID: ${testProductId}`);
    
    const { data: singleProduct, error: fetchError } = await supabase
      .from('products')
      .select('*')
      .eq('id', testProductId)
      .single();
      
    if (fetchError) {
      console.error('Error fetching single product:', fetchError);
      return;
    }
    
    if (!singleProduct) {
      console.log('Product not found for ID:', testProductId);
      return;
    }
    
    console.log('Successfully fetched product:', {
      id: singleProduct.id,
      title: singleProduct.title,
      brand: singleProduct.brand,
      price: singleProduct.price,
      imageUrl: singleProduct.image_url,
      affiliateUrl: singleProduct.affiliate_url
    });
    
    // 3. 類似商品の取得テスト
    console.log('\n3. Testing similar products fetch...');
    const { data: similarProducts } = await supabase
      .from('products')
      .select('*')
      .eq('is_active', true)
      .neq('id', testProductId)
      .limit(3);
      
    if (similarProducts) {
      console.log(`Found ${similarProducts.length} similar products`);
    }
    
    console.log('\n✅ All tests passed! Product detail navigation should work.');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// テスト実行
testProductDetailNavigation();
