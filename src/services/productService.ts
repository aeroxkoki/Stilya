import { supabase } from './supabase';
import { Product } from '@/types';
import { fetchRakutenFashionProducts, fetchRakutenGenreProducts } from './rakutenService';
import { generateMockProducts } from './mockDataService';
import { IS_DEV } from '@/utils/env';

// カテゴリ別ジャンルIDのマッピング
const GENRE_MAPPINGS: { [key: string]: number[] } = {
  'レディースファッション': [100371],
  'メンズファッション': [551177],
  'レディースバッグ': [110729],
  'メンズバッグ': [551169],
  'レディース靴': [110727],
  'メンズ靴': [551176],
  'アクセサリー': [216131],
};

// カテゴリ名を正規化
const normalizeCategory = (category: string): string => {
  // カテゴリ名のマッピング
  const categoryMap: { [key: string]: string } = {
    'womens': 'レディースファッション',
    'mens': 'メンズファッション',
    'ladies': 'レディースファッション',
    'women': 'レディースファッション',
    'men': 'メンズファッション',
  };
  
  return categoryMap[category.toLowerCase()] || category;
};

/**
 * Supabaseから商品を取得
 */
export const fetchProductsFromSupabase = async (
  options: {
    category?: string;
    tags?: string[];
    keyword?: string;
    page?: number;
    limit?: number;
    excludeIds?: string[];
  } = {}
): Promise<{
  products: Product[];
  totalProducts: number;
  pageCount: number;
}> => {
  try {
    const { 
      category, 
      tags = [], 
      keyword, 
      page = 1, 
      limit = 30,
      excludeIds = []
    } = options;
    
    const offset = (page - 1) * limit;
    
    // クエリの構築
    let query = supabase
      .from('external_products')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('last_synced', { ascending: false });
    
    // カテゴリフィルタ
    if (category) {
      const normalizedCategory = normalizeCategory(category);
      const genreIds = GENRE_MAPPINGS[normalizedCategory];
      
      if (genreIds && genreIds.length > 0) {
        query = query.in('genre_id', genreIds);
      } else {
        query = query.eq('category', normalizedCategory);
      }
    }
    
    // キーワード検索
    if (keyword) {
      query = query.or(`title.ilike.%${keyword}%,description.ilike.%${keyword}%`);
    }
    
    // タグフィルタ（複数タグのOR検索）
    if (tags.length > 0) {
      const tagConditions = tags.map(tag => `tags.cs.{${tag}}`).join(',');
      query = query.or(tagConditions);
    }
    
    // 除外ID
    if (excludeIds.length > 0) {
      query = query.not('id', 'in', `(${excludeIds.join(',')})`);
    }
    
    // ページネーション
    query = query.range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('Supabase fetch error:', error);
      throw error;
    }
    
    // データ形式の変換
    const products: Product[] = (data || []).map(item => ({
      id: item.id,
      title: item.title,
      price: item.price,
      brand: item.brand || '',
      imageUrl: item.image_url || '',
      description: item.description || '',
      tags: item.tags || [],
      category: item.category || '',
      affiliateUrl: item.affiliate_url || '',
      source: item.source || 'rakuten',
      createdAt: item.created_at || new Date().toISOString(),
    }));
    
    const totalProducts = count || 0;
    const pageCount = Math.ceil(totalProducts / limit);
    
    return {
      products,
      totalProducts,
      pageCount,
    };
  } catch (error) {
    console.error('Error fetching products from Supabase:', error);
    
    // フォールバック：開発環境ではモックデータを返す
    if (IS_DEV) {
      console.log('Using mock data as fallback');
      const mockProducts = generateMockProducts(options.keyword || 'general', options.limit || 30);
      return {
        products: mockProducts,
        totalProducts: mockProducts.length,
        pageCount: 1,
      };
    }
    
    throw error;
  }
};

/**
 * 商品を取得（Supabase優先、フォールバックで楽天API）
 */
