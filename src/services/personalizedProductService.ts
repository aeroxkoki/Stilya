import { Product } from '@/types';
import { supabase } from '@/services/supabase';
import { STYLE_TAG_MAPPING } from '@/constants/constants';

interface PersonalizedProductConfig {
  gender?: 'male' | 'female' | 'unisex' | 'all';
  selectedStyles: string[];
  ageGroup?: string;
}

// 性別に基づくタグマッピング（強化版）
const ENHANCED_GENDER_MAPPING = {
  male: {
    required: ['メンズ', 'mens', 'men', '男性', 'homme'],
    exclude: ['レディース', 'ladies', 'women', '女性', 'スカート', 'ワンピース', 'ブラウス']
  },
  female: {
    required: ['レディース', 'ladies', 'women', '女性', 'femme'],
    exclude: ['メンズ', 'mens', 'men', '男性']
  },
  unisex: {
    required: [],
    exclude: []
  },
  all: {
    required: [],
    exclude: []
  }
};

// スタイル優先度マッピング
const STYLE_PRIORITY_MAPPING: Record<string, string[]> = {
  casual: ['カジュアル', 'デイリー', 'リラックス', 'デニム', 'Tシャツ', 'スニーカー'],
  street: ['ストリート', 'スケーター', 'ヒップホップ', 'オーバーサイズ', 'キャップ', 'バギー'],
  mode: ['モード', 'ミニマル', 'モノトーン', 'デザイナー', 'アバンギャルド', '黒'],
  natural: ['ナチュラル', 'オーガニック', 'リネン', 'コットン', '無印', 'シンプル'],
  feminine: ['フェミニン', 'レース', 'フリル', 'リボン', '花柄', 'パステル', 'ピンク'],
  classic: ['クラシック', 'トラッド', 'ビジネス', 'フォーマル', 'スーツ', 'ジャケット']
};

// 年代に基づく価格帯マッピング（改善版）
const ENHANCED_AGE_PRICE_MAPPING: Record<string, { min: number; max: number; preferred: number }> = {
  teens: { min: 1000, max: 8000, preferred: 3000 },
  twenties: { min: 2000, max: 15000, preferred: 6000 },
  thirties: { min: 3000, max: 25000, preferred: 10000 },
  forties: { min: 5000, max: 35000, preferred: 15000 },
  fifties_plus: { min: 5000, max: 50000, preferred: 20000 }
};

// 商品スコアリング関数
function scoreProduct(product: any, config: PersonalizedProductConfig): number {
  let score = 0;
  const tags = product.tags || [];
  const tagsStr = tags.join(' ').toLowerCase();
  const title = (product.title || '').toLowerCase();
  const productGender = product.gender || 'unisex';
  const price = product.price || 0;

  // 1. 性別マッチング（最重要: 50点）
  if (config.gender && config.gender !== 'all') {
    const genderMapping = ENHANCED_GENDER_MAPPING[config.gender];
    
    // 完全一致
    if (productGender === config.gender) {
      score += 30;
    }
    
    // タグでの性別判定
    const hasRequiredTag = genderMapping.required.some(tag => 
      tagsStr.includes(tag.toLowerCase()) || title.includes(tag.toLowerCase())
    );
    const hasExcludeTag = genderMapping.exclude.some(tag => 
      tagsStr.includes(tag.toLowerCase()) || title.includes(tag.toLowerCase())
    );
    
    if (hasRequiredTag && !hasExcludeTag) {
      score += 20;
    } else if (hasExcludeTag) {
      score -= 50; // 除外タグがある場合は大幅減点
    }
    
    // unisexは中間的な扱い
    if (productGender === 'unisex' && !hasExcludeTag) {
      score += 10;
    }
  }

  // 2. スタイルマッチング（重要: 30点）
  if (config.selectedStyles && config.selectedStyles.length > 0) {
    config.selectedStyles.forEach(style => {
      const styleTags = STYLE_PRIORITY_MAPPING[style.toLowerCase()] || [];
      
      // スタイルタグとの一致度を計算
      let styleMatch = 0;
      styleTags.forEach(styleTag => {
        if (tags.some(tag => tag.includes(styleTag))) {
          styleMatch += 5;
        }
        if (title.includes(styleTag.toLowerCase())) {
          styleMatch += 3;
        }
      });
      
      score += Math.min(styleMatch, 30); // 最大30点
    });
  }

  // 3. 価格帯マッチング（10点）
  if (config.ageGroup && ENHANCED_AGE_PRICE_MAPPING[config.ageGroup]) {
    const priceRange = ENHANCED_AGE_PRICE_MAPPING[config.ageGroup];
    
    if (price >= priceRange.min && price <= priceRange.max) {
      // 推奨価格に近いほど高スコア
      const distance = Math.abs(price - priceRange.preferred);
      const maxDistance = Math.max(priceRange.preferred - priceRange.min, priceRange.max - priceRange.preferred);
      const priceScore = 10 * (1 - distance / maxDistance);
      score += priceScore;
    }
  }

  // 4. 商品品質スコア（10点）
  const reviewCount = product.review_count || 0;
  const popularityScore = product.popularity_score || 0;
  
  if (reviewCount > 10) score += 3;
  if (reviewCount > 50) score += 2;
  if (popularityScore > 0.5) score += 5;

  return score;
}

