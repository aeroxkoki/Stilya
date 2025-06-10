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
 * 商品を取得（Supabase優先、楽天APIフォールバック）
 */
export const fetchProducts = async (limit: number = 20, offset: number = 0) => {
  try {
    console.log('[ProductService] Fetching products from Supabase...');
    
    // まずSupabaseから取得を試みる
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
    
    // Supabaseにデータがない場合、楽天APIから取得
    console.log('[ProductService] No products in Supabase, fetching from Rakuten API...');
    
    const rakutenResult = await fetchRakutenFashionProducts(
      undefined, // keyword
      100371,    // genreId (レディースファッション)
      Math.floor(offset / limit) + 1, // page
      limit
    );
    
    if (rakutenResult.products.length > 0) {
      console.log(`[ProductService] Fetched ${rakutenResult.products.length} products from Rakuten`);
      return { success: true, data: rakutenResult.products };
    }
    
    // どちらからも商品が取得できない場合
    return { 
      success: false, 
      error: 'No products available',
      data: [] 
    };
    
  } catch (error: any) {
    console.error('[ProductService] Error fetching products:', error);
    
    // エラー時は楽天APIから直接取得を試みる
    try {
      console.log('[ProductService] Attempting to fetch from Rakuten API as fallback...');
      const rakutenResult = await fetchRakutenFashionProducts(
        undefined, 
        100371,
        1,
        limit
      );
      
      if (rakutenResult.products.length > 0) {
        return { success: true, data: rakutenResult.products };
      }
    } catch (rakutenError: any) {
      console.error('[ProductService] Rakuten API also failed:', rakutenError);
    }
    
    return { 
      success: false, 
      error: error.message || 'Failed to fetch products',
      data: []
    };
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
