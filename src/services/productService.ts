import { supabase } from './supabase';
import { Product } from '@/types';
import { fetchRakutenFashionProducts } from './rakutenService';
import { sortProductsByScore, filterOutOfSeasonProducts } from '@/utils/productScoring';
import { getUserPreferences } from './userPreferenceService';
import { optimizeImageUrl, API_OPTIMIZATION } from '@/utils/supabaseOptimization';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/utils/env';
import { shuffleArray, ensureProductDiversity, getTimeBasedOffset } from '@/utils/randomUtils';
import { RecommendationService } from './recommendationService';

/**
 * DBの商品データをアプリ用の形式に正規化
 */
export const normalizeProduct = (dbProduct: any): Product => {
  // imageUrlが未定義またはnullの場合のフォールバック処理
  const originalImageUrl = dbProduct.image_url || dbProduct.imageUrl || '';
  const optimizedUrl = originalImageUrl ? optimizeImageUrl(originalImageUrl) : '';
  
  // デバッグ: 商品データの画像URL情報をログ出力
  // 画像表示問題の調査のため、一時的に常にログを出力
    console.log('[ProductService] normalizeProduct:', {
      productId: dbProduct.id,
      title: dbProduct.title?.substring(0, 30) + '...',
      originalImageUrl: originalImageUrl,
      optimizedUrl: optimizedUrl,
      hasImageUrl: !!originalImageUrl,
      source: dbProduct.source,
      // データベースから取得した生のフィールドも確認
      dbFields: Object.keys(dbProduct),
      has_ex: originalImageUrl?.includes('_ex=')
    });
  
  const normalized: Product = {
    id: dbProduct.id,
    title: dbProduct.title,
    brand: dbProduct.brand,
    price: dbProduct.price,
    imageUrl: optimizedUrl, // 高画質画像URLに最適化
    description: dbProduct.description,
    tags: dbProduct.tags || [],
    category: dbProduct.category,
    affiliateUrl: dbProduct.affiliate_url,
    source: dbProduct.source,
    createdAt: dbProduct.created_at,
    isUsed: dbProduct.is_used || false, // 中古品フラグ
    commissionRate: dbProduct.commission_rate || 0.05, // アフィリエイト手数料率（デフォルト5%）
  };
  
  // デバッグ: 正規化後のデータも確認
  if (__DEV__) {
    console.log('[ProductService] normalized product:', {
      id: normalized.id,
      imageUrl: normalized.imageUrl,
      hasImageUrl: !!normalized.imageUrl
    });
  }
  
  return normalized;
};

/**
 * フィルターオプションの型定義
 */
export interface FilterOptions {
  categories?: string[];
  priceRange?: [number, number];
  selectedTags?: string[];
  includeUsed?: boolean; // 中古品を含むかどうか（デフォルト: false）
}

/**
 * 商品を取得（Supabase優先、楽天APIフォールバック）
 * MVP戦略に基づいた優先度付き取得
 */
export const fetchProducts = async (limit: number = 20, offset: number = 0, filters?: FilterOptions) => {
  try {
    console.log('[ProductService] Fetching products from Supabase...');
    console.log('[ProductService] Request params:', { limit, offset, filters });
    
    // まずSupabaseから取得を試みる
    // MVP戦略: priority（ブランド優先度）とlast_synced（新しさ）でソート
    let query = supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .not('image_url', 'is', null)  // 画像URLがnullの商品を除外
      .not('image_url', 'eq', '');   // 画像URLが空文字の商品を除外
    
    // フィルター条件を適用
    if (filters) {
      // カテゴリーフィルター
      if (filters.categories && filters.categories.length > 0) {
        query = query.in('category', filters.categories);
      }
      
      // 価格範囲フィルター
      if (filters.priceRange) {
        const [minPrice, maxPrice] = filters.priceRange;
        if (minPrice > 0) {
          query = query.gte('price', minPrice);
        }
        if (maxPrice < Infinity) {
          query = query.lte('price', maxPrice);
        }
      }
      
      // タグフィルター（配列のORマッチ）
      if (filters.selectedTags && filters.selectedTags.length > 0) {
        query = query.or(filters.selectedTags.map(tag => `tags.cs.{${tag}}`).join(','));
      }
      
      // 中古品フィルター（デフォルトは新品・中古品両方を含む）
      if (filters.includeUsed === false) {
        query = query.eq('is_used', false);
      }
      // includeUsed === true または undefined の場合は、フィルターを適用しない（新品・中古品両方を含む）
    }
    
    const { data, error, count } = await query
      .select('*', { count: 'exact' })
      .order('priority', { ascending: true, nullsFirst: false }) // 優先度の高い順（1が最高）
      .order('last_synced', { ascending: false }) // 更新日時の新しい順
      .range(offset, offset + limit - 1);
    
    if (!error && data && data.length > 0) {
      const products = data.map(normalizeProduct);
      console.log(`[ProductService] Fetched ${products.length} products from Supabase`);
      console.log('[ProductService] Product IDs:', products.map(p => p.id).slice(0, 5));
      return { success: true, data: products };
    }
    
    // Supabaseにデータがない場合、サンプルデータを挿入
    if (!error && count === 0) {
      console.log('[ProductService] No products found, inserting sample data...');
      await insertSampleProducts();
      
      // サンプルデータ挿入後、再度取得を試みる
      const { data: newData, error: newError } = await query
        .order('priority', { ascending: true, nullsFirst: false })
        .order('last_synced', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (newError) {
        console.error('[ProductService] Error after inserting sample data:', newError);
      }
      
      if (newData && newData.length > 0) {
        const products = newData.map(normalizeProduct);
        console.log(`[ProductService] Fetched ${products.length} sample products`);
        return { success: true, data: products };
      }
    }
    
    // エラーの場合、詳細をログ出力
    if (error) {
      console.error('[ProductService] Supabase error details:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        supabaseUrl: SUPABASE_URL,
        hasAnonKey: !!SUPABASE_ANON_KEY
      });
    }
    
    // エラーの場合、楽天APIから取得
    console.log('[ProductService] No products in Supabase or error occurred, fetching from Rakuten API...');
    if (error) {
      console.error('[ProductService] Supabase error:', error);
    }
    
    const rakutenResult = await fetchRakutenFashionProducts(
      undefined, // keyword
      100371,    // genreId (レディースファッション)
      Math.floor(offset / limit) + 1, // page
      Math.min(limit, 30) // 楽天APIの最大値は30件
    );
    
    if (rakutenResult.products.length > 0) {
      console.log(`[ProductService] Fetched ${rakutenResult.products.length} products from Rakuten`);
      
      // Supabaseに商品を保存（非同期、エラーを無視）
      saveProductsToSupabase(rakutenResult.products).catch(err => {
        console.error('[ProductService] Failed to save products to Supabase:', err);
      });
      
      return { success: true, data: rakutenResult.products };
    }
    
    // どちらからも商品が取得できない場合
    return { 
      success: false, 
      error: 'No products available',
      data: [] 
    };
    
  } catch (error: any) {
    console.error('[ProductService] Error fetching products:', error);
    
    // エラー時は楽天APIから直接取得を試みる
    try {
      console.log('[ProductService] Attempting to fetch from Rakuten API as fallback...');
      const rakutenResult = await fetchRakutenFashionProducts(
        undefined, 
        100371,
        1,
        Math.min(limit, 30) // 楽天APIの最大値は30件
      );
      
      if (rakutenResult.products.length > 0) {
        return { success: true, data: rakutenResult.products };
      }
    } catch (rakutenError: any) {
      console.error('[ProductService] Rakuten API also failed:', rakutenError);
    }
    
    return { 
      success: false, 
      error: error.message || 'Failed to fetch products',
      data: []
    };
  }
};

