import { supabase, handleSupabaseError, handleSupabaseSuccess, TABLES } from './supabase';
import { Product, UserPreference } from '../types';
import { normalizeProduct } from './productService';
import { FilterOptions } from '@/contexts/FilterContext';
import { addScoreNoise, shuffleArray, ensureProductDiversity } from '../utils/randomUtils';
import { StyleQuizResult } from '../contexts/OnboardingContext';

// レコメンデーションサービスクラス
export class RecommendationService {
  // 季節スコアを計算（改善版）
  private static calculateSeasonalScore(product: Product): number {
    const month = new Date().getMonth() + 1;
    const currentSeason = month >= 3 && month <= 8 ? '春夏' : '秋冬';
    
    const tags = product.tags || [];
    
    // 季節性タグをチェック
    if (tags.includes('seasonal:current')) {
      return 2.0; // 現在の季節に最適
    } else if (tags.includes('seasonal:all') || tags.includes('オールシーズン')) {
      return 1.0; // オールシーズン商品
    } else if (tags.includes('seasonal:off')) {
      return 0.5; // 季節外れ
    }
    
    // レガシー処理（タグがない場合）
    if (tags.includes(currentSeason)) {
      return 2.0;
    }
    
    // 季節の変わり目の調整
    const seasonTransitions: Record<number, { boost: string[], reduce: string[] }> = {
      3: { boost: ['春', '春夏'], reduce: ['冬'] },
      6: { boost: ['夏', '春夏'], reduce: ['春'] },
      9: { boost: ['秋', '秋冬'], reduce: ['夏'] },
      12: { boost: ['冬', '秋冬'], reduce: ['秋'] }
    };
    
    const transition = seasonTransitions[month];
    if (transition) {
      for (const tag of transition.boost) {
        if (tags.includes(tag)) return 1.5;
      }
      for (const tag of transition.reduce) {
        if (tags.includes(tag)) return 0.7;
      }
    }
    
    return 1.0; // デフォルト
  }
  
  // 価格適合度スコア（ガウス分布）
  private static calculatePriceScore(
    productPrice: number, 
    userPriceRange: { min: number; max: number }
  ): number {
    const center = (userPriceRange.min + userPriceRange.max) / 2;
    const sigma = (userPriceRange.max - userPriceRange.min) / 4;
    
    // ガウス分布による価格スコア
    const score = Math.exp(-Math.pow(productPrice - center, 2) / (2 * sigma * sigma));
    return score;
  }
  
  // 人気度スコアを計算（新規追加）
  private static calculatePopularityScore(product: Product): number {
    const rating = product.rating || 0;
    const reviewCount = product.reviewCount || 0;
    
    if (reviewCount === 0) return 0;
    
    // レビュー数の対数を使用（大量のレビューでも適度にスケール）
    const reviewScore = Math.log(reviewCount + 1) / 10;
    
    // 評価と人気度の組み合わせ
    const popularityScore = (rating / 5) * reviewScore;
    
    // タグベースのボーナス
    const tags = product.tags || [];
    if (tags.includes('popularity:high')) {
      return popularityScore * 1.5;
    } else if (tags.includes('popularity:medium')) {
      return popularityScore * 1.2;
    }
    
    return popularityScore;
  }
  
  // ネガティブシグナルスコアを計算（新規追加）
  private static calculateNegativeScore(
    product: Product,
    dislikedTags: string[],
    dislikedBrands: string[],
    dislikedCategories: string[]
  ): number {
    let negativeScore = 0;
    const tags = product.tags || [];
    
    // dislikedTagsとのマッチング
    const matchedTags = tags.filter(tag => dislikedTags.includes(tag));
    negativeScore += matchedTags.length * 0.3; // タグごとに0.3ペナルティ
    
    // dislikedBrandのチェック
    if (product.brand && dislikedBrands.includes(product.brand)) {
      negativeScore += 0.5; // ブランドペナルティ
    }
    
    // dislikedCategoryのチェック
    if (product.category && dislikedCategories.includes(product.category)) {
      negativeScore += 0.4; // カテゴリペナルティ
    }
    
    // 0-1の範囲に正規化（1に近いほどネガティブ）
    return Math.min(negativeScore, 1.0);
  }
  
