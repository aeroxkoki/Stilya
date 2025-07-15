import { Product } from '@/types';
import { getRecommendations, analyzeUserPreferences } from './recommendationService';
import { fetchProducts, fetchProductsByTags, fetchRandomizedProducts, convertToProductFilters } from './productService';
import { FilterOptions } from '@/contexts/FilterContext';

interface OutfitRecommendation {
  top: Product | null;
  bottom: Product | null;
  outerwear: Product | null;
  accessories: Product | null;
}

/**
 * 統一されたデータソースから推薦結果を取得
 * external_productsテーブルをメインソースとして使用
 */
export const getEnhancedRecommendations = async (
  userId: string,
  limit: number = 20,
  excludeIds: string[] = [],
  filters?: FilterOptions
): Promise<{
  recommended: Product[];
  trending: Product[];
  forYou: Product[];
  isLoading: boolean;
}> => {
  try {
    // デフォルトフィルター
    const defaultFilters: FilterOptions = {
      ...filters
    };

    console.log('[integratedRecommendationService] Starting with limit:', limit);

    // 並列でデータを取得（各ソースからより多くの商品を要求）
    const [internalRecsResult, trendingProducts, userPrefs] = await Promise.all([
      // 内部DBからの推薦（ユーザーのスワイプ履歴に基づく）
      getRecommendations(userId, limit, defaultFilters), // 全limitを要求
      // トレンド商品（ランダム性を加えて取得）
      fetchRandomizedProducts(limit, 0, defaultFilters, `trending-${new Date().toDateString()}`), // 全limitを要求
      // ユーザーの好み分析
      analyzeUserPreferences(userId)
    ]);

    console.log('[integratedRecommendationService] Results:', {
      internalRecs: internalRecsResult.success && 'data' in internalRecsResult ? internalRecsResult.data?.length : 0,
      trending: trendingProducts.success && 'data' in trendingProducts ? trendingProducts.data?.length : 0,
    });

    // 内部レコメンドの結果を取得
    let internalRecs = internalRecsResult.success && 'data' in internalRecsResult && internalRecsResult.data ? internalRecsResult.data : [];

    // ユーザーの好みに基づく商品
    let forYouProducts: Product[] = [];
    if (userPrefs.success && 'data' in userPrefs && userPrefs.data && userPrefs.data.likedTags && userPrefs.data.likedTags.length > 0) {
      // タグベースで関連商品を取得（external_productsから）
      const tagResult = await fetchProductsByTags(
        userPrefs.data.likedTags,
        limit, // 全limitを要求
        defaultFilters
      );
      forYouProducts = tagResult.success && 'data' in tagResult && tagResult.data ? tagResult.data : [];
      
      console.log('[integratedRecommendationService] ForYou products:', forYouProducts.length);
    }

    // データが少ない場合は補完（より多くの商品を取得）
    const currentTotal = internalRecs.length + (trendingProducts.data?.length || 0) + forYouProducts.length;
    if (currentTotal < limit) {
      console.log('[integratedRecommendationService] Not enough products, fetching additional:', {
        currentTotal,
        needed: limit - currentTotal
      });
      
      const additionalProducts = await fetchRandomizedProducts(
        limit * 2, // より多くの商品を要求
        Math.max(0, limit), // オフセットを調整
        defaultFilters,
        `additional-${userId}-${new Date().getTime()}`
      );
      
      if (additionalProducts.success && additionalProducts.data) {
        console.log('[integratedRecommendationService] Additional products fetched:', additionalProducts.data.length);
        
        // 既存の商品IDを収集
        const existingIds = new Set([
          ...internalRecs.map(p => p.id),
          ...(trendingProducts.data || []).map(p => p.id),
          ...forYouProducts.map(p => p.id)
        ]);
        
        // 重複を除外して追加
        const uniqueAdditional = additionalProducts.data.filter(p => !existingIds.has(p.id));
        
        // 各カテゴリに均等に分配
        const perCategory = Math.ceil(uniqueAdditional.length / 3);
        internalRecs = [...internalRecs, ...uniqueAdditional.slice(0, perCategory)];
        if (trendingProducts.data) {
          trendingProducts.data = [...trendingProducts.data, ...uniqueAdditional.slice(perCategory, perCategory * 2)];
        }
        forYouProducts = [...forYouProducts, ...uniqueAdditional.slice(perCategory * 2)];
      }
    }

    const finalResult = {
      recommended: internalRecs,
      trending: trendingProducts.success && 'data' in trendingProducts && trendingProducts.data ? trendingProducts.data : [],
      forYou: forYouProducts,
      isLoading: false
    };

    console.log('[integratedRecommendationService] Final results:', {
      recommended: finalResult.recommended.length,
      trending: finalResult.trending.length,
      forYou: finalResult.forYou.length,
      total: finalResult.recommended.length + finalResult.trending.length + finalResult.forYou.length
    });

    return finalResult;
  } catch (error) {
    console.error('Error getting enhanced recommendations:', error);
    // エラー時は部分的な結果でも返す
    return {
      recommended: [],
      trending: [],
      forYou: [],
      isLoading: false
    };
  }
};

