import { Product } from '@/types';

/**
 * 商品スコアリングシステム
 * 複数の要素を組み合わせて商品の総合スコアを計算
 */

export interface ProductScore {
  productId: string;
  baseScore: number;      // 基本スコア（0-100）
  brandScore: number;     // ブランドスコア（優先度ベース）
  freshnessScore: number; // 新鮮度スコア（更新日時ベース）
  popularityScore: number;// 人気度スコア（レビュー数・評価）
  seasonalScore: number;  // 季節性スコア
  priceScore: number;     // 価格適正スコア
  personalScore: number;  // パーソナルスコア（ユーザー嗜好）
  totalScore: number;     // 総合スコア
}

export interface UserPreferences {
  userId: string;
  preferredTags: Array<{ tag: string; weight: number }>;
  preferredBrands: Array<{ brand: string; weight: number }>;
  priceRange: {
    min: number;
    max: number;
    average: number;
  };
  seasonalPreferences?: {
    spring: string[];
    summer: string[];
    autumn: string[];
    winter: string[];
  };
}

// 季節タグマッピング
export const SEASONAL_TAGS = {
  spring: ['春', '春夏', 'ライト', '薄手', 'パステル', 'シャツ', 'カーディガン'],
  summer: ['夏', '春夏', 'ノースリーブ', 'サンダル', 'UV', '半袖', 'ショート'],
  autumn: ['秋', '秋冬', 'ニット', 'カーディガン', 'ブーツ', 'ジャケット', 'チェック'],
  winter: ['冬', '秋冬', 'コート', 'ダウン', '厚手', 'ニット', 'マフラー', 'ブーツ']
};

/**
 * 現在の季節を取得（日本の季節）
 */
export function getCurrentSeason(): keyof typeof SEASONAL_TAGS {
  const month = new Date().getMonth() + 1;
  if (month >= 3 && month <= 5) return 'spring';
  if (month >= 6 && month <= 8) return 'summer';
  if (month >= 9 && month <= 11) return 'autumn';
  return 'winter';
}

/**
 * 商品の新鮮度スコアを計算
 */
function calculateFreshnessScore(lastSynced: string | Date): number {
  const now = new Date();
  const syncDate = new Date(lastSynced);
  const daysOld = (now.getTime() - syncDate.getTime()) / (1000 * 60 * 60 * 24);
  
  // 7日以内: 100点、30日で50点、60日で0点
  if (daysOld <= 7) return 100;
  if (daysOld <= 30) return 100 - ((daysOld - 7) / 23) * 50;
  if (daysOld <= 60) return 50 - ((daysOld - 30) / 30) * 50;
  return 0;
}

/**
 * ブランドスコアを計算（priorityベース）
 */
function calculateBrandScore(priority?: number): number {
  if (!priority) return 25; // デフォルト
  
  switch (priority) {
    case 1: return 100;  // 最優先ブランド
    case 2: return 75;   // 優先ブランド
    case 3: return 50;   // 標準優先ブランド
    default: return 25;  // その他
  }
}

/**
 * 季節性スコアを計算
 */
function calculateSeasonalScore(tags: string[]): number {
  const currentSeason = getCurrentSeason();
  const seasonalTags = SEASONAL_TAGS[currentSeason];
  
  // 現在の季節のタグが含まれている数をカウント
  const matchCount = tags.filter(tag => 
    seasonalTags.some(seasonTag => tag.includes(seasonTag))
  ).length;
  
  // マッチ数に応じてスコア計算（0-100）
  if (matchCount === 0) return 50; // 季節に関係ない商品
  if (matchCount === 1) return 75;
  if (matchCount >= 2) return 100;
  
  return 50;
}

/**
 * 価格スコアを計算（ユーザーの価格帯嗜好に基づく）
 */