/**
 * 商品をSupabaseに保存（バックグラウンド処理）
 */
const saveProductsToSupabase = async (products: Product[]) => {
  try {
    // 有効な画像URLを持つ商品のみフィルタリング
    const validProducts = products.filter(product => {
      const imageUrl = product.imageUrl;
      // 無効なURLをチェック（より厳格な検証）
      if (!imageUrl || imageUrl.trim() === '' || 
          imageUrl.includes('undefined') ||
          imageUrl.includes('placehold.co') ||
          imageUrl.includes('placeholder') ||
          imageUrl.includes('noimage') ||
          imageUrl === 'null' ||
          imageUrl === 'undefined') {
        console.warn(`[ProductService] Skipping product with invalid image URL: ${product.title} - ${imageUrl}`);
        return false;
      }
      return true;
    });
    
    const productsToInsert = validProducts.map(product => {
      // 保存前に画像URLを最適化（重要：これが抜けていた）
      const optimizedImageUrl = optimizeImageUrl(product.imageUrl);
      
      return {
        id: product.id,
        title: product.title,
        brand: product.brand,
        price: product.price,
        image_url: optimizedImageUrl, // 最適化されたURLを保存
        description: product.description,
        tags: product.tags,
        category: product.category,
        affiliate_url: product.affiliateUrl,
        source: product.source,
        is_active: true,
        is_used: product.isUsed || false, // 中古品フラグ
        created_at: new Date().toISOString(),
      };
    });
    
    if (productsToInsert.length === 0) {
      console.log('[ProductService] No valid products to save');
      return;
    }
    
    await supabase
      .from('external_products')
      .upsert(productsToInsert, { onConflict: 'id' });
      
    console.log(`[ProductService] Saved ${productsToInsert.length} valid products to Supabase (filtered ${products.length - validProducts.length} invalid)`);
  } catch (error) {
    console.error('[ProductService] Error saving products to Supabase:', error);
  }
};

/**
 * 商品をIDで取得
 */
export const fetchProductById = async (productId: string) => {
  try {
    const { data, error } = await supabase
      .from('external_products')
      .select('*')
      .eq('id', productId)
      .single();
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    return { success: true, data: normalizeProduct(data) };
  } catch (error: any) {
    return { success: false, error: error.message || 'Unknown error' };
  }
};

/**
 * タグで商品を検索
 */