export const fetchProducts = async (
  options: {
    category?: string;
    genreId?: number;
    keyword?: string;
    page?: number;
    limit?: number;
    forceRefresh?: boolean;
  } = {}
): Promise<{
  products: Product[];
  totalProducts: number;
  pageCount: number;
}> => {
  try {
    // まずSupabaseから取得を試みる
    const result = await fetchProductsFromSupabase({
      category: options.category,
      keyword: options.keyword,
      page: options.page,
      limit: options.limit,
    });
    
    // 商品が見つかった場合はそれを返す
    if (result.products.length > 0) {
      console.log(`Found ${result.products.length} products in Supabase`);
      return result;
    }
    
    // Supabaseに商品がない場合、楽天APIから直接取得（フォールバック）
    console.log('No products in Supabase, falling back to Rakuten API');
    
    return await fetchRakutenFashionProducts(
      options.keyword,
      options.genreId || 100371,
      options.page || 1,
      options.limit || 30,
      options.forceRefresh || false
    );
  } catch (error) {
    console.error('Error in fetchProducts:', error);
    
    // 最終フォールバック：楽天APIを直接呼び出す
    try {
      return await fetchRakutenFashionProducts(
        options.keyword,
        options.genreId || 100371,
        options.page || 1,
        options.limit || 30,
        false
      );
    } catch (rakutenError) {
      console.error('Rakuten API also failed:', rakutenError);
      
      // 開発環境ではモックデータを返す
      if (IS_DEV) {
        const mockProducts = generateMockProducts(options.keyword || 'general', options.limit || 30);
        return {
          products: mockProducts,
          totalProducts: mockProducts.length,
          pageCount: 1,
        };
      }
      
      throw rakutenError;
    }
  }
};

/**
 * カテゴリごとの商品を取得
 */
export const fetchProductsByCategories = async (): Promise<Product[]> => {
  try {
    const categories = Object.keys(GENRE_MAPPINGS);
    const allProducts: Product[] = [];
    
    // 各カテゴリから商品を取得
    for (const category of categories) {
      const { products } = await fetchProductsFromSupabase({
        category,
        limit: 10, // 各カテゴリから10件ずつ
      });
      
      allProducts.push(...products);
    }
    
    // 商品をシャッフル
    return allProducts.sort(() => Math.random() - 0.5);
  } catch (error) {
    console.error('Error fetching products by categories:', error);
    
    // フォールバック
    const fallbackProducts: Product[] = [];
    for (const [category, genreIds] of Object.entries(GENRE_MAPPINGS)) {
      for (const genreId of genreIds) {
        try {
          const products = await fetchRakutenGenreProducts(genreId, 1, 10);
          fallbackProducts.push(...products);
        } catch (e) {
          console.error(`Failed to fetch genre ${genreId}:`, e);
        }
      }
    }
    
    return fallbackProducts;
  }
};

/**
 * 関連商品を取得
 */
export const fetchRelatedProducts = async (
  tags: string[],
  excludeIds: string[] = [],
  limit: number = 10
): Promise<Product[]> => {
  try {
    // Supabaseから関連商品を取得
    const { products } = await fetchProductsFromSupabase({
      tags,
      excludeIds,
      limit,
    });
    
    return products;
  } catch (error) {
    console.error('Error fetching related products:', error);
    return [];
  }
};

/**
 * お気に入り商品を取得
 */
export const fetchFavoriteProducts = async (userId: string): Promise<Product[]> => {
  try {
    // お気に入りIDを取得
    const { data: favorites, error: favError } = await supabase
      .from('favorites')
      .select('product_id')
      .eq('user_id', userId);
    
    if (favError) throw favError;
    if (!favorites || favorites.length === 0) return [];
    
    const productIds = favorites.map(f => f.product_id);
    
    // 商品情報を取得
    const { data: products, error: prodError } = await supabase
      .from('external_products')
      .select('*')
      .in('id', productIds)
      .eq('is_active', true);
    
    if (prodError) throw prodError;
    
    return (products || []).map(item => ({
      id: item.id,
      title: item.title,
      price: item.price,
      brand: item.brand || '',
      imageUrl: item.image_url || '',
      description: item.description || '',
      tags: item.tags || [],
      category: item.category || '',
      affiliateUrl: item.affiliate_url || '',
      source: item.source || 'rakuten',
      createdAt: item.created_at || new Date().toISOString(),
    }));
  } catch (error) {
    console.error('Error fetching favorite products:', error);
    return [];
  }
};

/**
 * 商品データをリフレッシュ（管理者用）
 */
export const refreshProductData = async (): Promise<void> => {
  try {
    console.log('Product data refresh is handled by the batch process');
    // バッチ処理で実行されるため、ここでは何もしない
  } catch (error) {
    console.error('Error refreshing product data:', error);
  }
};

// エクスポート
export default {
  fetchProducts,
  fetchProductsByCategories,
  fetchRelatedProducts,
  fetchFavoriteProducts,
  refreshProductData,
};