  // 動的な重み付けを計算（改善版）
  private static calculateDynamicWeights(
    preferences: UserPreference
  ): Record<string, number> {
    const swipeCount = preferences.tagScores 
      ? Object.values(preferences.tagScores).reduce((a, b) => a + b, 0)
      : 0;
    
    // スワイプ数が少ない場合は人気度を重視
    if (swipeCount < 10) {
      return {
        tag: 1.0,
        category: 1.0,
        brand: 0.5,
        price: 1.0,
        seasonal: 1.5,
        popularity: 2.0,
        negative: 0.5 // ネガティブシグナルは弱め
      };
    } else if (swipeCount < 50) {
      return {
        tag: 2.0,
        category: 1.5,
        brand: 0.8,
        price: 1.2,
        seasonal: 1.8,
        popularity: 1.5,
        negative: 1.0 // ネガティブシグナルを考慮
      };
    }
    
    // 通常の重み付け（十分な学習後）
    return {
      tag: 3.0,
      category: 2.0,
      brand: 1.0,
      price: 1.5,
      seasonal: 2.0,
      popularity: 1.0,
      negative: 1.5 // ネガティブシグナルを強く考慮
    };
  }

  // Analyze user preferences based on swipe history
  static async analyzeUserPreferences(userId: string | undefined | null) {
    try {
      // userIdの検証
      if (!userId || userId === 'undefined' || userId === 'null') {
        console.warn('[analyzeUserPreferences] Invalid userId:', userId);
        return handleSupabaseError(new Error('Invalid user ID'));
      }
      
      // スワイプ履歴を取得（YesとNo両方）
      const { data: swipes, error: swipeError } = await supabase
        .from(TABLES.SWIPES)
        .select('product_id, result, swipe_time_ms, is_instant_decision')
        .eq('user_id', userId)
        .in('result', ['yes', 'no']);

      if (swipeError) {
        console.error('Error fetching user swipes:', swipeError);
        return handleSupabaseError(swipeError);
      }

      if (!swipes || swipes.length === 0) {
        return handleSupabaseSuccess(null);
      }

      // スワイプの品質を考慮して商品IDを分類
      const weightedLikedIds: { id: string; weight: number }[] = [];
      const weightedDislikedIds: { id: string; weight: number }[] = [];

      swipes.forEach(swipe => {
        const weight = swipe.is_instant_decision ? 1.5 : 1.0; // 即決は重み付けを高く
        
        if (swipe.result === 'yes') {
          weightedLikedIds.push({ id: swipe.product_id, weight });
        } else {
          weightedDislikedIds.push({ id: swipe.product_id, weight });
        }
      });

      // 商品情報を個別に取得
      const allProductIds = [...new Set([
        ...weightedLikedIds.map(w => w.id),
        ...weightedDislikedIds.map(w => w.id)
      ])];

      if (allProductIds.length === 0) {
        return handleSupabaseSuccess(null);
      }

      // 大量のIDの場合は制限する
      const limitedProductIds = allProductIds.length > 1500 
        ? allProductIds.slice(-1500)
        : allProductIds;

      const { data: products, error: productError } = await supabase
        .from(TABLES.EXTERNAL_PRODUCTS)
        .select('id, tags, category, price, brand')
        .in('id', limitedProductIds);

      if (productError) {
        console.error('Error fetching products:', productError);
        return handleSupabaseError(productError);
      }

      if (!products || products.length === 0) {
        return handleSupabaseSuccess(null);
      }

      // 商品情報をマップに変換
      const productMap = new Map(products.map(p => [p.id, p]));

      // 重み付きで分析
      const tagFrequency: Record<string, { positive: number; negative: number }> = {};
      const categoryFrequency: Record<string, { positive: number; negative: number }> = {};
      const brandFrequency: Record<string, { positive: number; negative: number }> = {};
      const prices: number[] = [];

      // ポジティブシグナルの分析
      weightedLikedIds.forEach(({ id, weight }) => {
        const product = productMap.get(id);
        if (!product) return;

        // Count tags with weight
        if (product.tags && Array.isArray(product.tags)) {
          product.tags.forEach((tag: string) => {
            if (!tagFrequency[tag]) tagFrequency[tag] = { positive: 0, negative: 0 };
            tagFrequency[tag].positive += weight;
          });
        }

        // Count categories with weight
        if (product.category) {
          if (!categoryFrequency[product.category]) {
            categoryFrequency[product.category] = { positive: 0, negative: 0 };
          }
          categoryFrequency[product.category].positive += weight;
        }

        // Count brands with weight
        if (product.brand) {
          if (!brandFrequency[product.brand]) {
            brandFrequency[product.brand] = { positive: 0, negative: 0 };
          }
          brandFrequency[product.brand].positive += weight;
        }

        // Collect prices
        if (product.price) {
          prices.push(product.price);
        }
      });

      // ネガティブシグナルの分析
      weightedDislikedIds.forEach(({ id, weight }) => {
        const product = productMap.get(id);
        if (!product) return;

        // Count tags with weight
        if (product.tags && Array.isArray(product.tags)) {
          product.tags.forEach((tag: string) => {
            if (!tagFrequency[tag]) tagFrequency[tag] = { positive: 0, negative: 0 };
            tagFrequency[tag].negative += weight;
          });
        }

        // Count categories with weight
        if (product.category) {
          if (!categoryFrequency[product.category]) {
            categoryFrequency[product.category] = { positive: 0, negative: 0 };
          }
          categoryFrequency[product.category].negative += weight;
        }

        // Count brands with weight
        if (product.brand) {
          if (!brandFrequency[product.brand]) {
            brandFrequency[product.brand] = { positive: 0, negative: 0 };
          }
          brandFrequency[product.brand].negative += weight;
        }
      });

      // 好みと嫌いを計算
      const likedTags = Object.entries(tagFrequency)
        .filter(([_, freq]) => freq.positive > freq.negative)
        .sort(([, a], [, b]) => (b.positive - b.negative) - (a.positive - a.negative))
        .slice(0, 10)
        .map(([tag]) => tag);

      const dislikedTags = Object.entries(tagFrequency)
        .filter(([_, freq]) => freq.negative > freq.positive * 1.5) // より強いネガティブシグナル
        .sort(([, a], [, b]) => (b.negative - b.positive) - (a.negative - a.positive))
        .slice(0, 10)
        .map(([tag]) => tag);

      const preferredCategories = Object.entries(categoryFrequency)
        .filter(([_, freq]) => freq.positive > freq.negative)
        .sort(([, a], [, b]) => (b.positive - b.negative) - (a.positive - a.negative))
        .slice(0, 5)
        .map(([category]) => category);

      const dislikedCategories = Object.entries(categoryFrequency)
        .filter(([_, freq]) => freq.negative > freq.positive * 1.5)
        .sort(([, a], [, b]) => (b.negative - b.positive) - (a.negative - a.positive))
        .slice(0, 5)
        .map(([category]) => category);

      const preferredBrands = Object.entries(brandFrequency)
        .filter(([_, freq]) => freq.positive > freq.negative)
        .sort(([, a], [, b]) => (b.positive - b.negative) - (a.positive - a.negative))
        .slice(0, 5)
        .map(([brand]) => brand);

      const dislikedBrands = Object.entries(brandFrequency)
        .filter(([_, freq]) => freq.negative > freq.positive * 1.5)
        .sort(([, a], [, b]) => (b.negative - b.positive) - (a.negative - a.positive))
        .slice(0, 5)
        .map(([brand]) => brand);

      const avgPriceRange = prices.length > 0 ? {
        min: Math.min(...prices),
        max: Math.max(...prices),
      } : { min: 0, max: 100000 };

      // tagScoresを数値形式に変換（既存コードとの互換性のため）
      const tagScores: Record<string, number> = {};
      Object.entries(tagFrequency).forEach(([tag, freq]) => {
        const score = freq.positive - (freq.negative * 1.0); // ネガティブシグナルの重みを強化
        if (score > 0) {
          tagScores[tag] = score;
        }
      });

      const userPreference: UserPreference = {
        userId,
        likedTags,
        dislikedTags,
        preferredCategories,
        dislikedCategories, // 新規追加
        avgPriceRange,
        brands: preferredBrands,
        dislikedBrands,
        price_range: avgPriceRange,
        topTags: likedTags.slice(0, 5),
        tagScores,
      };

      return handleSupabaseSuccess(userPreference);
    } catch (error) {
      console.error('Error analyzing user preferences:', error);
      return handleSupabaseError(error as Error);
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
      const weights = RecommendationService.calculateDynamicWeights(preferences);

      // 多めに商品を取得してランダム性を確保
      const poolSize = limit * 8; // より多くの商品を取得（フィルタリング用）
      
      // 商品を取得
      let products: Product[] = [];
      
      // まず、dislikedTagsを含まない商品を優先的に取得
      const baseQuery = supabase
        .from(TABLES.EXTERNAL_PRODUCTS)
        .select('*')
        .eq('is_active', true);

      // ネガティブフィルタリング：嫌いなブランドを除外
      if (preferences.dislikedBrands && preferences.dislikedBrands.length > 0) {
        baseQuery.not('brand', 'in', `(${preferences.dislikedBrands.join(',')})`);
      }

      const { data: filteredProducts, error: filterError } = await baseQuery
        .order('created_at', { ascending: false })
        .limit(poolSize);

      if (filterError) {
        console.error('[getPersonalizedRecommendations] Error fetching filtered products:', filterError);
      } else if (filteredProducts) {
        products = filteredProducts;
      }

      console.log('[getPersonalizedRecommendations] Retrieved products:', products.length);

      // スワイプ済み商品を取得して除外
      const { data: swipedProducts, error: swipedError } = await supabase
        .from(TABLES.SWIPES)
        .select('product_id')
        .eq('user_id', userId);

      if (swipedError) {
        console.error('[getPersonalizedRecommendations] Error fetching swiped products:', swipedError);
      }

      const swipedProductIds = new Set(swipedProducts?.map(s => s.product_id) || []);

      // スコアリング
      const scoredProducts = products
        .filter(product => !swipedProductIds.has(product.id))
        .map(product => {
          const tags = product.tags || [];
          const productPrice = product.price || 0;

          // タグスコア
          let tagScore = 0;
          tags.forEach(tag => {
            if (preferences.tagScores && preferences.tagScores[tag]) {
              tagScore += preferences.tagScores[tag];
            }
          });
          tagScore = tagScore / Math.max(tags.length, 1);

          // カテゴリスコア
          const categoryScore = product.category && preferences.preferredCategories?.includes(product.category) ? 1 : 0;

          // ブランドスコア
          const brandScore = product.brand && preferences.brands?.includes(product.brand) ? 1 : 0;

          // 価格スコア
          const priceScore = preferences.avgPriceRange 
            ? RecommendationService.calculatePriceScore(productPrice, preferences.avgPriceRange)
            : 0.5;

          // 季節スコア
          const seasonalScore = RecommendationService.calculateSeasonalScore(product);

          // 人気度スコア
          const popularityScore = RecommendationService.calculatePopularityScore(product);

          // ネガティブスコア（新規追加）
          const negativeScore = RecommendationService.calculateNegativeScore(
            product,
            preferences.dislikedTags || [],
            preferences.dislikedBrands || [],
            preferences.dislikedCategories || []
          );

          // 総合スコア（ネガティブスコアを減算）
          const totalScore = (
            tagScore * weights.tag +
            categoryScore * weights.category +
            brandScore * weights.brand +
            priceScore * weights.price +
            seasonalScore * weights.seasonal +
            popularityScore * weights.popularity
          ) * (1 - negativeScore * weights.negative); // ネガティブスコアによる減衰

          return {
            ...product,
            score: totalScore
          };
        })
        .sort((a, b) => b.score - a.score);

      // スコアにノイズを追加してランダム性を確保
      const noisyProducts = scoredProducts.map(product => ({
        ...product,
        score: addScoreNoise(product.score, 0.3)
      }));

      // 再ソート
      noisyProducts.sort((a, b) => b.score - a.score);

      // 拡張版多様性確保（スタイルタグも考慮）
      const diverseProducts = ensureProductDiversityWithStyles(noisyProducts, {
        maxSameCategory: 2,
        maxSameBrand: 2,
        maxSamePriceRange: 3,
        maxSameStyle: 2,
        windowSize: 5
      });
        
      // Remove score property and return
      const recommendations = diverseProducts
        .slice(0, limit)
        .map(({ score: _score, ...product }) => product)
        .map(normalizeProduct); // 正規化を追加

      return handleSupabaseSuccess(recommendations);
    } catch (error) {
      return handleSupabaseError(error as Error);
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
        // 正規化して返す
        const normalizedProducts = (latestProducts || []).map(normalizeProduct);
        return handleSupabaseSuccess(normalizedProducts);
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
        // 正規化して返す
        const normalizedProducts = (latestProducts || []).map(normalizeProduct);
        return handleSupabaseSuccess(normalizedProducts);
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

      // 正規化して返す
      const normalizedProducts = (products || []).map(normalizeProduct);
      return handleSupabaseSuccess(normalizedProducts);
    } catch (error) {
      return handleSupabaseError(error as Error);
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
        // 正規化して返す
        const normalizedProducts = (latestProducts || []).map(normalizeProduct);
        return handleSupabaseSuccess(normalizedProducts);
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
        // 正規化して返す
        const normalizedProducts = (latestProducts || []).map(normalizeProduct);
        return handleSupabaseSuccess(normalizedProducts);
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

      // 正規化して返す
      const normalizedProducts = (products || []).map(normalizeProduct);
      return handleSupabaseSuccess(normalizedProducts);
    } catch (error) {
      return handleSupabaseError(error as Error);
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

      // 正規化して返す
      const normalizedProducts = (data || []).map(normalizeProduct);
      return handleSupabaseSuccess(normalizedProducts);
    } catch (error) {
      return handleSupabaseError(error);
    }
  }
}