export const fetchProductsByTags = async (tags: string[], limit: number = 20, filters?: FilterOptions) => {
  try {
    let query = supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .not('image_url', 'is', null)  // 画像URLがnullの商品を除外
      .not('image_url', 'eq', '')   // 画像URLが空文字の商品を除外
      .contains('tags', tags)
      .limit(limit);
    
    // フィルター条件を適用
    if (filters) {
      // 中古品フィルター（デフォルトは新品・中古品両方を含む）
      if (filters.includeUsed === false) {
        query = query.eq('is_used', false);
      }
      // includeUsed === true または undefined の場合は、フィルターを適用しない（新品・中古品両方を含む）
      
      // 価格範囲フィルター
      if (filters.priceRange) {
        const [minPrice, maxPrice] = filters.priceRange;
        if (minPrice > 0) {
          query = query.gte('price', minPrice);
        }
        if (maxPrice < Infinity) {
          query = query.lte('price', maxPrice);
        }
      }
      
      // カテゴリーフィルター
      if (filters.categories && filters.categories.length > 0) {
        query = query.in('category', filters.categories);
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      return { success: false, error: error.message };
    }
    
    const products = data?.map(normalizeProduct) || [];
    return { success: true, data: products };
  } catch (error: any) {
    return { success: false, error: error.message || 'Unknown error' };
  }
};

/**
 * パーソナライズされた商品推薦を取得
 * ユーザーのスワイプ履歴に基づいて商品を取得
 */
export const fetchPersonalizedProducts = async (
  userId: string,
  limit: number = 20,
  offset: number = 0,
  filters?: FilterOptions
) => {
  try {
    // ユーザーのスワイプ履歴から好みのタグを抽出
    const { data: swipeData } = await supabase
      .from('swipes')
      .select('product_id, result')
      .eq('user_id', userId)
      .eq('result', 'yes')
      .limit(100);

    if (!swipeData || swipeData.length === 0) {
      // スワイプ履歴がない場合は通常の商品取得
      return fetchProducts(limit, offset, filters);
    }

    // 「Yes」スワイプした商品のIDを取得
    const likedProductIds = swipeData.map(s => s.product_id);

    // これらの商品情報を取得してタグを集計
    const { data: likedProducts } = await supabase
      .from('external_products')
      .select('tags, brand')
      .in('id', likedProductIds);

    // タグとブランドの頻度を計算
    const tagFrequency: Record<string, number> = {};
    const brandFrequency: Record<string, number> = {};

    likedProducts?.forEach(product => {
      // タグの集計
      product.tags?.forEach((tag: string) => {
        tagFrequency[tag] = (tagFrequency[tag] || 0) + 1;
      });
      // ブランドの集計
      if (product.brand) {
        brandFrequency[product.brand] = (brandFrequency[product.brand] || 0) + 1;
      }
    });

    // 頻度の高いタグを抽出（上位5つ）
    const popularTags = Object.entries(tagFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([tag]) => tag);

    // 頻度の高いブランドを抽出（上位3つ）
    const popularBrands = Object.entries(brandFrequency)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([brand]) => brand);

    console.log('[ProductService] User preferences:', { popularTags, popularBrands });

    // パーソナライズされた商品を取得
    // 1. 好みのタグを含む商品
    // 2. 好みのブランドの商品
    // 3. MVPブランドの優先度
    let query = supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .not('image_url', 'is', null)  // 画像URLがnullの商品を除外
      .not('image_url', 'eq', '');   // 画像URLが空文字の商品を除外

    // タグでフィルタリング（OR条件）
    if (popularTags.length > 0) {
      query = query.or(popularTags.map(tag => `tags.cs.{${tag}}`).join(','));
    }

    // ブランドでフィルタリング（OR条件）
    if (popularBrands.length > 0) {
      query = query.or(popularBrands.map(brand => `brand.eq.${brand}`).join(','));
    }
    
    // フィルター条件を適用
    if (filters) {
      // カテゴリーフィルター
      if (filters.categories && filters.categories.length > 0) {
        query = query.in('category', filters.categories);
      }
      
      // 価格範囲フィルター
      if (filters.priceRange) {
        const [minPrice, maxPrice] = filters.priceRange;
        if (minPrice > 0) {
          query = query.gte('price', minPrice);
        }
        if (maxPrice < Infinity) {
          query = query.lte('price', maxPrice);
        }
      }
      
      // 追加タグフィルター（配列のORマッチ）
      if (filters.selectedTags && filters.selectedTags.length > 0) {
        query = query.or(filters.selectedTags.map(tag => `tags.cs.{${tag}}`).join(','));
      }
      
      // 中古品フィルター（デフォルトは新品・中古品両方を含む）
      if (filters.includeUsed === false) {
        query = query.eq('is_used', false);
      }
      // includeUsed === true または undefined の場合は、フィルターを適用しない（新品・中古品両方を含む）
    }

    // まず、総商品数を取得してoffsetの上限を設定
    const { count: totalCount } = await query
      .select('id', { count: 'exact', head: true });
    
    // offsetが商品数を超えないように調整
    const maxOffset = Math.max(0, (totalCount || 0) - limit);
    const safeOffset = Math.min(offset, maxOffset);

    const { data, error } = await query
      .order('priority', { ascending: true, nullsFirst: false })
      .order('last_synced', { ascending: false })
      .range(safeOffset, safeOffset + limit - 1);

    if (!error && data && data.length > 0) {
      const products = data.map(normalizeProduct);
      console.log(`[ProductService] Fetched ${products.length} personalized products`);
      return { success: true, data: products };
    }

    // パーソナライズ商品が見つからない場合は通常の商品取得
    return fetchProducts(limit, offset, filters);

  } catch (error: any) {
    console.error('[ProductService] Error fetching personalized products:', error);
    // エラー時は通常の商品取得にフォールバック
    return fetchProducts(limit, offset, filters);
  }
};
/**
 * スコアリングシステムを使用した高度な商品推薦
 * Phase 2: 商品スコアリング・季節性・価格帯最適化
 */
