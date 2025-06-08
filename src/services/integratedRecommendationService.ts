import { Product } from '@/types';
import { getRecommendations, analyzeUserPreferences } from './recommendationService';
import { fetchProducts, fetchRelatedProducts } from './productService';

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
  excludeIds: string[] = []
): Promise<{
  recommended: Product[];
  trending: Product[];
  forYou: Product[];
  isLoading: boolean;
}> => {
  try {
    // 並列でデータを取得
    const [internalRecsResult, trendingProducts, userPrefs] = await Promise.all([
      // 内部DBからの推薦（ユーザーのスワイプ履歴に基づく）
      getRecommendations(userId, Math.floor(limit / 2)),
      // トレンド商品（external_productsから最新の商品を取得）
      fetchProducts({
        limit: Math.floor(limit / 2),
        page: 1,
      }),
      // ユーザーの好み分析
      analyzeUserPreferences(userId)
    ]);

    // 内部レコメンドの結果を取得
    const internalRecs = internalRecsResult.success && 'data' in internalRecsResult && internalRecsResult.data ? internalRecsResult.data : [];

    // ユーザーの好みに基づく商品
    let forYouProducts: Product[] = [];
    if (userPrefs.success && 'data' in userPrefs && userPrefs.data && userPrefs.data.likedTags && userPrefs.data.likedTags.length > 0) {
      // タグベースで関連商品を取得（external_productsから）
      forYouProducts = await fetchRelatedProducts(
        userPrefs.data.likedTags,
        excludeIds,
        Math.floor(limit / 2)
      );
    }

    // データが少ない場合は補完（external_productsから）
    if (forYouProducts.length < Math.floor(limit / 4)) {
      const additionalProducts = await fetchProducts({
        keyword: 'おすすめ',
        limit: Math.floor(limit / 4),
        page: 1,
      });
      forYouProducts = [...forYouProducts, ...additionalProducts.products].slice(0, Math.floor(limit / 2));
    }

    return {
      recommended: internalRecs,
      trending: trendingProducts.products || [],
      forYou: forYouProducts,
      isLoading: false
    };
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
  limit: number = 5
): Promise<{
  categoryProducts: Record<string, Product[]>;
  isLoading: boolean;
}> => {
  try {
    const categoryProducts: Record<string, Product[]> = {};
    
    // 各カテゴリから商品を取得
    for (const category of categories) {
      try {
        const { products } = await fetchProducts({
          category,
          limit,
          page: 1,
        });
        categoryProducts[category] = products;
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
  limit: number = 5
): Promise<{
  outfits: OutfitRecommendation[]
}> => {
  try {
    // カテゴリ別商品を取得
    const { categoryProducts } = await getEnhancedCategoryRecommendations(
      userId,
      ['トップス', 'ボトムス', 'アウター', 'アクセサリー'],
      limit * 2
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
