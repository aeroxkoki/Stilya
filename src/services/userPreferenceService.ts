import { supabase } from './supabase';

export class UserPreferenceService {
  // スワイプ結果をリアルタイムで反映
  // 注意：rate limit問題を避けるため、user_metadataへの更新は無効化しました
  // 代わりにswipesテーブルのデータを直接分析します
  static async updatePreferenceFromSwipe(
    userId: string,
    productId: string,
    result: 'yes' | 'no',
    swipeTimeMs?: number
  ) {
    try {
      // user_metadataへの頻繁な更新はrate limitエラーの原因となるため
      // この処理は無効化しています
      // スワイプデータは既にswipeService.tsで保存されているため
      // 分析はgetUserPreferencesやanalyzeUserPreferencesで行います
      
      console.log('[UserPreferenceService] Preference update skipped to avoid rate limits');
      
    } catch (error) {
      console.error('Failed to update preference:', error);
    }
  }
  
  // 短期的なトレンドを分析
  // 注意：user_metadataを使用せず、swipesテーブルから直接分析
  static async getShortTermTrends(userId: string) {
    try {
      // 直近のスワイプデータを取得（最新30件）
      const { data: recentSwipes } = await supabase
        .from('swipes')
        .select('product_id')
        .eq('user_id', userId)
        .eq('result', 'yes')
        .order('created_at', { ascending: false })
        .limit(30);
      
      if (!recentSwipes || recentSwipes.length === 0) {
        return [];
      }
      
      // 商品IDから商品情報を取得
      const productIds = recentSwipes.map(s => s.product_id);
      const { data: products } = await supabase
        .from('external_products')
        .select('tags')
        .in('id', productIds);
      
      if (!products || products.length === 0) {
        return [];
      }
      
      // 直近のスワイプからトレンドを分析
      const recentYesTags: Record<string, number> = {};
      
      // 最新10件に重点を置く
      products.slice(0, 10).forEach((product) => {
        product.tags?.forEach((tag: string) => {
          recentYesTags[tag] = (recentYesTags[tag] || 0) + 1;
        });
      });
      
      // スコアが高い順にソート
      return Object.entries(recentYesTags)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([tag]) => tag);
      
    } catch (error) {
      console.error('[getShortTermTrends] Error:', error);
      return [];
    }
  }
}

// 既存のコードとの互換性のため、getUserPreferences関数を追加
export interface UserPreferences {
  userId: string;
  preferredTags: { tag: string; weight: number }[];
  preferredBrands: { brand: string; weight: number }[];
  priceRange: {
    min: number;
    max: number;
    average: number;
  };
}

// ユーザーのスタイルプロファイルを取得
export async function getUserStyleProfile(userId: string) {
  try {
    const { data: swipeData } = await supabase
      .from('swipes')
      .select('product_id, result')
      .eq('user_id', userId)
      .eq('result', 'yes')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!swipeData || swipeData.length === 0) {
      return null;
    }

    // 商品情報を取得
    const productIds = swipeData.map(s => s.product_id);
    const { data: products } = await supabase
      .from('external_products')
      .select('tags, category')
      .in('id', productIds);

    if (!products || products.length === 0) {
      return null;
    }

    // スタイルカテゴリーの集計
    const styleCount: Record<string, number> = {
      'カジュアル': 0,
      'モード': 0,
      'ストリート': 0,
      'キレイめ': 0,
      'ナチュラル': 0,
      'フェミニン': 0,
      'クラシック': 0
    };

    // タグからスタイルを推測
    products.forEach(product => {
      product.tags?.forEach((tag: string) => {
        const lowerTag = tag.toLowerCase();
        
        if (lowerTag.includes('カジュアル') || lowerTag.includes('casual')) {
          styleCount['カジュアル']++;
        }
        if (lowerTag.includes('モード') || lowerTag.includes('mode')) {
          styleCount['モード']++;
        }
        if (lowerTag.includes('ストリート') || lowerTag.includes('street')) {
          styleCount['ストリート']++;
        }
        if (lowerTag.includes('きれいめ') || lowerTag.includes('キレイめ') || lowerTag.includes('elegant')) {
          styleCount['キレイめ']++;
        }
        if (lowerTag.includes('ナチュラル') || lowerTag.includes('natural')) {
          styleCount['ナチュラル']++;
        }
        if (lowerTag.includes('フェミニン') || lowerTag.includes('feminine')) {
          styleCount['フェミニン']++;
        }
        if (lowerTag.includes('クラシック') || lowerTag.includes('classic')) {
          styleCount['クラシック']++;
        }
      });
    });

    // パーセンテージに変換
    const total = Object.values(styleCount).reduce((sum, count) => sum + count, 0);
    const preferredStyles: Record<string, number> = {};
    
    Object.entries(styleCount).forEach(([style, count]) => {
      if (count > 0) {
        preferredStyles[style] = Math.round((count / total) * 100);
      }
    });

    return {
      preferredStyles,
      totalSwipes: swipeData.length
    };

  } catch (error) {
    console.error('[getUserStyleProfile] Error:', error);
    return null;
  }
}

