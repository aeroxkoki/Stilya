/**
 * 強化版パーソナライゼーションサービス
 * ユーザーの好みを学習して動的にソートする
 */

import { Product } from '@/types';
import { supabase } from './supabase';
import { STYLE_TAG_MAPPING } from '@/constants/constants';
import { determineProductStyleAdvanced } from './tagMappingService';

interface UserPreferenceProfile {
  stylePreferences: Record<string, number>;
  categoryPreferences: Record<string, number>;
  brandPreferences: Record<string, number>;
  priceRange: { min: number; max: number; preferred: number };
  colorPreferences: Record<string, number>;
  recentInteractions: Array<{
    productId: string;
    action: 'view' | 'swipe_yes' | 'swipe_no' | 'favorite';
    timestamp: Date;
  }>;
}

/**
 * ユーザーの好みプロファイルを生成
 */
export async function generateUserPreferenceProfile(userId: string): Promise<UserPreferenceProfile> {
  // スワイプ履歴を取得
  const { data: swipes } = await supabase
    .from('swipes')
    .select(`
      result,
      created_at,
      product:external_products(
        id,
        tags,
        category,
        brand,
        price,
        style_tags
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(500);

  // お気に入りを取得
  const { data: favorites } = await supabase
    .from('favorites')
    .select(`
      created_at,
      product:external_products(
        id,
        tags,
        category,
        brand,
        price,
        style_tags
      )
    `)
    .eq('user_id', userId);

  const profile: UserPreferenceProfile = {
    stylePreferences: {},
    categoryPreferences: {},
    brandPreferences: {},
    priceRange: { min: 0, max: 50000, preferred: 10000 },
    colorPreferences: {},
    recentInteractions: []
  };

  // スワイプ履歴から好みを分析
  if (swipes) {
    const prices: number[] = [];
    
    swipes.forEach((swipe: any) => {
      if (!swipe.product) return;
      
      const weight = swipe.result === 'yes' ? 1 : -0.3;
      const product = swipe.product;
      
      // スタイルの好みを更新
      const style = product.style_tags?.[0] || determineProductStyleAdvanced(product.tags || [], product.category);
      profile.stylePreferences[style] = (profile.stylePreferences[style] || 0) + weight;
      
      // カテゴリの好みを更新
      if (product.category) {
        profile.categoryPreferences[product.category] = 
          (profile.categoryPreferences[product.category] || 0) + weight;
      }
      
      // ブランドの好みを更新
      if (product.brand) {
        profile.brandPreferences[product.brand] = 
          (profile.brandPreferences[product.brand] || 0) + weight;
      }
      
      // 価格帯を記録
      if (swipe.result === 'yes' && product.price) {
        prices.push(product.price);
      }
      
      // 色の好みを分析
      const colorTags = ['黒', 'ブラック', '白', 'ホワイト', 'ネイビー', 'グレー', 
                        'ベージュ', 'ブラウン', 'カーキ', 'ピンク', 'レッド', 'ブルー'];
      product.tags?.forEach((tag: string) => {
        colorTags.forEach(color => {
          if (tag.includes(color)) {
            profile.colorPreferences[color] = 
              (profile.colorPreferences[color] || 0) + weight;
          }
        });
      });
      
      // 最近のインタラクションを記録
      profile.recentInteractions.push({
        productId: product.id,
        action: swipe.result === 'yes' ? 'swipe_yes' : 'swipe_no',
        timestamp: new Date(swipe.created_at)
      });
    });
    
    // 価格帯を計算
    if (prices.length > 0) {
      prices.sort((a, b) => a - b);
      profile.priceRange = {
        min: prices[Math.floor(prices.length * 0.1)],
        max: prices[Math.floor(prices.length * 0.9)],
        preferred: prices[Math.floor(prices.length * 0.5)]
      };
    }
  }
  
  // お気に入りから好みを強化
  if (favorites) {
    favorites.forEach((fav: any) => {
      if (!fav.product) return;
      
      const product = fav.product;
      const weight = 2; // お気に入りは重みを大きく
      
      const style = product.style_tags?.[0] || determineProductStyleAdvanced(product.tags || [], product.category);
      profile.stylePreferences[style] = (profile.stylePreferences[style] || 0) + weight;
      
      if (product.category) {
        profile.categoryPreferences[product.category] = 
          (profile.categoryPreferences[product.category] || 0) + weight;
      }
      
      if (product.brand) {
        profile.brandPreferences[product.brand] = 
          (profile.brandPreferences[product.brand] || 0) + weight;
      }
      
      profile.recentInteractions.push({
        productId: product.id,
        action: 'favorite',
        timestamp: new Date(fav.created_at)
      });
    });
  }
  
  // スコアを正規化
  normalizeScores(profile.stylePreferences);
  normalizeScores(profile.categoryPreferences);
  normalizeScores(profile.brandPreferences);
  normalizeScores(profile.colorPreferences);
  
  return profile;
}

/**
 * スコアを0-1の範囲に正規化
 */
function normalizeScores(scores: Record<string, number>) {
  const values = Object.values(scores);
  if (values.length === 0) return;
  
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min;
  
  if (range === 0) return;
  
  Object.keys(scores).forEach(key => {
    scores[key] = (scores[key] - min) / range;
  });
}

/**
 * 商品をパーソナライズスコアでソート
 */
export function sortProductsByPreference(
  products: Product[],
  profile: UserPreferenceProfile
): Product[] {
  const scoredProducts = products.map(product => {
    let score = 0;
    
    // スタイルスコア（最重要: 40%）
    const style = product.style_tags?.[0] || 
                 determineProductStyleAdvanced(product.tags || [], product.category);
    const styleScore = profile.stylePreferences[style] || 0;
    score += styleScore * 40;
    
    // カテゴリスコア（20%）
    if (product.category) {
      const categoryScore = profile.categoryPreferences[product.category] || 0;
      score += categoryScore * 20;
    }
    
    // ブランドスコア（15%）
    if (product.brand) {
      const brandScore = profile.brandPreferences[product.brand] || 0;
      score += brandScore * 15;
    }
    
    // 価格適合度スコア（15%）
    if (product.price) {
      const priceScore = calculatePriceScore(product.price, profile.priceRange);
      score += priceScore * 15;
    }
    
    // 色の好みスコア（10%）
    let colorScore = 0;
    const colorCount = Object.keys(profile.colorPreferences).length;
    if (colorCount > 0) {
      Object.entries(profile.colorPreferences).forEach(([color, preference]) => {
        if (product.tags?.some(tag => tag.includes(color))) {
          colorScore += preference / colorCount;
        }
      });
      score += colorScore * 10;
    }
    
    // 新着商品ボーナス（最近1週間以内）
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    if (product.created_at && new Date(product.created_at) > oneWeekAgo) {
      score += 5;
    }
    
    // ランダム要素を少し加える（多様性のため）
    score += Math.random() * 5;
    
    return {
      ...product,
      personalizedScore: score
    };
  });
  
  // スコアで並び替え
  scoredProducts.sort((a, b) => b.personalizedScore - a.personalizedScore);
  
  // パーソナライズスコアを削除して返す
  return scoredProducts.map(({ personalizedScore, ...product }) => product);
}

/**
 * 価格適合度を計算
 */
function calculatePriceScore(
  price: number,
  priceRange: { min: number; max: number; preferred: number }
): number {
  if (price < priceRange.min || price > priceRange.max) {
    return 0;
  }
  
  // ガウス分布で価格スコアを計算
  const center = priceRange.preferred;
  const sigma = (priceRange.max - priceRange.min) / 4;
  
  return Math.exp(-Math.pow(price - center, 2) / (2 * sigma * sigma));
}

/**
 * パーソナライズされた商品を取得（改善版）
 */
export async function getEnhancedPersonalizedProducts(
  userId: string,
  limit: number = 30,
  excludeIds: string[] = []
): Promise<Product[]> {
  try {
    // ユーザーの好みプロファイルを生成
    const profile = await generateUserPreferenceProfile(userId);
    
    // 候補商品を取得
    let query = supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .not('image_url', 'is', null);
    
    // 除外IDがある場合
    if (excludeIds.length > 0) {
      query = query.not('id', 'in', `(${excludeIds.join(',')})`);
    }
    
    // 価格帯でフィルタリング（少し広めに）
    if (profile.priceRange) {
      // 価格は整数型なので、確実に整数値になるよう計算
      const minPrice = Math.floor(profile.priceRange.min * 0.7);
      const maxPrice = Math.floor(profile.priceRange.max * 1.3);
      
      query = query
        .gte('price', minPrice)
        .lte('price', maxPrice);
    }
    
    // 多めに取得してスコアリング
    const { data: candidates, error } = await query.limit(limit * 5);
    
    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }
    
    if (!candidates || candidates.length === 0) {
      return [];
    }
    
    // パーソナライズスコアでソート
    const sortedProducts = sortProductsByPreference(candidates, profile);
    
    // 多様性を確保しながら選択
    const selectedProducts: Product[] = [];
    const usedCategories = new Set<string>();
    const usedBrands = new Set<string>();
    const usedStyles = new Set<string>();
    
    for (const product of sortedProducts) {
      if (selectedProducts.length >= limit) break;
      
      const category = product.category || 'unknown';
      const brand = product.brand || 'unknown';
      const style = product.style_tags?.[0] || 'unknown';
      
      // 最初の10商品は多様性を重視
      if (selectedProducts.length < 10) {
        // 同じカテゴリ、ブランド、スタイルが2つ以上にならないようにする
        const categoryCount = selectedProducts.filter(p => p.category === category).length;
        const brandCount = selectedProducts.filter(p => p.brand === brand).length;
        const styleCount = selectedProducts.filter(p => p.style_tags?.[0] === style).length;
        
        if (categoryCount < 2 && brandCount < 2 && styleCount < 3) {
          selectedProducts.push(product);
          usedCategories.add(category);
          usedBrands.add(brand);
          usedStyles.add(style);
        }
      } else {
        // 10商品以降はスコア優先
        selectedProducts.push(product);
      }
    }
    
    // 不足分を追加
    if (selectedProducts.length < limit) {
      const remaining = sortedProducts
        .filter(p => !selectedProducts.includes(p))
        .slice(0, limit - selectedProducts.length);
      selectedProducts.push(...remaining);
    }
    
    console.log('[EnhancedPersonalizedProducts] Results:', {
      total: selectedProducts.length,
      profile: {
        topStyles: Object.entries(profile.stylePreferences)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 3)
          .map(([style, score]) => ({ style, score: score.toFixed(2) })),
        priceRange: profile.priceRange
      }
    });
    
    return selectedProducts;
    
  } catch (error) {
    console.error('Error in getEnhancedPersonalizedProducts:', error);
    return [];
  }
}

export default {
  generateUserPreferenceProfile,
  sortProductsByPreference,
  getEnhancedPersonalizedProducts
};