export const fetchScoredProducts = async (
  userId: string,
  limit: number = 20,
  offset: number = 0,
  options?: {
    enableSeasonalFilter?: boolean;
    enablePriceFilter?: boolean;
    priceFlexibility?: number;
  }
) => {
  try {
    console.log('[ProductService] Fetching scored products for user:', userId);
    
    // ユーザーの嗜好データを取得
    const userPreferences = await getUserPreferences(userId);
    
    if (!userPreferences) {
      console.log('[ProductService] No user preferences found, using default');
      return fetchProducts(limit, offset);
    }
    
    console.log('[ProductService] User preferences:', {
      tags: userPreferences.preferredTags.length,
      brands: userPreferences.preferredBrands.length,
      priceRange: userPreferences.priceRange
    });
    
    // より多くの商品を取得してスコアリング用のプールを作る
    const poolSize = limit * 3; // 3倍の商品を取得
    const { data, error } = await supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .not('image_url', 'is', null)  // 画像URLがnullの商品を除外
      .not('image_url', 'eq', '')   // 画像URLが空文字の商品を除外
      .order('priority', { ascending: true, nullsFirst: false })
      .order('last_synced', { ascending: false })
      .range(offset * 3, offset * 3 + poolSize - 1);
    
    if (error || !data || data.length === 0) {
      console.log('[ProductService] No products found for scoring');
      return fetchProducts(limit, offset);
    }
    
    let products = data;
    
    // 価格フィルタリング（オプション）
    if (options?.enablePriceFilter) {
      const originalCount = products.length;
      products = products.filter(product => {
        const price = product.price;
        const { min, max } = userPreferences.priceRange;
        const flexibility = options.priceFlexibility || 1.2;
        const adjustedMin = min * (2 - flexibility);
        const adjustedMax = max * flexibility;
        return price >= adjustedMin && price <= adjustedMax;
      });
      console.log(`[ProductService] Price filter: ${originalCount} -> ${products.length}`);
    }
    
    // 季節フィルタリング（オプション）
    if (options?.enableSeasonalFilter) {
      const originalCount = products.length;
      products = filterOutOfSeasonProducts(
        products.map(normalizeProduct),
        50 // 季節性スコア50以上
      ).map(p => products.find(dbP => dbP.id === p.id)!);
      console.log(`[ProductService] Seasonal filter: ${originalCount} -> ${products.length}`);
    }
    
    // スコアリングを実行
    const scoredProducts = sortProductsByScore(products, userPreferences);
    
    // 上位の商品のみを返す
    const topProducts = scoredProducts.slice(0, limit);
    
    // スコア情報をログ出力（デバッグ用）
    console.log('[ProductService] Top 5 products scores:');
    topProducts.slice(0, 5).forEach((p, i) => {
      if (p.score) {
        console.log(`${i + 1}. ${p.title} (${p.brand})`);
        console.log(`   Total: ${p.score.totalScore}, Personal: ${p.score.personalScore}, Price: ${p.score.priceScore}`);
      }
    });
    
    // 正規化して返す
    const normalizedProducts = topProducts.map(p => {
      const product = normalizeProduct(p);
      // スコア情報を含める（デバッグ用）
      return { ...product, _score: p.score };
    });
    
    return { success: true, data: normalizedProducts };
    
  } catch (error: any) {
    console.error('[ProductService] Error fetching scored products:', error);
    // エラー時は通常の商品取得にフォールバック
    return fetchProducts(limit, offset);
  }
};

/**
 * ユーザーの価格帯に合わせた商品を取得
 */
export const fetchProductsInPriceRange = async (
  userId: string,
  limit: number = 20,
  offset: number = 0
) => {
  return fetchScoredProducts(userId, limit, offset, {
    enablePriceFilter: true,
    priceFlexibility: 1.3 // 30%の余裕
  });
};

/**
 * 季節に合った商品を取得
 */
export const fetchSeasonalProducts = async (
  userId: string,
  limit: number = 20,
  offset: number = 0
) => {
  return fetchScoredProducts(userId, limit, offset, {
    enableSeasonalFilter: true
  });
};

/**
 * サンプル商品を挿入（初期データ）
 */
