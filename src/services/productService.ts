import { supabase } from './supabase';
import { Product } from '@/types';
import { fetchRakutenFashionProducts } from './rakutenService';
import { sortProductsByScore, filterOutOfSeasonProducts } from '@/utils/productScoring';
import { getUserPreferences } from './userPreferenceService';
import { optimizeImageUrl, API_OPTIMIZATION } from '@/utils/supabaseOptimization';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/utils/env';

/**
 * DBの商品データをアプリ用の形式に正規化
 */
const normalizeProduct = (dbProduct: any): Product => {
  return {
    id: dbProduct.id,
    title: dbProduct.title,
    brand: dbProduct.brand,
    price: dbProduct.price,
    imageUrl: optimizeImageUrl(dbProduct.image_url), // 高画質画像URLに最適化
    description: dbProduct.description,
    tags: dbProduct.tags || [],
    category: dbProduct.category,
    affiliateUrl: dbProduct.affiliate_url,
    source: dbProduct.source,
    createdAt: dbProduct.created_at,
  };
};

/**
 * フィルターオプションの型定義
 */
export interface FilterOptions {
  categories?: string[];
  priceRange?: [number, number];
  selectedTags?: string[];
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
      .eq('is_active', true);
    
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
      limit
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
        limit
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
    const productsToInsert = products.map(product => ({
      id: product.id,
      title: product.title,
      brand: product.brand,
      price: product.price,
      image_url: product.imageUrl,
      description: product.description,
      tags: product.tags,
      category: product.category,
      affiliate_url: product.affiliateUrl,
      source: product.source,
      is_active: true,
      created_at: new Date().toISOString(),
    }));
    
    await supabase
      .from('external_products')
      .upsert(productsToInsert, { onConflict: 'id' });
      
    console.log('[ProductService] Saved products to Supabase');
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
export const fetchProductsByTags = async (tags: string[], limit: number = 20) => {
  try {
    const { data, error } = await supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .contains('tags', tags)
      .limit(limit);
    
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
      .eq('is_active', true);

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
    }

    const { data, error } = await query
      .order('priority', { ascending: true, nullsFirst: false })
      .order('last_synced', { ascending: false })
      .range(offset, offset + limit - 1);

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