/**
 * 推薦サービス（MVP版）
 * シンプルなタグベースの推薦を提供
 */
import { supabase } from './supabase';
import { Product } from '../types';

export interface UserPreference {
  userId: string;
  likedTags: string[];
  dislikedTags: string[];
  preferredCategories: string[];
  avgPriceRange: { min: number; max: number };
}

/**
 * ユーザーの好み履歴を分析
 */
export const analyzeUserPreferences = async (userId: string): Promise<UserPreference> => {
  try {
    const { data: swipes, error } = await supabase
      .from('swipes')
      .select(`
        result,
        products (
          tags,
          category,
          price
        )
      `)
      .eq('user_id', userId);

    if (error || !swipes) {
      return {
        userId,
        likedTags: [],
        dislikedTags: [],
        preferredCategories: [],
        avgPriceRange: { min: 0, max: 10000 }
      };
    }

    const likedTags: string[] = [];
    const dislikedTags: string[] = [];
    const preferredCategories: string[] = [];
    const prices: number[] = [];

    swipes.forEach(swipe => {
      if (swipe.products) {
        const product = swipe.products as any;
        
        if (swipe.result === 'yes') {
          if (product.tags) {
            likedTags.push(...product.tags);
          }
          if (product.category) {
            preferredCategories.push(product.category);
          }
        } else {
          if (product.tags) {
            dislikedTags.push(...product.tags);
          }
        }
        
        if (product.price) {
          prices.push(product.price);
        }
      }
    });

    const avgPrice = prices.length > 0 ? prices.reduce((sum, p) => sum + p, 0) / prices.length : 5000;
    
    return {
      userId,
      likedTags: [...new Set(likedTags)],
      dislikedTags: [...new Set(dislikedTags)],
      preferredCategories: [...new Set(preferredCategories)],
      avgPriceRange: {
        min: Math.max(0, avgPrice - 2000),
        max: avgPrice + 2000
      }
    };
  } catch (error) {
    console.error('Error analyzing user preferences:', error);
    return {
      userId,
      likedTags: [],
      dislikedTags: [],
      preferredCategories: [],
      avgPriceRange: { min: 0, max: 10000 }
    };
  }
};

/**
 * ユーザーに推薦商品を提供
 */
export const getRecommendations = async (userId: string, limit: number = 10): Promise<Product[]> => {
  try {
    const preferences = await analyzeUserPreferences(userId);
    
    // 基本的な商品取得
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .gte('price', preferences.avgPriceRange.min)
      .lte('price', preferences.avgPriceRange.max)
      .limit(limit * 2); // 多めに取得してフィルタリング

    if (error || !products) {
      return [];
    }

    // タグベースでスコアリング
    const scoredProducts = products.map(product => {
      let score = 0;
      
      if (product.tags) {
        const productTags = Array.isArray(product.tags) ? product.tags : [];
        
        // 好きなタグがあれば加点
        productTags.forEach(tag => {
          if (preferences.likedTags.includes(tag)) {
            score += 2;
          }
          if (preferences.dislikedTags.includes(tag)) {
            score -= 1;
          }
        });
      }

      // 好みのカテゴリなら加点
      if (preferences.preferredCategories.includes(product.category)) {
        score += 1;
      }

      return { ...product, score };
    });

    // スコア順でソートして返す
    return scoredProducts
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
      
  } catch (error) {
    console.error('Error getting recommendations:', error);
    return [];
  }
};

/**
 * 人気商品を取得
 */
export const getPopularProducts = async (limit: number = 10): Promise<Product[]> => {
  try {
    const { data: products, error } = await supabase
      .from('products')
      .select('*')
      .limit(limit);

    if (error || !products) {
      return [];
    }

    return products;
  } catch (error) {
    console.error('Error getting popular products:', error);
    return [];
  }
};