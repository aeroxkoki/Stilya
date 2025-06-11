import { supabase } from './supabase';
import { Product } from '@/types';
import { fetchRakutenFashionProducts } from './rakutenService';

/**
 * DBの商品データをアプリ用の形式に正規化
 */
const normalizeProduct = (dbProduct: any): Product => {
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

/**
 * 商品を取得（楽天API優先、Supabaseフォールバック）
 */
export const fetchProducts = async (limit: number = 20, offset: number = 0) => {
  try {
    console.log('[ProductService] Fetching products...');
    console.log('[ProductService] Request params:', { limit, offset });
    
    // 楽天APIから商品を取得
    console.log('[ProductService] Fetching from Rakuten API...');
    
    // ページ番号を計算（楽天APIは1から始まる）
    const page = Math.floor(offset / limit) + 1;
    
    // genreIdをランダムに選択（男女両方の商品を取得）
    const genreIds = [100371, 551177]; // レディース、メンズ
    const genreId = genreIds[Math.floor(Math.random() * genreIds.length)];
    
    const rakutenResult = await fetchRakutenFashionProducts(
      undefined, // keyword
      genreId,
      page,
      limit * 2 // より多くの商品を取得
    );
    
    if (rakutenResult.products.length > 0) {
      console.log(`[ProductService] Fetched ${rakutenResult.products.length} products from Rakuten`);
      
      // Supabaseに商品を保存（非同期、エラーを無視）
      saveProductsToSupabase(rakutenResult.products).catch(err => {
        console.error('[ProductService] Failed to save products to Supabase:', err);
      });
      
      return { success: true, data: rakutenResult.products.slice(0, limit) };
    }
    
    // 楽天APIから取得できない場合、Supabaseから取得を試みる
    console.log('[ProductService] Rakuten API returned no products, trying Supabase...');
    
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
    
    // どちらからも商品が取得できない場合
    return { 
      success: false, 
      error: 'No products available',
      data: [] 
    };
    
  } catch (error: any) {
    console.error('[ProductService] Error fetching products:', error);
    return { 
      success: false, 
      error: error.message || 'Failed to fetch products',
      data: []
    };
  }
};

/**
 * 商品をSupabaseに保存（バックグラウンド処理）
 */
const saveProductsToSupabase = async (products: Product[]) => {
  try {
    const productsToInsert = products.map(product => ({
      id: product.id,
      title: product.title,
      brand: product.brand,
      price: product.price,
      image_url: product.imageUrl,
      description: product.description,
      tags: product.tags,
      category: product.category,
      affiliate_url: product.affiliateUrl,
      source: product.source,
      is_active: true,
      created_at: new Date().toISOString(),
    }));
    
    await supabase
      .from('external_products')
      .upsert(productsToInsert, { onConflict: 'id' });
      
    console.log('[ProductService] Saved products to Supabase');
  } catch (error) {
    console.error('[ProductService] Error saving products to Supabase:', error);
  }
};

/**
 * 商品をIDで取得
 */
export const fetchProductById = async (productId: string) => {
  try {
    const { data, error } = await supabase
      .from('external_products')
      .select('*')
      .eq('id', productId)
      .single();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, data: normalizeProduct(data) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Unknown error' };
  }
};

/**
 * タグで商品を検索
 */
export const fetchProductsByTags = async (tags: string[], limit: number = 20) => {
  try {
    const { data, error } = await supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .contains('tags', tags)
      .limit(limit);
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    const products = data?.map(normalizeProduct) || [];
    return { success: true, data: products };
  } catch (error: any) {
    return { success: false, error: error.message || 'Unknown error' };
  }
};
