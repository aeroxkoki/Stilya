import { supabase } from './supabase';
import { Product } from '@/types';

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
 * 商品を取得（シンプル版）
 */
export const fetchProducts = async (limit: number = 20, offset: number = 0) => {
  try {
    console.log('[ProductService] Fetching products...');
    
    const { data, error } = await supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('[ProductService] Error fetching products:', error);
      return { success: false, error: error.message };
    }
    
    const products = data?.map(normalizeProduct) || [];
    console.log(`[ProductService] Fetched ${products.length} products`);
    
    return { success: true, data: products };
  } catch (error: any) {
    console.error('[ProductService] Unexpected error:', error);
    return { success: false, error: error.message || 'Unknown error' };
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