// 拡張版多様性確保関数（スタイルタグも考慮）
function ensureProductDiversityWithStyles<T extends { 
  category?: string; 
  brand?: string; 
  price?: number;
  tags?: string[];
}>(
  products: T[],
  options: {
    maxSameCategory?: number;
    maxSameBrand?: number;
    maxSamePriceRange?: number;
    maxSameStyle?: number;
    windowSize?: number;
  } = {}
): T[] {
  const {
    maxSameCategory = 2,
    maxSameBrand = 2,
    maxSamePriceRange = 3,
    maxSameStyle = 2,
    windowSize = 5
  } = options;
  
  const result: T[] = [];
  const recentCategories: string[] = [];
  const recentBrands: string[] = [];
  const recentPriceRanges: string[] = [];
  const recentStyles: string[] = [];
  
  // スタイルタグの定義
  const stylePatterns = [
    'カジュアル', 'フォーマル', 'ストリート', 'モード', 'ナチュラル',
    'フェミニン', 'クール', 'エレガント', 'スポーティ', 'ガーリー',
    'シンプル', 'ベーシック', 'トレンド', 'レトロ', 'ヴィンテージ'
  ];
  
  for (const product of products) {
    // productがnullまたはundefinedの場合はスキップ
    if (product == null) {
      console.warn('[ensureProductDiversity] Null or undefined product detected, skipping');
      continue;
    }
    
    // 価格帯を判定
    const priceRange = product.price 
      ? product.price < 3000 ? 'low' :
        product.price < 10000 ? 'middle' :
        product.price < 30000 ? 'high' :
        'luxury'
      : 'unknown';
    
    // スタイルタグを抽出
    const productStyles = (product.tags || [])
      .filter(tag => stylePatterns.some(pattern => tag.includes(pattern)))
      .slice(0, 2); // 主要な2つのスタイルのみ
    
    // カテゴリとブランドの出現回数をカウント
    const categoryCount = product.category 
      ? recentCategories.filter(c => c === product.category).length 
      : 0;
    const brandCount = product.brand 
      ? recentBrands.filter(b => b === product.brand).length 
      : 0;
    const priceRangeCount = recentPriceRanges.filter(p => p === priceRange).length;
    
    // スタイルの重複をチェック
    const styleOverlapCount = productStyles.filter(style => 
      recentStyles.filter(s => s === style).length >= maxSameStyle
    ).length;
    
    // 多様性の条件を満たす場合のみ追加
    if (categoryCount < maxSameCategory && 
        brandCount < maxSameBrand && 
        priceRangeCount < maxSamePriceRange &&
        styleOverlapCount === 0) {
      result.push(product);
      
      // 最近の履歴に追加
      if (product.category) recentCategories.push(product.category);
      if (product.brand) recentBrands.push(product.brand);
      recentPriceRanges.push(priceRange);
      productStyles.forEach(style => recentStyles.push(style));
      
      // ウィンドウサイズを超えたら古いものを削除
      if (recentCategories.length > windowSize) recentCategories.shift();
      if (recentBrands.length > windowSize) recentBrands.shift();
      if (recentPriceRanges.length > windowSize) recentPriceRanges.shift();
      while (recentStyles.length > windowSize * 2) recentStyles.shift();
    }
  }
  
  // 不足分は元の順序で補完
  if (result.length < products.length) {
    const remaining = products.filter(p => !result.includes(p));
    result.push(...remaining.slice(0, products.length - result.length));
  }
  
  return result;
}

