import { Product } from '@/types';
import { supabase } from '@/services/supabase';

interface InitialProductConfig {
  gender?: 'male' | 'female' | 'other';
  selectedStyles: string[];
}

export const getInitialProducts = async (
  config: InitialProductConfig,
  limit: number = 30
): Promise<Product[]> => {
  try {
    const products: Product[] = [];
    
    // 1. 人気商品（40%）- popularity_scoreを使用
    const popularCount = Math.floor(limit * 0.4);
    const { data: popularProducts } = await supabase
      .from('external_products')
      .select('*')
      .order('popularity_score', { ascending: false, nullsFirst: false })
      .order('review_count', { ascending: false }) // サブソートとして使用
      .limit(popularCount);
    
    if (popularProducts) products.push(...popularProducts);
    
    // 2. スタイルマッチ商品（30%）
    const styleCount = Math.floor(limit * 0.3);
    if (config.selectedStyles.length > 0) {
      const { data: styleProducts } = await supabase
        .from('external_products')
        .select('*')
        .contains('tags', config.selectedStyles)
        .limit(styleCount);
      
      if (styleProducts) products.push(...styleProducts);
    }
    
    // 3. 価格帯別商品（20%）- external_productsを使用
    const priceCount = Math.floor(limit * 0.2);
    const { data: priceProducts } = await supabase
      .from('external_products')
      .select('*')
      .gte('price', 3000)
      .lte('price', 10000)
      .order('created_at', { ascending: false })
      .limit(priceCount);
    
    if (priceProducts) products.push(...priceProducts);
    
    // 4. ランダム商品（10%）- external_productsを使用
    const randomCount = limit - products.length;
    const { data: randomProducts } = await supabase
      .from('external_products')
      .select('*')
      .limit(randomCount * 2) // ランダム性を高めるため多めに取得
      .then(result => {
        if (!result.data) return result;
        // 手動でシャッフルしてから必要数だけ取得
        const shuffled = shuffleArray(result.data);
        return { ...result, data: shuffled.slice(0, randomCount) };
      });
    
    if (randomProducts && randomProducts.data) {
      products.push(...randomProducts.data);
    }
    
    // 重複を除去してシャッフル
    const uniqueProducts = Array.from(
      new Map(products.map(p => [p.id, p])).values()
    );
    
    return shuffleWithStructure(uniqueProducts, limit);
  } catch (error) {
    console.error('Error fetching initial products:', error);
    return [];
  }
};

// 構造化されたシャッフル（最初の3枚は高人気商品）
function shuffleWithStructure(products: Product[], limit: number): Product[] {
  // 人気度でソート（popularity_score、またはreview_countを使用）
  const sorted = [...products].sort((a, b) => {
    // popularity_scoreがある場合はそれを優先
    if (a.popularity_score !== undefined && b.popularity_score !== undefined) {
      return (b.popularity_score || 0) - (a.popularity_score || 0);
    }
    // なければreview_countで判定
    return (b.review_count || 0) - (a.review_count || 0);
  });
  
  const structured = [
    ...sorted.slice(0, 3), // 最初の3枚は人気商品
    ...shuffleArray(sorted.slice(3))
  ];
  
  return structured.slice(0, limit);
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}