const insertSampleProducts = async () => {
  const sampleProducts = [
    {
      id: `sample_001_${Date.now()}`,
      title: 'オーバーサイズTシャツ',
      brand: 'UNIQLO',
      price: 2990,
      image_url: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      description: 'ゆったりとしたシルエットのTシャツ',
      tags: ['カジュアル', 'ユニセックス', 'コットン', 'トップス'],
      category: 'トップス',
      affiliate_url: 'https://www.uniqlo.com/',
      source: 'manual',
      priority: 1,
      is_active: true,
      last_synced: new Date().toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: `sample_002_${Date.now()}_2`,
      title: 'スキニーデニムパンツ',
      brand: 'ZARA',
      price: 5990,
      image_url: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=400',
      description: 'スリムフィットのデニムパンツ',
      tags: ['カジュアル', 'デニム', 'ストレッチ', 'ボトムス'],
      category: 'ボトムス',
      affiliate_url: 'https://www.zara.com/',
      source: 'manual',
      priority: 2,
      is_active: true,
      last_synced: new Date().toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: `sample_003_${Date.now()}_3`,
      title: 'プリーツスカート',
      brand: 'GU',
      price: 2490,
      image_url: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=400',
      description: 'エレガントなプリーツスカート',
      tags: ['フェミニン', 'オフィス', 'プリーツ', 'スカート'],
      category: 'スカート',
      affiliate_url: 'https://www.gu-global.com/',
      source: 'manual',
      priority: 3,
      is_active: true,
      last_synced: new Date().toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: `sample_004_${Date.now()}_4`,
      title: 'ニットセーター',
      brand: 'H&M',
      price: 3990,
      image_url: 'https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400',
      description: '暖かいウールブレンドのニットセーター',
      tags: ['カジュアル', 'ニット', '秋冬', 'トップス'],
      category: 'トップス',
      affiliate_url: 'https://www2.hm.com/',
      source: 'manual',
      priority: 4,
      is_active: true,
      last_synced: new Date().toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: `sample_005_${Date.now()}_5`,
      title: 'ワイドパンツ',
      brand: 'UNIQLO',
      price: 3990,
      image_url: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400',
      description: 'ゆったりとしたシルエットのワイドパンツ',
      tags: ['カジュアル', 'ワイド', 'コンフォート', 'ボトムス'],
      category: 'ボトムス',
      affiliate_url: 'https://www.uniqlo.com/',
      source: 'manual',
      priority: 5,
      is_active: true,
      last_synced: new Date().toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: `sample_006_${Date.now()}_6`,
      title: 'ストライプシャツ',
      brand: 'GAP',
      price: 4990,
      image_url: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400',
      description: 'クラシックなストライプパターンのシャツ',
      tags: ['ビジネス', 'ストライプ', 'コットン', 'トップス'],
      category: 'トップス',
      affiliate_url: 'https://www.gap.co.jp/',
      source: 'manual',
      priority: 6,
      is_active: true,
      last_synced: new Date().toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: `sample_007_${Date.now()}_7`,
      title: 'フレアスカート',
      brand: 'FOREVER21',
      price: 3490,
      image_url: 'https://images.unsplash.com/photo-1594633312515-7ad9334a2349?w=400',
      description: '動きやすいフレアシルエットのスカート',
      tags: ['フェミニン', 'カジュアル', 'フレア', 'スカート'],
      category: 'スカート',
      affiliate_url: 'https://www.forever21.co.jp/',
      source: 'manual',
      priority: 7,
      is_active: true,
      last_synced: new Date().toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: `sample_008_${Date.now()}_8`,
      title: 'チノパンツ',
      brand: 'MUJI',
      price: 3990,
      image_url: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=400',
      description: 'ベーシックなチノパンツ',
      tags: ['ベーシック', 'チノ', 'オフィス', 'ボトムス'],
      category: 'ボトムス',
      affiliate_url: 'https://www.muji.com/',
      source: 'manual',
      priority: 8,
      is_active: true,
      last_synced: new Date().toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: `sample_009_${Date.now()}_9`,
      title: 'パーカー',
      brand: 'NIKE',
      price: 6990,
      image_url: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?w=400',
      description: 'スポーティーなパーカー',
      tags: ['スポーツ', 'カジュアル', 'パーカー', 'トップス'],
      category: 'トップス',
      affiliate_url: 'https://www.nike.com/jp/',
      source: 'manual',
      priority: 9,
      is_active: true,
      last_synced: new Date().toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: `sample_010_${Date.now()}_10`,
      title: 'ワンピース',
      brand: 'ZARA',
      price: 7990,
      image_url: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400',
      description: 'エレガントなワンピース',
      tags: ['フォーマル', 'エレガント', 'ワンピース'],
      category: 'ワンピース',
      affiliate_url: 'https://www.zara.com/',
      source: 'manual',
      priority: 10,
      is_active: true,
      last_synced: new Date().toISOString(),
      created_at: new Date().toISOString()
    }
  ];
  
  try {
    const { error } = await supabase
      .from('external_products')
      .insert(sampleProducts);
    
    if (error) {
      console.error('[ProductService] Error inserting sample products:', error);
      // 既存のサンプルデータがある場合はエラーを無視
      if (error.message?.includes('duplicate key')) {
        console.log('[ProductService] Sample products already exist');
      }
    } else {
      console.log(`[ProductService] Successfully inserted ${sampleProducts.length} sample products`);
    }
  } catch (error) {
    console.error('[ProductService] Unexpected error inserting sample products:', error);
  }
};

/**
 * ランダム性を持った商品取得（探索用）
 * ユーザー体験を向上させるため、毎回異なる順序で商品を表示
 */
