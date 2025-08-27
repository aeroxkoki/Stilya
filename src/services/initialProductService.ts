import { Product } from '@/types';
import { supabase } from '@/services/supabase';
import { STYLE_TAG_MAPPING } from '@/constants/constants';

interface InitialProductConfig {
  gender?: 'male' | 'female' | 'unisex' | 'all';
  selectedStyles: string[];
  ageGroup?: string;
}

// 性別に基づくタグマッピング（後方互換性のため残す）
const GENDER_TAG_MAPPING = {
  male: ['メンズ', 'メンズファッション', 'mens', 'men', '男性'],
  female: ['レディース', 'レディースファッション', 'ladies', 'women', '女性'],
  unisex: ['ユニセックス', 'unisex', '男女兼用'],
  all: [] // すべての性別を含む
};

// 年代に基づく価格帯マッピング
const AGE_PRICE_MAPPING: Record<string, { min: number; max: number }> = {
  teens: { min: 1000, max: 5000 },      // 10代：低価格帯
  twenties: { min: 2000, max: 10000 },  // 20代：中価格帯
  thirties: { min: 3000, max: 20000 },  // 30代：中〜高価格帯
  forties: { min: 5000, max: 30000 },   // 40代：高価格帯
  fifties_plus: { min: 5000, max: 50000 } // 50代以上：高価格帯
};

export const getInitialProducts = async (
  config: InitialProductConfig,
  limit: number = 30
): Promise<Product[]> => {
  try {
    console.log('[InitialProductService] Fetching with config:', config);
    const products: Product[] = [];
    
    // 性別に基づくタグを取得
    const genderTags = config.gender ? GENDER_TAG_MAPPING[config.gender] : [];
    
    // 年代に基づく価格帯を取得（防御的にデフォルト値を設定）
    const defaultPriceRange = { min: 0, max: 50000 };
    let priceRange = defaultPriceRange;
    
    if (config.ageGroup && AGE_PRICE_MAPPING[config.ageGroup]) {
      priceRange = AGE_PRICE_MAPPING[config.ageGroup];
    } else if (config.ageGroup) {
      console.warn(`[InitialProductService] Unknown age group: ${config.ageGroup}, using default price range`);
    }
    
    console.log('[InitialProductService] Using price range:', priceRange);
    
    // スタイルに基づくタグを展開
    const styleTags: string[] = [];
    config.selectedStyles.forEach(style => {
      const mappedTags = STYLE_TAG_MAPPING[style.toLowerCase()] || [style];
      styleTags.push(...mappedTags);
    });
    
    // 1. ターゲット商品（50%）- 性別・スタイル・価格帯を考慮
    const targetCount = Math.floor(limit * 0.5);
    let targetQuery = supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .gte('price', priceRange.min)
      .lte('price', priceRange.max);
    
    // 性別タグでフィルタリング（OR条件）
    if (genderTags.length > 0) {
      const genderFilter = genderTags.map(tag => `tags.cs.{${tag}}`).join(',');
      targetQuery = targetQuery.or(genderFilter);
    }
    
    const { data: targetProducts } = await targetQuery
      .order('popularity_score', { ascending: false, nullsFirst: false })
      .limit(targetCount);
    
    if (targetProducts) {
      // スタイルタグとのマッチング度でソート
      const scoredProducts = targetProducts.map(product => {
        let score = 0;
        if (product.tags && Array.isArray(product.tags)) {
          product.tags.forEach(tag => {
            if (styleTags.some(styleTag => 
              tag.toLowerCase().includes(styleTag.toLowerCase()) || 
              styleTag.toLowerCase().includes(tag.toLowerCase())
            )) {
              score += 1;
            }
          });
        }
        return { ...product, styleScore: score };
      });
      
      // スタイルスコアが高い順にソート
      scoredProducts.sort((a, b) => b.styleScore - a.styleScore);
      products.push(...scoredProducts);
    }
    
    // 2. 人気商品（30%）- 幅広く人気のある商品
    const popularCount = Math.floor(limit * 0.3);
    const { data: popularProducts } = await supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .order('popularity_score', { ascending: false, nullsFirst: false })
      .order('review_count', { ascending: false })
      .limit(popularCount);
    
    if (popularProducts) {
      const newProducts = popularProducts.filter(p => 
        !products.some(existing => existing.id === p.id)
      );
      products.push(...newProducts);
    }
    
    // 3. 探索用商品（20%）- ユーザーの好みを広げるため
    const exploreCount = limit - products.length;
    if (exploreCount > 0) {
      const { data: exploreProducts } = await supabase
        .from('external_products')
        .select('*')
        .eq('is_active', true)
        .not('image_url', 'is', null)
        .order('created_at', { ascending: false })
        .limit(exploreCount * 2);
      
      if (exploreProducts) {
        const shuffled = shuffleArray(exploreProducts);
        const newProducts = shuffled
          .filter(p => !products.some(existing => existing.id === p.id))
          .slice(0, exploreCount);
        products.push(...newProducts);
      }
    }
    
    // 重複を除去
    const uniqueProducts = Array.from(
      new Map(products.map(p => [p.id, p])).values()
    );
    
    console.log('[InitialProductService] Fetched products:', {
      total: uniqueProducts.length,
      withGenderTags: uniqueProducts.filter(p => 
        p.tags?.some(tag => genderTags.some(gt => 
          tag.toLowerCase().includes(gt.toLowerCase())
        ))
      ).length,
      inPriceRange: uniqueProducts.filter(p => 
        p.price >= priceRange.min && p.price <= priceRange.max
      ).length
    });
    
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
