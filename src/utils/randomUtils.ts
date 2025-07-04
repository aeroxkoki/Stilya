/**
 * ランダム化とシャッフルのユーティリティ関数
 * MVPでのユーザー体験向上のため、商品の多様性を確保
 */

/**
 * シード付きランダム関数
 * 同じシードは同じ結果を返すが、日付で変わるため毎日異なる順序になる
 */
export const createSeededRandom = (seed: string) => {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Linear Congruential Generator
  let x = hash;
  return () => {
    x = (x * 1664525 + 1013904223) % 2147483647;
    return x / 2147483647;
  };
};

/**
 * 配列をシャッフル（Fisher-Yates algorithm）
 * @param array シャッフルする配列
 * @param seed シード値（オプション）
 */
export const shuffleArray = <T>(array: T[], seed?: string): T[] => {
  const result = [...array];
  const random = seed ? createSeededRandom(seed) : Math.random;
  
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  
  return result;
};

/**
 * 商品の多様性を確保するためのフィルタリング
 * 同じカテゴリやブランドが連続しないように調整
 */
export const ensureProductDiversity = <T extends { category?: string; brand?: string; price?: number }>(
  products: T[],
  options: {
    maxSameCategory?: number;
    maxSameBrand?: number;
    maxSamePriceRange?: number;
    windowSize?: number;
  } = {}
): T[] => {
  const {
    maxSameCategory = 2,
    maxSameBrand = 2,
    maxSamePriceRange = 3,
    windowSize = 5
  } = options;
  
  const result: T[] = [];
  const recentCategories: string[] = [];
  const recentBrands: string[] = [];
  const recentPriceRanges: string[] = [];
  
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
    
    // カテゴリとブランドの出現回数をカウント
    const categoryCount = product.category 
      ? recentCategories.filter(c => c === product.category).length 
      : 0;
    const brandCount = product.brand 
      ? recentBrands.filter(b => b === product.brand).length 
      : 0;
    const priceRangeCount = recentPriceRanges.filter(p => p === priceRange).length;
    
    // 多様性の条件を満たす場合のみ追加
    if (categoryCount < maxSameCategory && 
        brandCount < maxSameBrand && 
        priceRangeCount < maxSamePriceRange) {
      result.push(product);
      
      // 最近の履歴に追加
      if (product.category) recentCategories.push(product.category);
      if (product.brand) recentBrands.push(product.brand);
      recentPriceRanges.push(priceRange);
      
      // ウィンドウサイズを超えたら古いものを削除
      if (recentCategories.length > windowSize) recentCategories.shift();
      if (recentBrands.length > windowSize) recentBrands.shift();
      if (recentPriceRanges.length > windowSize) recentPriceRanges.shift();
    }
  }
  
  // 不足分は元の順序で補完
  if (result.length < products.length) {
    const remaining = products.filter(p => p != null && !result.includes(p));
    // 追加する前にnullチェック
    const toAdd = remaining.slice(0, products.length - result.length).filter(p => p != null);
    result.push(...toAdd);
  }
  
  return result;
};

/**
 * スコアにランダムノイズを追加
 * @param baseScore 基本スコア
 * @param noiseLevel ノイズレベル（0-1の範囲、デフォルト0.3）
 */
export const addScoreNoise = (baseScore: number, noiseLevel: number = 0.3): number => {
  const minMultiplier = 1 - noiseLevel;
  const maxMultiplier = 1 + noiseLevel;
  const randomMultiplier = minMultiplier + Math.random() * (maxMultiplier - minMultiplier);
  return baseScore * randomMultiplier;
};

/**
 * 時間ベースのオフセット生成
 * 時間帯と曜日によって異なる商品セットを表示
 */
export const getTimeBasedOffset = (): number => {
  const now = new Date();
  const hour = now.getHours();
  const dayOfWeek = now.getDay();
  const dayOfMonth = now.getDate();
  
  // 時間、曜日、日付を組み合わせたオフセット
  return (hour * 7 + dayOfWeek * 24 + dayOfMonth) % 100;
};

/**
 * ユーザーとセッションに基づくシード生成
 */
export const generateUserSessionSeed = (userId: string): string => {
  const today = new Date();
  const dateString = `${today.getFullYear()}-${today.getMonth()}-${today.getDate()}`;
  const sessionId = Math.floor(today.getHours() / 6); // 6時間ごとにセッション更新
  return `${userId}-${dateString}-${sessionId}`;
};