export const fetchRandomizedProducts = async (
  limit: number = 20,
  offset: number = 0,
  filters?: FilterOptions,
  seed?: string
) => {
  try {
    console.log('[ProductService] Fetching randomized products...');
    
    // 時間ベースのオフセットを生成（ページングと組み合わせ）
    const timeOffset = getTimeBasedOffset();
    const adjustedOffset = offset + timeOffset;
    
    // 多めに商品を取得（シャッフルと多様性確保のため）
    const poolSize = limit * 3;
    
    let query = supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .not('image_url', 'is', null)  // 画像URLがnullの商品を除外
      .not('image_url', 'eq', '');   // 画像URLが空文字の商品を除外
    
    // フィルター条件を適用
    if (filters) {
      if (filters.categories && filters.categories.length > 0) {
        query = query.in('category', filters.categories);
      }
      
      if (filters.priceRange) {
        const [minPrice, maxPrice] = filters.priceRange;
        if (minPrice > 0) {
          query = query.gte('price', minPrice);
        }
        if (maxPrice < Infinity) {
          query = query.lte('price', maxPrice);
        }
      }
      
      if (filters.selectedTags && filters.selectedTags.length > 0) {
        query = query.or(filters.selectedTags.map(tag => `tags.cs.{${tag}}`).join(','));
      }
      
      // 中古品フィルター（デフォルトは新品・中古品両方を含む）
      if (filters.includeUsed === false) {
        query = query.eq('is_used', false);
      }
      // includeUsed === true または undefined の場合は、フィルターを適用しない（新品・中古品両方を含む）
    }
    
    // ランダム性を持たせるため、異なる順序で取得
    const randomOrder = Math.random() > 0.5 ? 'created_at' : 'last_synced';
    const randomDirection = Math.random() > 0.5;
    
    // フィルター条件を考慮した総商品数を取得
    // 注意: count取得のために別クエリを作成（クエリチェーンの問題を回避）
    let countQuery = supabase
      .from('external_products')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)
      .not('image_url', 'is', null)  // 画像URLがnullの商品を除外
      .not('image_url', 'eq', '');   // 画像URLが空文字の商品を除外
    
    // カウント用クエリにも同じフィルターを適用
    if (filters) {
      if (filters.categories && filters.categories.length > 0) {
        countQuery = countQuery.in('category', filters.categories);
      }
      
      if (filters.priceRange) {
        const [minPrice, maxPrice] = filters.priceRange;
        if (minPrice > 0) {
          countQuery = countQuery.gte('price', minPrice);
        }
        if (maxPrice < Infinity) {
          countQuery = countQuery.lte('price', maxPrice);
        }
      }
      
      if (filters.selectedTags && filters.selectedTags.length > 0) {
        countQuery = countQuery.or(filters.selectedTags.map(tag => `tags.cs.{${tag}}`).join(','));
      }
      
      if (filters.includeUsed === false) {
        countQuery = countQuery.eq('is_used', false);
      }
    }
    
    const { count: totalCount } = await countQuery;
    
    console.log(`[ProductService] Total products with filters: ${totalCount}`);
    
    // offset計算を簡潔に（総商品数を超えないように）
    let actualOffset = offset + timeOffset;
    
    // 商品数を超えた場合はランダムな位置から開始
    if (totalCount && actualOffset >= totalCount) {
      actualOffset = Math.floor(Math.random() * Math.max(0, totalCount - poolSize));
      console.log(`[ProductService] Offset exceeded total, using random: ${actualOffset}`);
    }
    
    console.log(`[ProductService] Final offset: ${actualOffset}, poolSize: ${poolSize}`);
    
    const { data, error } = await query
      .order(randomOrder, { ascending: randomDirection })
      .range(actualOffset, actualOffset + poolSize - 1);
    
    if (error) {
      console.error('[ProductService] Error fetching randomized products:', error);
      return { success: false, error: error.message };
    }
    
    if (!data || data.length === 0) {
      return { success: true, data: [] };
    }
    
    // null/undefinedの商品をフィルタリング
    const validProducts = data.filter(product => product != null);
    
    if (validProducts.length === 0) {
      console.warn('[ProductService] No valid products after filtering null/undefined');
      return { success: true, data: [] };
    }
    
    // 商品をシャッフル
    let products = shuffleArray(validProducts, seed);
    
    // 商品の多様性を確保
    products = ensureProductDiversity(products, {
      maxSameCategory: 2,
      maxSameBrand: 2,
      windowSize: 5
    });
    
    // 必要な数だけ取得
    const normalizedProducts = products
      .slice(0, limit)
      .map(normalizeProduct);
    
    console.log(`[ProductService] Fetched ${normalizedProducts.length} randomized products`);
    return { success: true, data: normalizedProducts };
    
  } catch (error: any) {
    console.error('[ProductService] Error in fetchRandomizedProducts:', error);
    return { success: false, error: error.message || 'Failed to fetch randomized products' };
  }
};

/**
 * 探索モードと推薦モードをミックスした商品取得（根本的改善版）
 * スワイプ画面用：70% ランダム + 30% 推薦
 * IDベースの重複防止と動的offset調整を実装
 * RecommendationServiceを統合
 */
