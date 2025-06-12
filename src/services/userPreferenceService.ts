import { supabase } from './supabase';
import { UserPreferences } from '@/utils/productScoring';

/**
 * ユーザーの価格帯嗜好を学習・管理するサービス
 */

export interface PricePreference {
  userId: string;
  averagePrice: number;
  priceRange: {
    min: number;
    max: number;
  };
  priceDistribution: {
    budget: number;    // < 5,000円の割合
    mid: number;       // 5,000-15,000円の割合
    premium: number;   // > 15,000円の割合
  };
  lastUpdated: string;
}

/**
 * ユーザーのスワイプ履歴から価格嗜好を学習
 */
export async function learnPricePreference(userId: string): Promise<PricePreference | null> {
  try {
    // Yesスワイプした商品の価格を取得
    const { data: swipeData, error: swipeError } = await supabase
      .from('swipes')
      .select('product_id')
      .eq('user_id', userId)
      .eq('result', 'yes')
      .order('created_at', { ascending: false })
      .limit(200); // 最新200件

    if (swipeError || !swipeData || swipeData.length === 0) {
      console.log('[PricePreference] No swipe data found for user:', userId);
      return null;
    }

    const productIds = swipeData.map(s => s.product_id);

    // 商品の価格情報を取得
    const { data: products, error: productError } = await supabase
      .from('external_products')
      .select('price')
      .in('id', productIds);

    if (productError || !products || products.length === 0) {
      console.log('[PricePreference] No product data found');
      return null;
    }

    const prices = products.map(p => p.price).filter(price => price > 0);
    
    if (prices.length === 0) {
      return null;
    }

    // 統計値を計算
    const averagePrice = prices.reduce((sum, price) => sum + price, 0) / prices.length;
    const sortedPrices = prices.sort((a, b) => a - b);
    
    // 四分位数を使用した範囲設定
    const q1 = sortedPrices[Math.floor(prices.length * 0.25)];
    const q3 = sortedPrices[Math.floor(prices.length * 0.75)];
    const iqr = q3 - q1;
    
    const minPrice = Math.max(0, q1 - iqr * 0.5);
    const maxPrice = q3 + iqr * 1.5;

    // 価格帯の分布を計算
    const budgetCount = prices.filter(p => p < 5000).length;
    const midCount = prices.filter(p => p >= 5000 && p <= 15000).length;
    const premiumCount = prices.filter(p => p > 15000).length;
    const total = prices.length;

    const preference: PricePreference = {
      userId,
      averagePrice: Math.round(averagePrice),
      priceRange: {
        min: Math.round(minPrice),
        max: Math.round(maxPrice)
      },
      priceDistribution: {
        budget: budgetCount / total,
        mid: midCount / total,
        premium: premiumCount / total
      },
      lastUpdated: new Date().toISOString()
    };

    // データベースに保存（オプション）
    await savePricePreference(preference);

    return preference;

  } catch (error) {
    console.error('[PricePreference] Error learning price preference:', error);
    return null;
  }
}

/**
 * ユーザーの嗜好データを取得してUserPreferencesオブジェクトを構築
 */
export async function getUserPreferences(userId: string): Promise<UserPreferences | null> {
  try {
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

    // 価格嗜好を取得
    const pricePreference = await learnPricePreference(userId);
    
    return {
      userId,
      preferredTags,
      preferredBrands,
      priceRange: pricePreference?.priceRange || {
        min: 2000,
        max: 20000,
        average: 8000
      }
    };

  } catch (error) {
    console.error('[UserPreferences] Error getting user preferences:', error);
    return null;
  }
}

/**
 * 価格嗜好をデータベースに保存（将来の高速化のため）
 */
async function savePricePreference(preference: PricePreference): Promise<void> {
  try {
    // user_preferencesテーブルが存在する場合のみ保存
    // 現在は実装しない（テーブル作成が必要）
    console.log('[PricePreference] Preference calculated:', preference);
  } catch (error) {
    console.error('[PricePreference] Error saving preference:', error);
  }
}

/**
 * 価格帯に基づいて商品をフィルタリング
 */
export function filterByPriceRange(
  products: any[],
  priceRange: { min: number; max: number },
  flexibility: number = 1.2 // 20%の余裕を持たせる
): any[] {
  const adjustedMin = priceRange.min * (2 - flexibility);
  const adjustedMax = priceRange.max * flexibility;
  
  return products.filter(product => 
    product.price >= adjustedMin && product.price <= adjustedMax
  );
}

/**
 * 価格帯の推奨を取得
 */
export function getPriceRangeRecommendation(distribution: PricePreference['priceDistribution']): string {
  if (distribution.budget > 0.6) {
    return 'プチプラ重視';
  } else if (distribution.premium > 0.4) {
    return 'ハイブランド志向';
  } else if (distribution.mid > 0.5) {
    return 'バランス重視';
  } else {
    return '幅広い価格帯';
  }
}