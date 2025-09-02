/**
 * パーソナライズ商品スコアリングサービス
 * ユーザーの好みに基づいて商品を動的にスコアリング・ソート
 */

import { Product } from '@/types/product';
import { determineProductStyleAdvanced, analyzeUserStylePreference } from './tagMappingService';

/**
 * ユーザープリファレンスの型定義
 */
export interface UserPreferenceProfile {
  stylePreferences: Record<string, number>;
  priceRange: { min: number; max: number; average: number };
  brandPreferences: Record<string, number>;
  categoryPreferences: Record<string, number>;
  recentSwipePattern: {
    consecutiveNos: number;
    lastYesTime?: Date;
    totalYes: number;
    totalNo: number;
    engagementRate: number;
  };
  sessionContext: {
    swipeCount: number;
    sessionDuration: number;
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
    dayOfWeek: 'weekday' | 'weekend';
  };
}

/**
 * スワイプ履歴からユーザープロファイルを生成
 */
export const buildUserPreferenceProfile = (
  swipeHistory: Array<{
    result: 'yes' | 'no';
    product: Product;
    timestamp: Date;
    swipeTimeMs?: number;
  }>,
  sessionStart?: Date
): UserPreferenceProfile => {
  const now = new Date();
  const hour = now.getHours();
  const day = now.getDay();
  
  // スタイル分析
  const swipeData = swipeHistory.map(swipe => ({
    result: swipe.result,
    tags: swipe.product.tags || []
  }));
  const stylePreferences = analyzeUserStylePreference(swipeData);
  
  // 価格帯分析
  const yesProducts = swipeHistory
    .filter(s => s.result === 'yes')
    .map(s => s.product.price || 0);
  
  const priceRange = {
    min: yesProducts.length > 0 ? Math.min(...yesProducts) : 0,
    max: yesProducts.length > 0 ? Math.max(...yesProducts) : 50000,
    average: yesProducts.length > 0 
      ? yesProducts.reduce((a, b) => a + b, 0) / yesProducts.length 
      : 10000,
  };
  
  // ブランド分析
  const brandPreferences: Record<string, number> = {};
  swipeHistory.forEach(swipe => {
    const brand = swipe.product.brand;
    if (brand) {
      if (swipe.result === 'yes') {
        brandPreferences[brand] = (brandPreferences[brand] || 0) + 1;
      } else {
        brandPreferences[brand] = (brandPreferences[brand] || 0) - 0.3;
      }
    }
  });
  
  // カテゴリ分析
  const categoryPreferences: Record<string, number> = {};
  swipeHistory.forEach(swipe => {
    const category = swipe.product.category;
    if (category) {
      if (swipe.result === 'yes') {
        categoryPreferences[category] = (categoryPreferences[category] || 0) + 1;
      } else {
        categoryPreferences[category] = (categoryPreferences[category] || 0) - 0.3;
      }
    }
  });
  
  // 最近のスワイプパターン分析
  let consecutiveNos = 0;
  for (let i = swipeHistory.length - 1; i >= 0; i--) {
    if (swipeHistory[i].result === 'no') {
      consecutiveNos++;
    } else {
      break;
    }
  }
  
  const totalYes = swipeHistory.filter(s => s.result === 'yes').length;
  const totalNo = swipeHistory.filter(s => s.result === 'no').length;
  const engagementRate = swipeHistory.length > 0 ? totalYes / swipeHistory.length : 0;
  
  const lastYes = swipeHistory
    .filter(s => s.result === 'yes')
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())[0];
  
  // セッションコンテキスト
  const sessionDuration = sessionStart 
    ? now.getTime() - sessionStart.getTime() 
    : 0;
  
  let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  if (hour >= 5 && hour < 12) timeOfDay = 'morning';
  else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
  else if (hour >= 17 && hour < 21) timeOfDay = 'evening';
  else timeOfDay = 'night';
  
  const dayOfWeek: 'weekday' | 'weekend' = (day === 0 || day === 6) ? 'weekend' : 'weekday';
  
  return {
    stylePreferences,
    priceRange,
    brandPreferences,
    categoryPreferences,
    recentSwipePattern: {
      consecutiveNos,
      lastYesTime: lastYes?.timestamp,
      totalYes,
      totalNo,
      engagementRate,
    },
    sessionContext: {
      swipeCount: swipeHistory.length,
      sessionDuration,
      timeOfDay,
      dayOfWeek,
    },
  };
};

/**
 * 商品のパーソナライズスコアを計算
 */