export const fetchMixedProducts = async (
  userId: string | null,
  limit: number = 20,
  offset: number = 0,
  filters?: FilterOptions,
  excludeProductIds?: string[] // 既に表示された商品IDのリスト
) => {
  try {
    console.log('[fetchMixedProducts] Called with:', { 
      userId, 
      limit, 
      offset, 
      filters,
      excludeProductIdsCount: excludeProductIds?.length || 0 
    });
    
    // 初回ユーザー最適化：最初の20スワイプは特別な選定
    let adjustedFilters = { ...filters };
    const isFirstTime = offset === 0 && (!excludeProductIds || excludeProductIds.length === 0);
    
    if (isFirstTime) {
      console.log('[fetchMixedProducts] Applying first-time user optimization');
      adjustedFilters = {
        ...filters,
        priceRange: filters?.priceRange || [0, 10000], // デフォルトで1万円以下
        includeUsed: false // 初回は新品のみ
      };
    }
    
    // 除外IDのセットを作成（高速化のため）
    const excludeIdSet = new Set<string>(excludeProductIds || []);
    
    // RecommendationServiceを使用して推薦商品を取得（ユーザーがいる場合）
    let recommendedProducts: Product[] = [];
    if (userId && !isFirstTime) {
      try {
        const { RecommendationService } = await import('./recommendationService');
        const recommendationResult = await RecommendationService.getPersonalizedRecommendations(
          userId, 
          Math.ceil(limit * 0.3), // 30%を推薦商品に
          adjustedFilters
        );
        
        if (recommendationResult.success && recommendationResult.data) {
          recommendedProducts = recommendationResult.data.filter(
            product => !excludeIdSet.has(product.id)
          );
          console.log('[fetchMixedProducts] Got recommended products:', recommendedProducts.length);
        }
      } catch (error) {
        console.error('[fetchMixedProducts] Failed to get recommendations:', error);
      }
    }
    
    // 動的offset調整のための変数
    let actualOffset = offset;
    let attempts = 0;
    const maxAttempts = 10;
    let allFetchedProducts: Product[] = [];
    
    // 十分な商品が集まるまでループ
    while (allFetchedProducts.length < limit && attempts < maxAttempts) {
      attempts++;
      
      // 取得する商品数を動的に調整（除外される商品を考慮）
      const fetchSize = Math.min(limit * 3, 100); // 最大100件まで
      
      let query = supabase
        .from('external_products')
        .select('*')
        .eq('is_active', true)
        .not('image_url', 'is', null)  // 画像URLがnullの商品を除外
        .not('image_url', 'eq', '');   // 画像URLが空文字の商品を除外
      
      // フィルター条件を適用（初回最適化済みのフィルターを使用）
      if (adjustedFilters) {
        if (adjustedFilters.categories && adjustedFilters.categories.length > 0) {
          query = query.in('category', adjustedFilters.categories);
        }
        
        if (adjustedFilters.priceRange) {
          const [minPrice, maxPrice] = adjustedFilters.priceRange;
          if (minPrice > 0) {
            query = query.gte('price', minPrice);
          }
          if (maxPrice < Infinity) {
            query = query.lte('price', maxPrice);
          }
        }
        
        if (adjustedFilters.selectedTags && adjustedFilters.selectedTags.length > 0) {
          query = query.or(adjustedFilters.selectedTags.map(tag => `tags.cs.{${tag}}`).join(','));
        }
        
        if (adjustedFilters.includeUsed === false) {
          query = query.eq('is_used', false);
        }
      }
      
      // ランダム性を確保するため、異なる順序で取得
      const sortOptions = ['created_at', 'last_synced', 'priority', 'price'];
      const randomSort = sortOptions[Math.floor(Math.random() * sortOptions.length)];
      const randomDirection = Math.random() > 0.5;
      
      console.log(`[fetchMixedProducts] Attempt ${attempts}: Fetching from offset ${actualOffset}, size ${fetchSize}`);
      
      const { data: products, error } = await query
        .order(randomSort, { ascending: randomDirection })
        .range(actualOffset, actualOffset + fetchSize - 1);
      
      if (error) {
        console.error('[fetchMixedProducts] Error fetching products:', error);
        return { success: false, error: error.message };
      }
      
      if (!products || products.length === 0) {
        console.log('[fetchMixedProducts] No more products available');
        break;
      }
      
      // デバッグ: 生データの確認
      if (__DEV__ && products.length > 0) {
        console.log('[fetchMixedProducts] Raw product data sample:', {
          firstProduct: products[0],
          fields: Object.keys(products[0]),
          imageUrlField: products[0].image_url,
          hasImageUrl: !!products[0].image_url
        });
      }
      
      // 正規化
      const normalizedProducts = products.map(normalizeProduct);
      
      // IDベースでフィルタリング（タイトルベースの重複チェックは削除）
      const newProducts = normalizedProducts.filter(product => !excludeIdSet.has(product.id));
      
      console.log(`[fetchMixedProducts] Fetched ${products.length}, after filtering: ${newProducts.length}`);
      
      // 新しい商品を追加
      allFetchedProducts.push(...newProducts);
      
      // 次のoffsetを計算
      actualOffset += fetchSize;
      
      // 商品が全く取得できなかった場合は終了
      if (products.length < fetchSize) {
        console.log('[fetchMixedProducts] Reached end of products');
        break;
      }
    }
    
    // 推薦商品をミックス（30%推薦、70%ランダム）
    if (recommendedProducts.length > 0) {
      console.log('[fetchMixedProducts] Mixing recommended products with random products');
      
      // 推薦商品の比率を計算
      const recommendedCount = Math.ceil(limit * 0.3);
      const randomCount = limit - recommendedCount;
      
      // 推薦商品とランダム商品を適切な比率で組み合わせる
      const mixedProducts: Product[] = [];
      const recommendedToUse = recommendedProducts.slice(0, recommendedCount);
      const randomToUse = allFetchedProducts.slice(0, randomCount);
      
      // 推薦商品を戦略的に配置（最初の数個と、その後は間隔を開けて配置）
      let recommendedIndex = 0;
      let randomIndex = 0;
      
      for (let i = 0; i < limit; i++) {
        // 最初の3つと、その後3つごとに推薦商品を配置
        if ((i < 3 || i % 3 === 0) && recommendedIndex < recommendedToUse.length) {
          mixedProducts.push(recommendedToUse[recommendedIndex++]);
        } else if (randomIndex < randomToUse.length) {
          mixedProducts.push(randomToUse[randomIndex++]);
        } else if (recommendedIndex < recommendedToUse.length) {
          // ランダム商品が足りない場合は推薦商品で埋める
          mixedProducts.push(recommendedToUse[recommendedIndex++]);
        } else if (randomIndex < allFetchedProducts.length) {
          // それでも足りない場合は残りのランダム商品を使用
          mixedProducts.push(allFetchedProducts[randomIndex++]);
        }
      }
      
      allFetchedProducts = mixedProducts.filter(p => p !== undefined);
      console.log('[fetchMixedProducts] Mixed products:', allFetchedProducts.length);
    } else {
      // 推薦商品がない場合はシャッフル（Fisher-Yatesアルゴリズム）
      for (let i = allFetchedProducts.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [allFetchedProducts[i], allFetchedProducts[j]] = [allFetchedProducts[j], allFetchedProducts[i]];
      }
    }
    
    // ユーザーがログインしている場合は、好みに基づいてスコアリング
    if (userId && allFetchedProducts.length > 0) {
      try {
        // ユーザーの好みタグを取得
        const { data: swipeData } = await supabase
          .from('swipes')
          .select('product_id')
          .eq('user_id', userId)
          .eq('result', 'yes')
          .limit(50);
        
        if (swipeData && swipeData.length > 0) {
          const likedProductIds = swipeData.map(s => s.product_id);
          
          // 好みのタグを取得
          const { data: likedProducts } = await supabase
            .from('external_products')
            .select('tags, brand')
            .in('id', likedProductIds);
          
          // タグとブランドの頻度を計算
          const tagScores: Record<string, number> = {};
          const brandScores: Record<string, number> = {};
          
          likedProducts?.forEach(product => {
            product.tags?.forEach((tag: string) => {
              tagScores[tag] = (tagScores[tag] || 0) + 1;
            });
            if (product.brand) {
              brandScores[product.brand] = (brandScores[product.brand] || 0) + 1;
            }
          });
          
          // 商品にスコアを付与
          allFetchedProducts = allFetchedProducts.map(product => {
            let score = 0;
            product.tags?.forEach(tag => {
              score += tagScores[tag] || 0;
            });
            if (product.brand && brandScores[product.brand]) {
              score += brandScores[product.brand] * 2; // ブランドは重み付け
            }
            
            // 収益最適化: コミッション率によるブースト
            const commissionBoost = (product.commissionRate || 0.05) * 20; // 最大1ポイント追加
            score += commissionBoost;
            
            return { ...product, _score: score };
          });
          
          // 5-2-3パターンの実装
          const applyPattern = (products: any[]) => {
            const patternedProducts: any[] = [];
            const sortedByScore = [...products].sort((a, b) => (b._score || 0) - (a._score || 0));
            
            // スコアによって3つのグループに分ける
            const groupSize = Math.floor(products.length / 3);
            const likedStyleProducts = sortedByScore.slice(0, groupSize); // 高スコア商品
            const slightlyDifferentProducts = sortedByScore.slice(groupSize, groupSize * 2); // 中スコア商品
            const exploreProducts = sortedByScore.slice(groupSize * 2); // 低スコア商品
            
            // 5-2-3パターンで配置
            let likedIndex = 0;
            let differentIndex = 0;
            let exploreIndex = 0;
            
            for (let i = 0; i < products.length; i++) {
              const position = i % 10;
              
              if (position < 5) {
                // 好みに近い商品（5個）
                if (likedIndex < likedStyleProducts.length) {
                  patternedProducts.push(likedStyleProducts[likedIndex++]);
                } else if (differentIndex < slightlyDifferentProducts.length) {
                  patternedProducts.push(slightlyDifferentProducts[differentIndex++]);
                } else if (exploreIndex < exploreProducts.length) {
                  patternedProducts.push(exploreProducts[exploreIndex++]);
                }
              } else if (position < 7) {
                // 少し違う商品（2個）
                if (differentIndex < slightlyDifferentProducts.length) {
                  patternedProducts.push(slightlyDifferentProducts[differentIndex++]);
                } else if (exploreIndex < exploreProducts.length) {
                  patternedProducts.push(exploreProducts[exploreIndex++]);
                } else if (likedIndex < likedStyleProducts.length) {
                  patternedProducts.push(likedStyleProducts[likedIndex++]);
                }
              } else {
                // 新しい発見（3個）
                if (exploreIndex < exploreProducts.length) {
                  patternedProducts.push(exploreProducts[exploreIndex++]);
                } else if (differentIndex < slightlyDifferentProducts.length) {
                  patternedProducts.push(slightlyDifferentProducts[differentIndex++]);
                } else if (likedIndex < likedStyleProducts.length) {
                  patternedProducts.push(likedStyleProducts[likedIndex++]);
                }
              }
            }
            
            return patternedProducts;
          };
          
          // 5-2-3パターンを適用
          allFetchedProducts = applyPattern(allFetchedProducts);
          
          console.log('[fetchMixedProducts] Applied 5-2-3 pattern for better engagement');
        }
      } catch (err) {
        console.error('[fetchMixedProducts] Error applying preferences:', err);
      }
    }
    
    // 必要な数だけ返す
    const finalProducts = allFetchedProducts.slice(0, limit);
    
    console.log(`[fetchMixedProducts] Returning ${finalProducts.length} products (requested: ${limit})`);
    
    // デバッグ：最終的な商品IDリスト
    console.log('[fetchMixedProducts] Final product IDs:', finalProducts.map(p => p.id));
    
    return { success: true, data: finalProducts };
    
  } catch (error: any) {
    console.error('[ProductService] Error in fetchMixedProducts:', error);
    console.error('[ProductService] Error stack:', error.stack);
    // エラー時は通常の商品取得にフォールバック
    return fetchProducts(limit, offset, filters);
  }
};