// SwipePatternAnalyzerクラス - 連続的なNoパターンの検出とセッション調整
export class SwipePatternAnalyzer {
  // 連続Noパターンの検出
  static detectConsecutiveNos(
    swipes: Array<{product_id: string; result: string; created_at: string}>, 
    threshold: number = 3
  ): {
    patterns: Array<{
      type: 'category' | 'brand' | 'price_range' | 'style';
      value: string;
      count: number;
    }>;
  } {
    const patterns: Array<{
      type: 'category' | 'brand' | 'price_range' | 'style';
      value: string;
      count: number;
    }> = [];
    
    // 最新のthreshold件のNoスワイプを分析
    const recentNoSwipes = swipes
      .filter(s => s.result === 'no')
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, threshold);
    
    if (recentNoSwipes.length < threshold) {
      return { patterns };
    }
    
    // 共通する特徴を抽出するための一時的な実装
    // TODO: 実際の商品データと結合して特徴を抽出
    console.log('[SwipePatternAnalyzer] Analyzing consecutive No patterns:', recentNoSwipes.length);
    
    return { patterns };
  }
  
  // セッション内での即時調整
  static getSessionAdjustments(recentSwipes: Array<{
    product_id: string; 
    result: string; 
    created_at: string;
    tags?: string[];
    brand?: string;
    category?: string;
  }>): {
    avoidTags: string[];
    avoidBrands: string[];
    boostTags: string[];
  } {
    const adjustments = {
      avoidTags: [] as string[],
      avoidBrands: [] as string[],
      boostTags: [] as string[]
    };
    
    // 直近10件のスワイプから即時調整を計算
    const recent = recentSwipes.slice(0, 10);
    const tagCounts: Record<string, { yes: number; no: number }> = {};
    const brandCounts: Record<string, { yes: number; no: number }> = {};
    
    recent.forEach(swipe => {
      // タグの集計
      if (swipe.tags) {
        swipe.tags.forEach(tag => {
          if (!tagCounts[tag]) tagCounts[tag] = { yes: 0, no: 0 };
          tagCounts[tag][swipe.result === 'yes' ? 'yes' : 'no']++;
        });
      }
      
      // ブランドの集計
      if (swipe.brand) {
        if (!brandCounts[swipe.brand]) brandCounts[swipe.brand] = { yes: 0, no: 0 };
        brandCounts[swipe.brand][swipe.result === 'yes' ? 'yes' : 'no']++;
      }
    });
    
    // 避けるべきタグ（No率が高い）
    Object.entries(tagCounts).forEach(([tag, counts]) => {
      if (counts.no >= 3 && counts.no > counts.yes * 2) {
        adjustments.avoidTags.push(tag);
      } else if (counts.yes >= 3 && counts.yes > counts.no * 2) {
        adjustments.boostTags.push(tag);
      }
    });
    
    // 避けるべきブランド
    Object.entries(brandCounts).forEach(([brand, counts]) => {
      if (counts.no >= 2 && counts.no > counts.yes) {
        adjustments.avoidBrands.push(brand);
      }
    });
    
    console.log('[SwipePatternAnalyzer] Session adjustments:', adjustments);
    return adjustments;
  }
}

