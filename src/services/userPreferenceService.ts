import { supabase } from './supabase';

export class UserPreferenceService {
  // スワイプ結果をリアルタイムで反映
  static async updatePreferenceFromSwipe(
    userId: string,
    productId: string,
    result: 'yes' | 'no',
    swipeTimeMs?: number
  ) {
    try {
      // 商品情報を取得
      const { data: product } = await supabase
        .from('external_products')
        .select('tags, category, brand, price')
        .eq('id', productId)
        .single();
      
      if (!product) return;
      
      // ユーザーのメタデータを取得
      const { data: { user } } = await supabase.auth.getUser();
      const metadata = user?.user_metadata || {};
      
      // タグスコアを更新
      const tagScores = metadata.tag_scores || {};
      const weight = swipeTimeMs && swipeTimeMs < 1000 ? 0.5 : 1.0;
      
      product.tags?.forEach((tag: string) => {
        const currentScore = tagScores[tag] || 0;
        const change = result === 'yes' ? weight : -weight * 0.5;
        tagScores[tag] = currentScore + change;
      });
      
      // 短期嗜好を記録（直近30スワイプ）
      const recentSwipes = metadata.recent_swipes || [];
      recentSwipes.push({
        productId,
        result,
        tags: product.tags,
        timestamp: new Date().toISOString()
      });
      
      // 30件を超えたら古いものを削除
      if (recentSwipes.length > 30) {
        recentSwipes.shift();
      }
      
      // メタデータを更新
      await supabase.auth.updateUser({
        data: {
          tag_scores: tagScores,
          recent_swipes: recentSwipes
        }
      });
      
    } catch (error) {
      console.error('Failed to update preference:', error);
    }
  }
  
  // 短期的なトレンドを分析
  static async getShortTermTrends(userId: string) {
    const { data: { user } } = await supabase.auth.getUser();
    const recentSwipes = user?.user_metadata?.recent_swipes || [];
    
    // 直近のスワイプからトレンドを分析
    const recentYesTags: Record<string, number> = {};
    
    recentSwipes
      .filter((swipe: any) => swipe.result === 'yes')
      .slice(-10) // 直近10件のYes
      .forEach((swipe: any) => {
        swipe.tags?.forEach((tag: string) => {
          recentYesTags[tag] = (recentYesTags[tag] || 0) + 1;
        });
      });
    
    // スコアが高い順にソート
    return Object.entries(recentYesTags)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag);
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