export const getPersonalizedProducts = async (
  config: PersonalizedProductConfig,
  limit: number = 30
): Promise<Product[]> => {
  try {
    console.log('[PersonalizedProductService] Fetching with enhanced config:', config);
    
    // 1. 候補商品を広めに取得（スコアリングのため多めに取得）
    const candidateLimit = limit * 10; // 2万件のデータベースから適切な商品を選ぶため多めに取得
    let query = supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .not('image_url', 'is', null);

    // 性別フィルタリング（緩めに設定）
    if (config.gender && config.gender !== 'all') {
      // 性別が一致するか、unisexの商品を取得
      query = query.or(`gender.eq.${config.gender},gender.eq.unisex`);
    }

    // 価格帯フィルタリング
    if (config.ageGroup && ENHANCED_AGE_PRICE_MAPPING[config.ageGroup]) {
      const priceRange = ENHANCED_AGE_PRICE_MAPPING[config.ageGroup];
      query = query.gte('price', priceRange.min * 0.8) // 少し広めに取得
                   .lte('price', priceRange.max * 1.2);
    }

    const { data: candidates, error } = await query.limit(candidateLimit);

    if (error) {
      console.error('Error fetching products:', error);
      return [];
    }

    if (!candidates || candidates.length === 0) {
      console.warn('No candidates found, fetching fallback products');
      // フォールバック: 条件を緩めて再取得
      const { data: fallback } = await supabase
        .from('external_products')
        .select('*')
        .eq('is_active', true)
        .not('image_url', 'is', null)
        .limit(limit);
      
      return fallback || [];
    }

    // 2. スコアリングと並び替え
    const scoredProducts = candidates.map(product => ({
      ...product,
      personalizedScore: scoreProduct(product, config)
    }));

    // スコアの高い順に並び替え
    scoredProducts.sort((a, b) => b.personalizedScore - a.personalizedScore);

    // 3. 多様性を確保しながら選択
    const selectedProducts: typeof scoredProducts = [];
    const usedCategories = new Set<string>();
    const usedBrands = new Set<string>();

    // 高スコアの商品から順に選択（多様性を考慮）
    for (const product of scoredProducts) {
      if (selectedProducts.length >= limit) break;

      const category = product.category || 'unknown';
      const brand = product.brand || 'unknown';

      // 最初の10商品は多様性を重視
      if (selectedProducts.length < 10) {
        // カテゴリまたはブランドが新しい場合は優先的に選択
        if (!usedCategories.has(category) || !usedBrands.has(brand)) {
          selectedProducts.push(product);
          usedCategories.add(category);
          usedBrands.add(brand);
        } else if (product.personalizedScore > 50) {
          // スコアが非常に高い場合は重複しても選択
          selectedProducts.push(product);
        }
      } else {
        // 10商品以降はスコア優先
        selectedProducts.push(product);
      }
    }

    // 4. 商品が不足している場合は追加
    if (selectedProducts.length < limit) {
      const remaining = scoredProducts
        .filter(p => !selectedProducts.includes(p))
        .slice(0, limit - selectedProducts.length);
      selectedProducts.push(...remaining);
    }

    console.log('[PersonalizedProductService] Selected products:', {
      total: selectedProducts.length,
      avgScore: selectedProducts.reduce((sum, p) => sum + p.personalizedScore, 0) / selectedProducts.length,
      topScores: selectedProducts.slice(0, 5).map(p => ({
        title: p.title?.substring(0, 30),
        score: p.personalizedScore,
        gender: p.gender,
        tags: p.tags?.slice(0, 3)
      }))
    });

    // personalizedScoreフィールドを除外して返す
    return selectedProducts.map(({ personalizedScore, ...product }) => product);
    
  } catch (error) {
    console.error('Error in getPersonalizedProducts:', error);
    return [];
  }
};

// 初期商品取得の改善版
export const getImprovedInitialProducts = async (
  config: PersonalizedProductConfig,
  limit: number = 30
): Promise<Product[]> => {
  return getPersonalizedProducts(config, limit);
};