function calculatePriceScore(price: number, priceRange: UserPreferences['priceRange']): number {
  const { min, max, average } = priceRange;
  
  // 範囲内: 100点
  if (price >= min && price <= max) {
    // 平均値に近いほど高得点
    const deviation = Math.abs(price - average) / average;
    return Math.max(70, 100 - deviation * 50);
  }
  
  // 範囲外でも近い場合は部分点
  if (price < min) {
    const ratio = price / min;
    return Math.max(0, ratio * 50);
  }
  
  if (price > max) {
    const ratio = max / price;
    return Math.max(0, ratio * 50);
  }
  
  return 0;
}

/**
 * パーソナルスコアを計算（タグとブランドの一致度）
 */
function calculatePersonalScore(
  product: Product,
  preferences: UserPreferences
): number {
  let score = 0;
  let totalWeight = 0;
  
  // タグマッチング
  preferences.preferredTags.forEach(({ tag, weight }) => {
    if (product.tags?.some(productTag => productTag.includes(tag))) {
      score += weight * 100;
      totalWeight += weight;
    }
  });
  
  // ブランドマッチング
  preferences.preferredBrands.forEach(({ brand, weight }) => {
    if (product.brand?.toLowerCase() === brand.toLowerCase()) {
      score += weight * 100;
      totalWeight += weight;
    }
  });
  
  // 重み付き平均を返す
  return totalWeight > 0 ? score / totalWeight : 50;
}

/**
 * 商品の総合スコアを計算
 */
export function calculateProductScore(
  product: Product & { priority?: number; last_synced?: string },
  userPreferences: UserPreferences
): ProductScore {
  // 各スコアを計算
  const brandScore = calculateBrandScore(product.priority);
  const freshnessScore = calculateFreshnessScore(product.last_synced || product.createdAt || new Date());
  const seasonalScore = calculateSeasonalScore(product.tags || []);
  const priceScore = calculatePriceScore(product.price, userPreferences.priceRange);
  const personalScore = calculatePersonalScore(product, userPreferences);
  
  // 人気度スコア（今後実装予定：レビュー数・評価が必要）
  const popularityScore = 50; // デフォルト値
  
  // 重み付けして総合スコアを計算
  const weights = {
    brand: 0.15,
    freshness: 0.10,
    seasonal: 0.15,
    price: 0.20,
    personal: 0.35,
    popularity: 0.05
  };
  
  const totalScore = 
    brandScore * weights.brand +
    freshnessScore * weights.freshness +
    seasonalScore * weights.seasonal +
    priceScore * weights.price +
    personalScore * weights.personal +
    popularityScore * weights.popularity;
  
  return {
    productId: product.id,
    baseScore: 50,
    brandScore,
    freshnessScore,
    popularityScore,
    seasonalScore,
    priceScore,
    personalScore,
    totalScore: Math.round(totalScore)
  };
}

/**
 * 商品リストをスコアでソート
 */
export function sortProductsByScore(
  products: Array<Product & { priority?: number; last_synced?: string }>,
  userPreferences: UserPreferences
): Array<Product & { score?: ProductScore }> {
  return products
    .map(product => ({
      ...product,
      score: calculateProductScore(product, userPreferences)
    }))
    .sort((a, b) => (b.score?.totalScore || 0) - (a.score?.totalScore || 0));
}

/**
 * 季節外れ商品をフィルタリング（オプション）
 */
export function filterOutOfSeasonProducts(
  products: Product[],
  threshold: number = 30
): Product[] {
  const currentSeason = getCurrentSeason();
  const seasonalTags = SEASONAL_TAGS[currentSeason];
  
  // 反対の季節のタグ
  const oppositeSeasons = {
    spring: 'autumn',
    summer: 'winter',
    autumn: 'spring',
    winter: 'summer'
  };
  
  const oppositeSeason = oppositeSeasons[currentSeason] as keyof typeof SEASONAL_TAGS;
  const oppositeSeasonTags = SEASONAL_TAGS[oppositeSeason];
  
  return products.filter(product => {
    const score = calculateSeasonalScore(product.tags || []);
    // 季節性スコアが閾値以上、または反対の季節のタグを含まない
    return score >= threshold || !product.tags?.some(tag => 
      oppositeSeasonTags.some(oppositeTag => tag.includes(oppositeTag))
    );
  });
}