// スタイル診断結果を分析して初期の好みを設定
export class StyleQuizAnalyzer {
  static analyzeQuizResults(quizResults: StyleQuizResult[]): {
    likedTags: string[];
    dislikedTags: string[];
    preferredCategories: string[];
    dislikedCategories: string[];
    initialTagScores: Record<string, number>;
  } {
    const tagCounts: Record<string, { positive: number; negative: number }> = {};
    const categoryCounts: Record<string, { positive: number; negative: number }> = {};

    // 診断結果を集計
    quizResults.forEach(result => {
      const weight = 1.5; // 診断結果は重要度を高く設定

      // タグの集計
      if (result.tags && Array.isArray(result.tags)) {
        result.tags.forEach(tag => {
          if (!tagCounts[tag]) tagCounts[tag] = { positive: 0, negative: 0 };
          if (result.liked) {
            tagCounts[tag].positive += weight;
          } else {
            tagCounts[tag].negative += weight;
          }
        });
      }

      // カテゴリの集計
      if (result.category) {
        if (!categoryCounts[result.category]) {
          categoryCounts[result.category] = { positive: 0, negative: 0 };
        }
        if (result.liked) {
          categoryCounts[result.category].positive += weight;
        } else {
          categoryCounts[result.category].negative += weight;
        }
      }
    });

    // 好きなタグを抽出
    const likedTags = Object.entries(tagCounts)
      .filter(([_, counts]) => counts.positive > counts.negative)
      .sort(([, a], [, b]) => (b.positive - b.negative) - (a.positive - a.negative))
      .slice(0, 10)
      .map(([tag]) => tag);

    // 嫌いなタグを抽出
    const dislikedTags = Object.entries(tagCounts)
      .filter(([_, counts]) => counts.negative > counts.positive * 1.2)
      .sort(([, a], [, b]) => (b.negative - b.positive) - (a.negative - a.positive))
      .slice(0, 10)
      .map(([tag]) => tag);

    // 好きなカテゴリを抽出
    const preferredCategories = Object.entries(categoryCounts)
      .filter(([_, counts]) => counts.positive > counts.negative)
      .sort(([, a], [, b]) => (b.positive - b.negative) - (a.positive - a.negative))
      .slice(0, 5)
      .map(([category]) => category);

    // 嫌いなカテゴリを抽出
    const dislikedCategories = Object.entries(categoryCounts)
      .filter(([_, counts]) => counts.negative > counts.positive * 1.2)
      .sort(([, a], [, b]) => (b.negative - b.positive) - (a.negative - a.positive))
      .slice(0, 5)
      .map(([category]) => category);

    // 初期タグスコアを計算
    const initialTagScores: Record<string, number> = {};
    Object.entries(tagCounts).forEach(([tag, counts]) => {
      const score = counts.positive - counts.negative;
      if (score > 0) {
        initialTagScores[tag] = score;
      }
    });

    return {
      likedTags,
      dislikedTags,
      preferredCategories,
      dislikedCategories,
      initialTagScores,
    };
  }