/**
 * カテゴリ別の統一データソースレコメンド
 * external_productsテーブルから取得
 */
export const getEnhancedCategoryRecommendations = async (
  userId: string,
  categories: string[] = ['メンズファッション', 'レディースファッション', 'バッグ', 'シューズ'],
  limit: number = 5,
  filters?: FilterOptions
): Promise<{
  categoryProducts: Record<string, Product[]>;
  isLoading: boolean;
}> => {
  try {
    // デフォルトフィルター
    const defaultFilters: FilterOptions = {
      ...filters
    };

    const categoryProducts: Record<string, Product[]> = {};
    
    // 各カテゴリから商品を取得
    for (const category of categories) {
      try {
        // TODO: カテゴリベースの商品取得機能を実装する必要がある
        const productFilters = convertToProductFilters(defaultFilters);
        const result = await fetchProducts(limit, 0, productFilters);
        categoryProducts[category] = result.success && 'data' in result && result.data ? result.data : [];
      } catch (error) {
        console.error(`Error fetching products for category ${category}:`, error);
        categoryProducts[category] = [];
      }
    }

    return {
      categoryProducts,
      isLoading: false
    };
  } catch (error) {
    console.error('Error getting enhanced category recommendations:', error);
    return {
      categoryProducts: {},
      isLoading: false
    };
  }
};

/**
 * コーディネート提案
 * external_productsテーブルから商品を組み合わせて提案
 */
export const getOutfitRecommendations = async (
  userId: string,
  limit: number = 5,
  filters?: FilterOptions
): Promise<{
  outfits: OutfitRecommendation[]
}> => {
  try {
    // デフォルトフィルター
    const defaultFilters: FilterOptions = {
      ...filters
    };

    // カテゴリ別商品を取得
    const { categoryProducts } = await getEnhancedCategoryRecommendations(
      userId,
      ['トップス', 'ボトムス', 'アウター', 'アクセサリー'],
      limit * 2,
      defaultFilters
    );

    const tops = categoryProducts['トップス'] || [];
    const bottoms = categoryProducts['ボトムス'] || [];
    const outerwear = categoryProducts['アウター'] || [];
    const accessories = categoryProducts['アクセサリー'] || [];

    // コーディネートを作成
    const outfits: OutfitRecommendation[] = [];
    
    for (let i = 0; i < limit; i++) {
      // 各カテゴリから1つずつ選択
      const outfit = {
        top: tops[i % tops.length] || null,
        bottom: bottoms[i % bottoms.length] || null,
        outerwear: i % 2 === 0 ? outerwear[i % outerwear.length] || null : null,
        accessories: i % 3 === 0 ? accessories[i % accessories.length] || null : null,
      } as OutfitRecommendation;
      
      // 最低限トップスまたはボトムスがあるものだけ追加
      if (outfit.top || outfit.bottom) {
        outfits.push(outfit);
      }
    }

    return { outfits };
  } catch (error) {
    console.error('Error getting outfit recommendations:', error);
    return { outfits: [] };
  }
};