export async function getUserPreferences(userId: string | undefined | null): Promise<UserPreferences | null> {
  try {
    // userIdの検証
    if (!userId || userId === 'undefined' || userId === 'null') {
      console.warn('[getUserPreferences] Invalid userId:', userId);
      return null;
    }
    
    // タグとブランドの嗜好を取得
    const { data: swipeData } = await supabase
      .from('swipes')
      .select('product_id, result')
      .eq('user_id', userId)
      .in('result', ['yes', 'no'])
      .order('created_at', { ascending: false })
      .limit(500);

    if (!swipeData || swipeData.length === 0) {
      // デフォルトの嗜好を返す
      return {
        userId,
        preferredTags: [],
        preferredBrands: [],
        priceRange: {
          min: 2000,
          max: 20000,
          average: 8000
        }
      };
    }

    // Yesスワイプした商品のIDを取得
    const likedProductIds = swipeData
      .filter(s => s.result === 'yes')
      .map(s => s.product_id);

    // Noスワイプした商品のIDも取得（ネガティブシグナル）
    const dislikedProductIds = swipeData
      .filter(s => s.result === 'no')
      .map(s => s.product_id);

    // 商品情報を取得
    const { data: likedProducts } = await supabase
      .from('external_products')
      .select('tags, brand, price')
      .in('id', likedProductIds);

    const { data: dislikedProducts } = await supabase
      .from('external_products')
      .select('tags, brand')
      .in('id', dislikedProductIds);

    // タグとブランドの頻度を計算
    const tagFrequency: Record<string, { positive: number; negative: number }> = {};
    const brandFrequency: Record<string, { positive: number; negative: number }> = {};
    const prices: number[] = [];

    // ポジティブシグナル
    likedProducts?.forEach(product => {
      product.tags?.forEach((tag: string) => {
        if (!tagFrequency[tag]) tagFrequency[tag] = { positive: 0, negative: 0 };
        tagFrequency[tag].positive++;
      });
      if (product.brand) {
        if (!brandFrequency[product.brand]) brandFrequency[product.brand] = { positive: 0, negative: 0 };
        brandFrequency[product.brand].positive++;
      }
      if (product.price) {
        prices.push(product.price);
      }
    });

    // ネガティブシグナル
    dislikedProducts?.forEach(product => {
      product.tags?.forEach((tag: string) => {
        if (!tagFrequency[tag]) tagFrequency[tag] = { positive: 0, negative: 0 };
        tagFrequency[tag].negative++;
      });
      if (product.brand) {
        if (!brandFrequency[product.brand]) brandFrequency[product.brand] = { positive: 0, negative: 0 };
        brandFrequency[product.brand].negative++;
      }
    });

    // スコアを計算してソート（positive - negative * 0.5）
    const preferredTags = Object.entries(tagFrequency)
      .map(([tag, freq]) => ({
        tag,
        weight: freq.positive - freq.negative * 0.5,
        score: freq.positive / (freq.positive + freq.negative)
      }))
      .filter(item => item.weight > 0)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 10)
      .map(item => ({ tag: item.tag, weight: item.score }));

    const preferredBrands = Object.entries(brandFrequency)
      .map(([brand, freq]) => ({
        brand,
        weight: freq.positive - freq.negative * 0.5,
        score: freq.positive / (freq.positive + freq.negative)
      }))
      .filter(item => item.weight > 0)
      .sort((a, b) => b.weight - a.weight)
      .slice(0, 5)
      .map(item => ({ brand: item.brand, weight: item.score }));

    // 価格統計を計算
    const avgPrice = prices.length > 0 
      ? prices.reduce((sum, p) => sum + p, 0) / prices.length 
      : 8000;
    
    const minPrice = prices.length > 0 ? Math.min(...prices) : 2000;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : 20000;

    return {
      userId,
      preferredTags,
      preferredBrands,
      priceRange: {
        min: minPrice,
        max: maxPrice,
        average: avgPrice
      }
    };

  } catch (error) {
    console.error('[UserPreferences] Error getting user preferences:', error);
    return null;
  }
}