export const calculatePersonalizedScore = (
  product: Product,
  userProfile: UserPreferenceProfile
): number => {
  let score = 0;
  const weights = {
    style: 0.35,      // スタイル適合度の重み
    price: 0.20,      // 価格適合度の重み
    brand: 0.15,      // ブランド選好の重み
    category: 0.15,   // カテゴリ選好の重み
    novelty: 0.10,    // 新規性の重み
    context: 0.05,    // コンテキスト適合度の重み
  };
  
  // 1. スタイル適合度スコア
  const productStyle = determineProductStyleAdvanced(product.tags || [], product.category);
  const styleScore = userProfile.stylePreferences[productStyle] || 0.3;
  score += styleScore * weights.style;
  
  // 2. 価格適合度スコア
  const price = product.price || 0;
  const { min, max, average } = userProfile.priceRange;
  let priceScore = 0.5;
  
  if (price >= min && price <= max) {
    // 平均価格に近いほど高スコア
    const deviation = Math.abs(price - average) / (max - min || 1);
    priceScore = 1 - (deviation * 0.5);
  } else if (price < min) {
    // 安すぎる場合
    priceScore = 0.3 + (0.2 * (price / min));
  } else {
    // 高すぎる場合
    priceScore = 0.3 - (0.2 * Math.min((price - max) / max, 1));
  }
  score += Math.max(0, priceScore) * weights.price;
  
  // 3. ブランド選好スコア
  const brandScore = product.brand 
    ? (userProfile.brandPreferences[product.brand] || 0) / 5 // 正規化
    : 0.5;
  score += Math.min(1, Math.max(0, brandScore + 0.5)) * weights.brand;
  
  // 4. カテゴリ選好スコア
  const categoryScore = product.category
    ? (userProfile.categoryPreferences[product.category] || 0) / 5 // 正規化
    : 0.5;
  score += Math.min(1, Math.max(0, categoryScore + 0.5)) * weights.category;
  
  // 5. 新規性スコア（最近Yesしていないスタイルは高スコア）
  let noveltyScore = 0.5;
  if (userProfile.recentSwipePattern.lastYesTime) {
    const timeSinceLastYes = Date.now() - userProfile.recentSwipePattern.lastYesTime.getTime();
    const hoursSinceLastYes = timeSinceLastYes / (1000 * 60 * 60);
    
    // 最近Yesしていないスタイルなら新規性ボーナス
    if (hoursSinceLastYes > 1 && styleScore < 0.7) {
      noveltyScore = 0.7;
    }
  }
  
  // 連続Noが多い場合は、違うスタイルに高いボーナス
  if (userProfile.recentSwipePattern.consecutiveNos >= 3) {
    if (styleScore < 0.5) {
      noveltyScore = 0.9; // 普段と違うスタイルを優先
    }
  }
  score += noveltyScore * weights.novelty;
  
  // 6. コンテキスト適合度スコア
  let contextScore = 0.5;
  
  // 時間帯による調整
  if (userProfile.sessionContext.timeOfDay === 'evening' || 
      userProfile.sessionContext.timeOfDay === 'night') {
    // 夜はカジュアル・リラックス系を優先
    if (productStyle === 'casual' || productStyle === 'natural') {
      contextScore = 0.7;
    }
  } else if (userProfile.sessionContext.timeOfDay === 'morning') {
    // 朝はオフィス・きれいめ系を優先
    if (productStyle === 'classic') {
      contextScore = 0.7;
    }
  }
  
  // 週末はカジュアル系を優先
  if (userProfile.sessionContext.dayOfWeek === 'weekend') {
    if (productStyle === 'casual' || productStyle === 'street') {
      contextScore = Math.max(contextScore, 0.7);
    }
  }
  
  score += contextScore * weights.context;
  
  // エンゲージメント率による全体調整
  if (userProfile.recentSwipePattern.engagementRate < 0.2) {
    // エンゲージメントが低い場合は、スコアを上方修正
    score = score * 1.2;
  }
  
  // 0-1の範囲に正規化
  return Math.min(1, Math.max(0, score));
};

/**
 * 商品リストをパーソナライズスコアでソート
 */
export const sortProductsByPersonalization = (
  products: Product[],
  userProfile: UserPreferenceProfile,
  options?: {
    diversityFactor?: number; // 多様性を重視する度合い (0-1)
    randomSeed?: number;
  }
): Product[] => {
  const { diversityFactor = 0.3, randomSeed = Date.now() } = options || {};
  
  // 各商品にスコアを付与
  const scoredProducts = products.map(product => ({
    product,
    score: calculatePersonalizedScore(product, userProfile),
    style: determineProductStyleAdvanced(product.tags || [], product.category),
  }));
  
  // スコアでソート
  scoredProducts.sort((a, b) => b.score - a.score);
  
  // 多様性を確保するための調整
  if (diversityFactor > 0) {
    const result: typeof scoredProducts = [];
    const styleCount: Record<string, number> = {};
    const maxPerStyle = Math.ceil(products.length / 6); // 6スタイル
    
    // 高スコア商品を優先しつつ、スタイルの偏りを防ぐ
    for (const item of scoredProducts) {
      const count = styleCount[item.style] || 0;
      
      // スタイルの出現回数が上限に達していない、または高スコア商品の場合は追加
      if (count < maxPerStyle || item.score > 0.8) {
        result.push(item);
        styleCount[item.style] = count + 1;
      } else if (Math.random() < diversityFactor) {
        // 多様性のために一定確率で追加
        result.push(item);
        styleCount[item.style] = count + 1;
      }
    }
    
    // 残りの商品を追加
    for (const item of scoredProducts) {
      if (!result.includes(item)) {
        result.push(item);
      }
    }
    
    return result.map(item => item.product);
  }
  
  return scoredProducts.map(item => item.product);
};

/**
 * 連続No対応：探索モードへの切り替え
 */
export const getExplorationProducts = (
  products: Product[],
  userProfile: UserPreferenceProfile,
  excludeStyles?: string[]
): Product[] => {
  // 普段と違うスタイルの商品を優先
  const unusualStyleProducts = products.filter(product => {
    const style = determineProductStyleAdvanced(product.tags || [], product.category);
    const styleScore = userProfile.stylePreferences[style] || 0;
    
    // 低スコアのスタイル、または除外スタイル以外
    return styleScore < 0.4 && (!excludeStyles || !excludeStyles.includes(style));
  });
  
  // ランダムに並び替えて多様性を確保
  return unusualStyleProducts.sort(() => Math.random() - 0.5);
};

export default {
  buildUserPreferenceProfile,
  calculatePersonalizedScore,
  sortProductsByPersonalization,
  getExplorationProducts,
};