  // スタイル診断結果を保存
  static async saveQuizResults(userId: string, quizResults: StyleQuizResult[]) {
    try {
      // 診断結果を分析
      const analysis = StyleQuizAnalyzer.analyzeQuizResults(quizResults);

      // ユーザープロファイルに保存するデータを準備
      const profileData = {
        user_id: userId,
        style_quiz_completed: true,
        style_quiz_results: quizResults,
        initial_liked_tags: analysis.likedTags,
        initial_disliked_tags: analysis.dislikedTags,
        initial_preferred_categories: analysis.preferredCategories,
        initial_disliked_categories: analysis.dislikedCategories,
        updated_at: new Date().toISOString(),
      };

      // Supabaseに保存
      const { error } = await supabase
        .from('user_style_preferences')
        .upsert(profileData, { onConflict: 'user_id' });

      if (error) {
        console.error('Error saving quiz results:', error);
        return handleSupabaseError(error);
      }

      // 診断結果をスワイプ履歴として記録（初期学習データとして）
      const swipePromises = quizResults.map(result => 
        supabase
          .from(TABLES.SWIPES)
          .insert({
            user_id: userId,
            product_id: result.productId,
            result: result.liked ? 'yes' : 'no',
            is_style_quiz: true, // 診断結果であることを示すフラグ
          })
      );

      await Promise.all(swipePromises);

      return handleSupabaseSuccess(analysis);
    } catch (error) {
      console.error('Error in saveQuizResults:', error);
      return handleSupabaseError(error as Error);
    }
  }
}

// Export individual functions for convenience
export const getRecommendations = RecommendationService.getPersonalizedRecommendations;
export const analyzeUserPreferences = RecommendationService.analyzeUserPreferences;