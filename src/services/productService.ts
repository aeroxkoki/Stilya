import { supabase } from './supabase';
import { Product } from '@/types';
import { cacheProducts, getCachedProducts } from '@/utils/cacheUtils';
import { isOffline } from '@/utils/networkUtils';

/**
 * すべての商品を取得する
 * @param limit 取得する商品数
 * @param offset ページネーションのオフセット
 * @returns 商品の配列
 */
export const fetchProducts = async (limit = 10, offset = 0): Promise<Product[]> => {
  try {
    // オフラインの場合はキャッシュから取得
    const networkOffline = await isOffline();
    if (networkOffline) {
      const cachedProducts = await getCachedProducts();
      if (cachedProducts && cachedProducts.length > 0) {
        return cachedProducts.slice(offset, offset + limit);
      }
    }

    // オンラインの場合はSupabaseから取得
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // レスポンスをProduct型に変換
    const products = data.map(mapProductFromDB);

    // キャッシュに保存
    if (products.length > 0) {
      await cacheProducts(products);
    }

    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    // エラー時もキャッシュを試みる
    const cachedProducts = await getCachedProducts();
    if (cachedProducts && cachedProducts.length > 0) {
      return cachedProducts.slice(offset, offset + limit);
    }
    return [];
  }
};

/**
 * 特定のタグに一致する商品を取得する
 * @param tags タグの配列
 * @param limit 取得する商品数
 * @param offset ページネーションのオフセット
 * @returns 商品の配列
 */
export const fetchProductsByTags = async (
  tags: string[],
  limit = 10,
  offset = 0
): Promise<Product[]> => {
  try {
    if (!tags || tags.length === 0) {
      return [];
    }

    // オフラインの場合はキャッシュから取得して、タグでフィルタリング
    const networkOffline = await isOffline();
    if (networkOffline) {
      const cachedProducts = await getCachedProducts();
      if (cachedProducts && cachedProducts.length > 0) {
        const filteredProducts = cachedProducts.filter(product => 
          product.tags && product.tags.some(tag => tags.includes(tag))
        );
        return filteredProducts.slice(offset, offset + limit);
      }
    }

    // オンラインの場合はSupabaseから取得
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .containedBy('tags', tags)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // レスポンスをProduct型に変換
    return data.map(mapProductFromDB);
  } catch (error) {
    console.error('Error fetching products by tags:', error);
    return [];
  }
};

/**
 * 特定のIDの商品を取得する
 * @param productId 商品ID
 * @returns 商品オブジェクト
 */
export const fetchProductById = async (productId: string): Promise<Product | null> => {
  try {
    // オフラインの場合はキャッシュから取得
    const networkOffline = await isOffline();
    if (networkOffline) {
      const cachedProducts = await getCachedProducts();
      const product = cachedProducts.find(p => p.id === productId);
      if (product) return product;
    }

    // オンラインの場合はSupabaseから取得
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) throw error;

    // レスポンスをProduct型に変換
    return mapProductFromDB(data);
  } catch (error) {
    console.error(`Error fetching product with ID ${productId}:`, error);
    return null;
  }
};

/**
 * データベースの商品データをアプリで使用する形式に変換する
 * @param dbProduct データベースから取得した商品データ
 * @returns アプリ用に整形された商品オブジェクト
 */
const mapProductFromDB = (dbProduct: any): Product => {
  return {
    id: dbProduct.id,
    title: dbProduct.title || '',
    description: dbProduct.description || '',
    price: dbProduct.price || 0,
    imageUrl: dbProduct.image_url || '',
    brand: dbProduct.brand || '',
    tags: dbProduct.tags || [],
    category: dbProduct.category || '',
    affiliateUrl: dbProduct.affiliate_url || '',
    source: dbProduct.source || 'internal',
    createdAt: dbProduct.created_at || new Date().toISOString(),
    updatedAt: dbProduct.updated_at || new Date().toISOString(),
  };
};
