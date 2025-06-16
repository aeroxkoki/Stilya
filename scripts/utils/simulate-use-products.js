#!/usr/bin/env node

/**
 * useProductsフックの動作をシミュレート
 * 5つで商品が出なくなる問題の調査
 */

const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

// 環境変数の読み込み
dotenv.config({ path: path.join(__dirname, '../../.env') });

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase環境変数が設定されていません');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// メモリ上のスワイプ済み商品キャッシュ（useProductsフックと同じ）
const swipedProductsRef = new Set();

// 商品データを正規化（productServiceと同じ）
const normalizeProduct = (dbProduct) => {
  return {
    id: dbProduct.id,
    title: dbProduct.title,
    brand: dbProduct.brand,
    price: dbProduct.price,
    imageUrl: dbProduct.image_url,
    description: dbProduct.description,
    tags: dbProduct.tags || [],
    category: dbProduct.category,
    affiliateUrl: dbProduct.affiliate_url,
    source: dbProduct.source,
    createdAt: dbProduct.created_at,
  };
};

// fetchProducts関数をシミュレート
async function fetchProducts(limit = 20, offset = 0) {
  try {
    console.log('[ProductService] Fetching products from Supabase...');
    console.log('[ProductService] Request params:', { limit, offset });
    
    const { data, error } = await supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (!error && data && data.length > 0) {
      const products = data.map(normalizeProduct);
      console.log(`[ProductService] Fetched ${products.length} products from Supabase`);
      return { success: true, data: products };
    }
    
    return { success: false, error: 'No products available', data: [] };
  } catch (error) {
    console.error('[ProductService] Error fetching products:', error);
    return { success: false, error: error.message, data: [] };
  }
}

// useProductsフックの動作をシミュレート
async function simulateUseProducts() {
  console.log('=== useProductsフックのシミュレーション ===\n');
  
  let page = 0;
  const pageSize = 20;
  let allProducts = [];
  let currentIndex = 0;
  
  // 初回ロード
  console.log('--- 初回ロード ---');
  const response = await fetchProducts(pageSize, page * pageSize);
  
  if (response.success) {
    const newProducts = response.data;
    console.log('[useProducts] Fetched products:', newProducts.length);
    
    // スワイプ済みの商品を除外
    const filteredProducts = newProducts.filter(
      product => !swipedProductsRef.has(product.id)
    );
    
    console.log('[useProducts] After filtering swiped products:', filteredProducts.length);
    allProducts = filteredProducts;
  }
  
  // 5回スワイプをシミュレート
  console.log('\n--- スワイプシミュレーション ---');
  for (let i = 0; i < 5; i++) {
    if (currentIndex < allProducts.length) {
      const product = allProducts[currentIndex];
      console.log(`\nスワイプ ${i + 1}: ${product.id}`);
      
      // スワイプ済みリストに追加
      swipedProductsRef.add(product.id);
      currentIndex++;
      
      console.log(`現在のインデックス: ${currentIndex}`);
      console.log(`残り商品数: ${allProducts.length - currentIndex}`);
    } else {
      console.log(`\n❌ スワイプ ${i + 1}: 商品がありません！`);
    }
  }
  
  // 残りの商品が少なくなったら追加ロード
  if (allProducts.length - currentIndex <= 5) {
    console.log('\n--- 追加ロードが必要 ---');
    page++;
    
    const response = await fetchProducts(pageSize, page * pageSize);
    if (response.success) {
      const newProducts = response.data;
      console.log('[useProducts] Fetched additional products:', newProducts.length);
      
      // スワイプ済みの商品を除外
      const filteredProducts = newProducts.filter(
        product => !swipedProductsRef.has(product.id)
      );
      
      console.log('[useProducts] After filtering swiped products:', filteredProducts.length);
      
      // 既存の商品と重複しないものを追加
      const uniqueProducts = filteredProducts.filter(
        p => !allProducts.some(existing => existing.id === p.id)
      );
      
      allProducts = [...allProducts, ...uniqueProducts];
      console.log('[useProducts] Total products after update:', allProducts.length);
    }
  }
  
  console.log('\n--- 最終状態 ---');
  console.log(`総商品数: ${allProducts.length}`);
  console.log(`現在のインデックス: ${currentIndex}`);
  console.log(`スワイプ済み商品数: ${swipedProductsRef.size}`);
  console.log(`表示可能な残り商品数: ${allProducts.length - currentIndex}`);
}

// 実行
simulateUseProducts().then(() => {
  console.log('\nシミュレーション完了');
  process.exit(0);
}).catch(error => {
  console.error('エラー:', error);
  process.exit(1);
});
