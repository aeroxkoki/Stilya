import { Product } from '@/types';

export interface DiversityOptions {
  maxSameCategory?: number;
  maxSameBrand?: number;
  maxSamePriceRange?: number;
  maxSameStyle?: number;
  windowSize?: number;
}

export const calculateDiversityScore = (
  products: Product[]
): number => {
  if (products.length < 2) return 1;

  const categories = new Set(products.map(p => p.category));
  const brands = new Set(products.map(p => p.brand));
  const styles = new Set(
    products.flatMap(p => 
      (p.tags || []).filter(tag => 
        ['カジュアル', 'フォーマル', 'ストリート'].some(s => tag.includes(s))
      )
    )
  );

  const categoryDiversity = categories.size / products.length;
  const brandDiversity = brands.size / products.length;
  const styleDiversity = styles.size / Math.max(products.length, 1);

  return (categoryDiversity + brandDiversity + styleDiversity) / 3;
};

export const ensureProductDiversity = <T extends Product>(
  products: T[],
  options: DiversityOptions = {}
): T[] => {
  const {
    maxSameCategory = 2,
    maxSameBrand = 2,
    maxSamePriceRange = 3,
    maxSameStyle = 2,
    windowSize = 5
  } = options;
  
  const result: T[] = [];
  const recentCategories: string[] = [];
  const recentBrands: string[] = [];
  const recentPriceRanges: string[] = [];
  const recentStyles: string[] = [];
  
  // スタイルタグの定義
  const stylePatterns = [
    'カジュアル', 'フォーマル', 'ストリート', 'モード', 'ナチュラル',
    'フェミニン', 'クール', 'エレガント', 'スポーティ', 'ガーリー',
    'シンプル', 'ベーシック', 'トレンド', 'レトロ', 'ヴィンテージ'
  ];
  
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
    
    // スタイルタグを抽出
    const productStyles = (product.tags || [])
      .filter(tag => stylePatterns.some(pattern => tag.includes(pattern)))
      .slice(0, 2); // 主要な2つのスタイルのみ
    
    // カテゴリとブランドの出現回数をカウント
    const categoryCount = product.category 
      ? recentCategories.filter(c => c === product.category).length 
      : 0;
    const brandCount = product.brand 
      ? recentBrands.filter(b => b === product.brand).length 
      : 0;
    const priceRangeCount = recentPriceRanges.filter(p => p === priceRange).length;
    
    // スタイルの重複をチェック
    const styleOverlapCount = productStyles.filter(style => 
      recentStyles.filter(s => s === style).length >= maxSameStyle
    ).length;
    
    // 多様性の条件を満たす場合のみ追加
    if (categoryCount < maxSameCategory && 
        brandCount < maxSameBrand && 
        priceRangeCount < maxSamePriceRange &&
        styleOverlapCount === 0) {
      result.push(product);
      
      // 最近の履歴に追加
      if (product.category) recentCategories.push(product.category);
      if (product.brand) recentBrands.push(product.brand);
      recentPriceRanges.push(priceRange);
      productStyles.forEach(style => recentStyles.push(style));
      
      // ウィンドウサイズを超えたら古いものを削除
      if (recentCategories.length > windowSize) recentCategories.shift();
      if (recentBrands.length > windowSize) recentBrands.shift();
      if (recentPriceRanges.length > windowSize) recentPriceRanges.shift();
      while (recentStyles.length > windowSize * 2) recentStyles.shift();
    }
  }
  
  // 不足分は元の順序で補完
  if (result.length < products.length) {
    const remaining = products.filter(p => !result.includes(p));
    result.push(...remaining.slice(0, products.length - result.length));
  }
  
  return result;
};
