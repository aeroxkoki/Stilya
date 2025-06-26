import { supabase, handleSupabaseError, handleSupabaseSuccess, TABLES } from './supabase';
import { Product, UserPreference } from '../types';
import { FilterOptions } from './productService';
import { addScoreNoise, shuffleArray, ensureProductDiversity } from '../utils/randomUtils';

export class RecommendationService {
  // Analyze user preferences based on swipe history
  static async analyzeUserPreferences(userId: string | undefined | null) {
    try {
      // userIdの検証
      if (!userId || userId === 'undefined' || userId === 'null') {
        console.warn('[analyzeUserPreferences] Invalid userId:', userId);
        return handleSupabaseError(new Error('Invalid user ID'));
      }
      
      // スワイプ履歴を取得
      const { data: swipes, error: swipeError } = await supabase
        .from(TABLES.SWIPES)
        .select('product_id')
        .eq('user_id', userId)
        .eq('result', 'yes');

      if (swipeError) {
        console.error('Error fetching user swipes:', swipeError);
        return handleSupabaseError(swipeError);
      }

      if (!swipes || swipes.length === 0) {
        return handleSupabaseSuccess(null);
      }

      // 商品IDのリストを取得
      const productIds = swipes.map(s => s.product_id);

      // 商品情報を個別に取得
      const { data: products, error: productError } = await supabase
        .from(TABLES.EXTERNAL_PRODUCTS)
        .select('tags, category, price, brand')
        .in('id', productIds);

      if (productError) {
        console.error('Error fetching products:', productError);
        return handleSupabaseError(productError);
      }

      if (!products || products.length === 0) {
        return handleSupabaseSuccess(null);
      }

      // Analyze tags
      const tagFrequency: Record<string, number> = {};
      const categoryFrequency: Record<string, number> = {};
      const brandFrequency: Record<string, number> = {};
      const prices: number[] = [];

      products.forEach((product) => {
        // Count tags
        if (product.tags && Array.isArray(product.tags)) {
          product.tags.forEach((tag: string) => {
            tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
          });
        }

        // Count categories
        if (product.category) {
          categoryFrequency[product.category] = (categoryFrequency[product.category] || 0) + 1;
        }

        // Count brands
        if (product.brand) {
          brandFrequency[product.brand] = (brandFrequency[product.brand] || 0) + 1;
        }

        // Collect prices
        if (product.price) {
          prices.push(product.price);
        }
      });

      // Calculate preferences
      const likedTags = Object.entries(tagFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([tag]) => tag);

      const preferredCategories = Object.entries(categoryFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([category]) => category);

      const preferredBrands = Object.entries(brandFrequency)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([brand]) => brand);

      const avgPriceRange = prices.length > 0 ? {
        min: Math.min(...prices),
        max: Math.max(...prices),
      } : { min: 0, max: 100000 };

      const userPreference: UserPreference = {
        userId,
        likedTags,
        dislikedTags: [], // Would need additional analysis for disliked tags
        preferredCategories,
        avgPriceRange,
        brands: preferredBrands,
        price_range: avgPriceRange,
        topTags: likedTags.slice(0, 5),
        tagScores: tagFrequency,
      };

      return handleSupabaseSuccess(userPreference);
    } catch (error) {
      console.error('Error analyzing user preferences:', error);
      return handleSupabaseError(error);
    }
  }

  // Get personalized recommendations based on user preferences
  static async getPersonalizedRecommendations(userId: string | undefined | null, limit: number = 20, filters?: FilterOptions) {
    try {
      // userIdの検証
      if (!userId || userId === 'undefined' || userId === 'null') {
        console.warn('[getPersonalizedRecommendations] Invalid userId:', userId);
        // userIdが無効な場合は人気商品を返す
        return await RecommendationService.getPopularProducts(limit);
      }
      
      const preferencesResult = await RecommendationService.analyzeUserPreferences(userId);
      
      if (!preferencesResult.success || !preferencesResult.data) {
        // Fallback to popular products if no preferences found
        return await RecommendationService.getPopularProducts(limit);
      }

      const preferences = preferencesResult.data;

      // Get swiped product IDs to exclude
      const { data: swipedData, error: swipeError } = await supabase
        .from(TABLES.SWIPES)
        .select('product_id')
        .eq('user_id', userId);

      if (swipeError) {
        console.error('[getPersonalizedRecommendations] Error fetching swipes:', swipeError);
        return handleSupabaseError(swipeError);
      }

      const swipedProductIds = swipedData?.map(s => s.product_id) || [];
      console.log('[getPersonalizedRecommendations] Swiped product IDs:', swipedProductIds.length);

      // 多めに商品を取得してランダム性を確保
      const poolSize = limit * 3;
      
      // Query products matching user preferences
      let query = supabase
        .from(TABLES.EXTERNAL_PRODUCTS)
        .select('*')
        .eq('is_active', true)  // アクティブな商品のみを取得
        .limit(poolSize)
        .order('created_at', { ascending: false });

      // デバッグ用：クエリパラメータを確認
      console.log('[getPersonalizedRecommendations] Query parameters:', {
        table: TABLES.EXTERNAL_PRODUCTS,
        poolSize,
        swipedProductIdsCount: swipedProductIds.length,
        likedTagsCount: preferences.likedTags.length
      });

      // Exclude already swiped products
      if (swipedProductIds.length > 0) {
        // Supabaseのnot演算子に配列を直接渡す
        query = query.not('id', 'in', swipedProductIds);
      }

      // Filter by preferred tags (using overlaps operator)
      if (preferences.likedTags.length > 0) {
        console.log('[getPersonalizedRecommendations] Filtering by tags:', preferences.likedTags);
        query = query.overlaps('tags', preferences.likedTags);
      }

      const { data, error } = await query;

      if (error) {
        console.error('[getPersonalizedRecommendations] Query error:', error);
        console.error('[getPersonalizedRecommendations] Error details:', {
          message: error.message,
          details: error.details,
          hint: error.hint,
          code: error.code
        });
        return handleSupabaseError(error);
      }

      // Score and sort products based on preference matching
      const scoredProducts = (data || []).map((product: Product) => {
        let baseScore = 0;

        // Tag matching score
        if (product.tags && preferences.likedTags) {
          const matchingTags = product.tags.filter(tag => 
            preferences.likedTags.includes(tag)
          ).length;
          baseScore += matchingTags * 3;
        }

        // Category matching score
        if (product.category && preferences.preferredCategories.includes(product.category)) {
          baseScore += 2;
        }

        // Brand matching score
        if (preferences.brands && preferences.brands.includes(product.brand)) {
          baseScore += 1;
        }

        // Price range score
        const priceRange = preferences.price_range || preferences.avgPriceRange;
        if (product.price >= priceRange.min && 
            product.price <= priceRange.max) {
          baseScore += 1;
        }

        // ランダムノイズを追加（スコアの30%の範囲でランダム化）
        const finalScore = addScoreNoise(baseScore, 0.3);

        return { ...product, score: finalScore };
      });

      // Sort by score
      let sortedProducts = scoredProducts.sort((a, b) => b.score - a.score);
      
      // トップ商品を取得した後、少しシャッフルして多様性を確保
      const topProducts = sortedProducts.slice(0, limit * 1.5);
      const remainingProducts = sortedProducts.slice(limit * 1.5);
      
      // トップ商品の中でランダム性を加える（完全にランダムではなく、上位グループ内でシャッフル）
      const shuffledTop = shuffleArray(topProducts.slice(0, Math.floor(limit * 0.7)));
      const shuffledRemaining = shuffleArray(topProducts.slice(Math.floor(limit * 0.7)));
      
      // 再結合
      const finalProducts = [...shuffledTop, ...shuffledRemaining, ...remainingProducts];
      
      // 多様性を確保
      const diverseProducts = ensureProductDiversity(finalProducts, {
        maxSameCategory: 2,
        maxSameBrand: 2,
        windowSize: 5
      });
      
      // Remove score property and return
      const recommendations = diverseProducts
        .slice(0, limit)
        .map(({ score: _score, ...product }) => product);

      return handleSupabaseSuccess(recommendations);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  // Get popular products as fallback
  static async getPopularProducts(limit: number = 20) {
    try {
      // まずスワイプデータからYesが多い商品IDを取得
      const { data: popularSwipes, error: swipeError } = await supabase
        .from(TABLES.SWIPES)
        .select('product_id')
        .eq('result', 'yes')
        .order('created_at', { ascending: false })
        .limit(limit * 3); // 重複を考慮して多めに取得

      if (swipeError) {
        console.error('Error fetching popular swipes:', swipeError);
        // スワイプデータが取得できない場合は、最新の商品を返す
        const { data: latestProducts, error: productError } = await supabase
          .from(TABLES.EXTERNAL_PRODUCTS)
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (productError) {
          return handleSupabaseError(productError);
        }
        return handleSupabaseSuccess(latestProducts || []);
      }

      if (!popularSwipes || popularSwipes.length === 0) {
        // スワイプがない場合は最新商品を返す
        const { data: latestProducts, error: productError } = await supabase
          .from(TABLES.EXTERNAL_PRODUCTS)
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (productError) {
          return handleSupabaseError(productError);
        }
        return handleSupabaseSuccess(latestProducts || []);
      }

      // 人気商品のIDをカウント
      const productIdCounts: Record<string, number> = {};
      popularSwipes.forEach(swipe => {
        productIdCounts[swipe.product_id] = (productIdCounts[swipe.product_id] || 0) + 1;
      });

      // 上位の商品IDを取得
      const topProductIds = Object.entries(productIdCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([id]) => id);

      // 商品情報を取得
      const { data: products, error: productError } = await supabase
        .from(TABLES.EXTERNAL_PRODUCTS)
        .select('*')
        .in('id', topProductIds)
        .eq('is_active', true);

      if (productError) {
        return handleSupabaseError(productError);
      }

      return handleSupabaseSuccess(products || []);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  // Get trending products (recently popular)
  static async getTrendingProducts(limit: number = 20) {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      // 最近のスワイプデータを取得
      const { data: recentSwipes, error: swipeError } = await supabase
        .from(TABLES.SWIPES)
        .select('product_id')
        .eq('result', 'yes')
        .gte('created_at', oneWeekAgo.toISOString())
        .order('created_at', { ascending: false });

      if (swipeError) {
        console.error('Error fetching recent swipes:', swipeError);
        // エラー時は最新商品を返す
        const { data: latestProducts, error: productError } = await supabase
          .from(TABLES.EXTERNAL_PRODUCTS)
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (productError) {
          return handleSupabaseError(productError);
        }
        return handleSupabaseSuccess(latestProducts || []);
      }

      if (!recentSwipes || recentSwipes.length === 0) {
        // 最近のスワイプがない場合は最新商品を返す
        const { data: latestProducts, error: productError } = await supabase
          .from(TABLES.EXTERNAL_PRODUCTS)
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (productError) {
          return handleSupabaseError(productError);
        }
        return handleSupabaseSuccess(latestProducts || []);
      }

      // トレンド商品のIDをカウント
      const trendingIdCounts: Record<string, number> = {};
      recentSwipes.forEach(swipe => {
        trendingIdCounts[swipe.product_id] = (trendingIdCounts[swipe.product_id] || 0) + 1;
      });

      // 上位のトレンド商品IDを取得
      const trendingProductIds = Object.entries(trendingIdCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, limit)
        .map(([id]) => id);

      // 商品情報を取得
      const { data: products, error: productError } = await supabase
        .from(TABLES.EXTERNAL_PRODUCTS)
        .select('*')
        .in('id', trendingProductIds)
        .eq('is_active', true);

      if (productError) {
        return handleSupabaseError(productError);
      }

      return handleSupabaseSuccess(products || []);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }

  // Get products by style/category for discovery
  static async getProductsByStyle(style: string, limit: number = 20) {
    try {
      const { data, error } = await supabase
        .from(TABLES.EXTERNAL_PRODUCTS)
        .select('*')
        .contains('tags', [style])
        .eq('is_active', true)
        .limit(limit)
        .order('created_at', { ascending: false });

      if (error) {
        return handleSupabaseError(error);
      }

      return handleSupabaseSuccess(data || []);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }
}

// Export individual functions for convenience
export const getRecommendations = RecommendationService.getPersonalizedRecommendations;
export const analyzeUserPreferences = RecommendationService.analyzeUserPreferences;
export const getPopularProducts = RecommendationService.getPopularProducts;
