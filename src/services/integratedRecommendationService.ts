import { Product } from '@/types';
import { getRecommendations, analyzeUserPreferences } from './recommendationService';
import { fetchRakutenFashionProducts, fetchRelatedProducts } from './rakutenService';

interface OutfitRecommendation {
  top: Product | null;
  bottom: Product | null;
  outerwear: Product | null;
  accessories: Product | null;
}

/**
 * 複数ソースから統合的なレコメンド結果を取得
 * 内部DB + 楽天API
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
    const [internalRecs, externalRecs, userPrefs] = await Promise.all([
      // 内部DBからの推薦
      getRecommendations(userId, Math.floor(limit / 2)),
      // 楽天APIからの商品取得（トレンド）
      fetchRakutenFashionProducts(undefined, 100371, 1, Math.floor(limit / 2)),
      // ユーザーの好み分析
      analyzeUserPreferences(userId)
    ]);

    // ユーザーの好みに基づく楽天商品
    let forYouProducts: Product[] = [];
    if (userPrefs && userPrefs.topTags && userPrefs.topTags.length > 0) {
      // タグベースで関連商品を取得
      forYouProducts = await fetchRelatedProducts(
        userPrefs.topTags,
        excludeIds,
        Math.floor(limit / 2)
      );
    }

    // データが少ない場合は補完
    if (forYouProducts.length < Math.floor(limit / 4)) {
      const additionalProducts = await fetchRakutenFashionProducts(
        'おすすめ',
        100371,
        1,
        Math.floor(limit / 4)
      );
      forYouProducts = [...forYouProducts, ...additionalProducts.products].slice(0, Math.floor(limit / 2));
    }

    return {
      recommended: internalRecs,
      trending: externalRecs.products || [],
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
 * カテゴリ別のマルチソースレコメンド
 * 内部DB + 楽天API
 */
export const getEnhancedCategoryRecommendations = async (
  userId: string,
  categories: string[] = ['tops', 'bottoms', 'outerwear', 'accessories'],
  limit: number = 5
): Promise<{
  internalRecs: Record<string, Product[]>;
  externalRecs: Record<string, Product[]>;
  isLoading: boolean;
}> => {
  try {
    // 内部DBからカテゴリ別のレコメンド（簡易版）
    const internalRecsArray = await getRecommendations(userId, limit * categories.length);
    
    // カテゴリごとに分割
    const internalRecs: Record<string, Product[]> = {};
    categories.forEach((category, index) => {
      const start = index * limit;
      const end = start + limit;
      internalRecs[category] = internalRecsArray.slice(start, end);
    });

    // 楽天APIからのカテゴリデータ (カテゴリIDマッピング)
    const categoryMappings: Record<string, number> = {
      'tops': 100371,     // レディーストップス（例）
      'bottoms': 565990,  // レディースボトムス（例）
      'outerwear': 566092, // レディースアウター（例）
      'accessories': 215783, // アクセサリー（例）
    };

    // 各カテゴリで並列処理
    const externalRecsPromises = categories.map(async (category) => {
      const genreId = categoryMappings[category] || 100371; // デフォルト
      try {
        const { products } = await fetchRakutenFashionProducts(
          category, // カテゴリ名をキーワードとして使用
          genreId,
          1,
          limit
        );
        return { category, products };
      } catch (error) {
        console.error(`Error fetching external products for category ${category}:`, error);
        return { category, products: [] };
      }
    });

    const externalRecsResults = await Promise.all(externalRecsPromises);
    
    // 結果をオブジェクトに変換
    const externalRecs: Record<string, Product[]> = {};
    externalRecsResults.forEach(({ category, products }) => {
      externalRecs[category] = products;
    });

    return {
      internalRecs,
      externalRecs,
      isLoading: false
    };
  } catch (error) {
    console.error('Error getting enhanced category recommendations:', error);
    return {
      internalRecs: {},
      externalRecs: {},
      isLoading: false
    };
  }
};

/**
 * コーディネート提案
 * 上下アイテムの組み合わせを提案
 */
export const getOutfitRecommendations = async (
  userId: string,
  limit: number = 5
): Promise<{
  outfits: OutfitRecommendation[]
}> => {
  try {
    // カテゴリ別レコメンドを取得
    const { internalRecs, externalRecs } = await getEnhancedCategoryRecommendations(
      userId,
      ['tops', 'bottoms', 'outerwear', 'accessories'],
      limit * 2 // 組み合わせの多様性を確保するため多めに取得
    );

    // 内部・外部のレコメンドを統合
    const tops = [
      ...(internalRecs['tops'] || []),
      ...(externalRecs['tops'] || [])
    ];

    const bottoms = [
      ...(internalRecs['bottoms'] || []),
      ...(externalRecs['bottoms'] || [])
    ];

    const outerwear = [
      ...(internalRecs['outerwear'] || []),
      ...(externalRecs['outerwear'] || [])
    ];

    const accessories = [
      ...(internalRecs['accessories'] || []),
      ...(externalRecs['accessories'] || [])
    ];

    // コーディネートを作成
    const outfits: OutfitRecommendation[] = [];
    
    for (let i = 0; i < limit; i++) {
      // 各カテゴリから1つずつ選択
      const outfit = {
        top: tops[i % tops.length] || null,
        bottom: bottoms[i % bottoms.length] || null,
        outerwear: i % 2 === 0 ? outerwear[i % outerwear.length] || null : null, // 半分のコーデのみアウターを追加
        accessories: i % 3 === 0 ? accessories[i % accessories.length] || null : null, // 1/3のコーデにアクセサリー
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
