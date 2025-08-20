import { Product } from '@/types';
import { supabase } from './supabase';
import { apiGet } from '@/utils/api';
import { generateDummyProducts } from '@/utils/dummyData';

// Supabaseから商品データを取得
export const fetchProducts = async (
  limit: number = 20,
  page: number = 0,
  filters: Record<string, any> = {}
): Promise<Product[]> => {
  try {
    let query = supabase.from('external_products').select('*');

    // フィルター適用
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        if (Array.isArray(value)) {
          // タグなどの配列フィルターはoverlap演算子を使用
          query = query.overlaps(key, value);
        } else {
          // 通常のフィルターはeq演算子を使用
          query = query.eq(key, value);
        }
      }
    });

    // ページネーション
    const offset = page * limit;
    query = query.range(offset, offset + limit - 1);

    // 並び替え（最新順）
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products:', error);
      throw error;
    }

    // データをProduct型に変換
    return (data || []).map((item) => ({
      id: item.id,
      title: item.title,
      imageUrl: item.image_url,
      brand: item.brand,
      price: item.price,
      tags: item.tags,
      category: item.category,
      affiliateUrl: item.affiliate_url,
      source: item.source,
      createdAt: item.created_at,
    }));
  } catch (error) {
    console.error('Error in fetchProducts:', error);
    
    // 開発中はエラー時にダミーデータを返す（本番では適切なエラーハンドリングを行う）
    if (__DEV__) {
      console.warn('Using dummy data due to API error');
      return generateDummyProducts(limit);
    }
    
    throw error;
  }
};

// 商品詳細を取得
export const fetchProductById = async (id: string): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('external_products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching product:', error);
      throw error;
    }

    if (!data) return null;

    // データをProduct型に変換
    return {
      id: data.id,
      title: data.title,
      imageUrl: data.image_url,
      brand: data.brand,
      price: data.price,
      tags: data.tags,
      category: data.category,
      affiliateUrl: data.affiliate_url,
      source: data.source,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('Error in fetchProductById:', error);
    
    // 開発中はエラー時にダミーデータを返す
    if (__DEV__) {
      console.warn('Using dummy product due to API error');
      const dummyProducts = generateDummyProducts(10);
      return dummyProducts.find(p => p.id === id) || dummyProducts[0];
    }
    
    throw error;
  }
};

// ユーザーの好みに基づいた商品レコメンド
export const fetchRecommendedProducts = async (
  userId: string,
  limit: number = 20
): Promise<Product[]> => {
  try {
    // MVP段階ではシンプルなタグベースのレコメンド
    // 1. ユーザーのYesスワイプを取得
    const { data: swipes, error: swipeError } = await supabase
      .from('swipes')
      .select('product_id')
      .eq('user_id', userId)
      .eq('result', 'yes');

    if (swipeError) throw swipeError;

    // スワイプがない場合は新着商品を返す
    if (!swipes || swipes.length === 0) {
      return fetchProducts(limit, 0);
    }

    // 2. Yesした商品のIDを配列に
    const productIds = swipes.map(swipe => swipe.product_id);

    // 3. それらの商品のタグを取得
    const { data: products, error: productError } = await supabase
      .from('external_products')
      .select('tags')
      .in('id', productIds);

    if (productError) throw productError;

    // 4. タグの頻度をカウント
    const tagCounts: Record<string, number> = {};
    products.forEach(product => {
      if (product.tags) {
        product.tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    // 5. 頻度順にソート
    const popularTags = Object.entries(tagCounts)
      .sort(([, countA], [, countB]) => countB - countA)
      .slice(0, 5)
      .map(([tag]) => tag);

    // 6. 人気タグを含む、まだスワイプしていない商品を取得
    const { data: recommendations, error: recError } = await supabase
      .from('external_products')
      .select('*')
      .not('id', 'in', productIds)
      .overlaps('tags', popularTags)
      .limit(limit);

    if (recError) throw recError;

    // データをProduct型に変換
    return (recommendations || []).map((item) => ({
      id: item.id,
      title: item.title,
      imageUrl: item.image_url,
      brand: item.brand,
      price: item.price,
      tags: item.tags,
      category: item.category,
      affiliateUrl: item.affiliate_url,
      source: item.source,
      createdAt: item.created_at,
    }));
  } catch (error) {
    console.error('Error in fetchRecommendedProducts:', error);
    
    // 開発中はエラー時にダミーデータを返す
    if (__DEV__) {
      console.warn('Using dummy recommendations due to API error');
      return generateDummyProducts(limit);
    }
    
    throw error;
  }
};

// 商品検索
export const searchProducts = async (
  query: string, 
  limit: number = 20
): Promise<Product[]> => {
  try {
    const { data, error } = await supabase
      .from('external_products')
      .select('*')
      .or(`title.ilike.%${query}%, brand.ilike.%${query}%, category.ilike.%${query}%`)
      .limit(limit);

    if (error) throw error;

    // データをProduct型に変換
    return (data || []).map((item) => ({
      id: item.id,
      title: item.title,
      imageUrl: item.image_url,
      brand: item.brand,
      price: item.price,
      tags: item.tags,
      category: item.category,
      affiliateUrl: item.affiliate_url,
      source: item.source,
      createdAt: item.created_at,
    }));
  } catch (error) {
    console.error('Error in searchProducts:', error);
    
    // 開発中はエラー時にダミーデータを返す
    if (__DEV__) {
      console.warn('Using dummy search results due to API error');
      const dummyProducts = generateDummyProducts(limit * 2);
      return dummyProducts.filter(p => 
        p.title.toLowerCase().includes(query.toLowerCase()) || 
        (p.brand && p.brand.toLowerCase().includes(query.toLowerCase())) ||
        (p.category && p.category.toLowerCase().includes(query.toLowerCase()))
      ).slice(0, limit);
    }
    
    throw error;
  }
};


// クリックログの記録
export const logProductClick = async (userId: string, productId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('click_logs')
      .insert([{
        user_id: userId,
        product_id: productId,
        created_at: new Date().toISOString(),
      }]);

    if (error) throw error;
  } catch (error) {
    // クリックログはユーザー体験に影響しないのでコンソールに記録するだけ
    console.error('Error logging product click:', error);
  }
};
