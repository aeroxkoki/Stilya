import { supabase, handleSupabaseError, handleSupabaseSuccess } from './supabase';
import { Product } from '@/types';
import { fetchRakutenFashionProducts } from './rakutenService';
import { sortProductsByScore, filterOutOfSeasonProducts } from '@/utils/productScoring';
import { getUserPreferences } from './userPreferenceService';
import { optimizeImageUrl, API_OPTIMIZATION } from '@/utils/supabaseOptimization';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@/utils/env';
import { shuffleArray, ensureProductDiversity, getTimeBasedOffset } from '@/utils/randomUtils';

/**
 * DBの商品データをアプリ用の形式に正規化
 */
export const normalizeProduct = (dbProduct: any): Product => {
  // 引数のnullチェック
  if (!dbProduct) {
    throw new Error('[normalizeProduct] Product data is null or undefined');
  }
  
  // imageUrlが未定義またはnullの場合のフォールバック処理
  const originalImageUrl = dbProduct.image_url || dbProduct.imageUrl || '';
  const optimizedUrl = originalImageUrl ? optimizeImageUrl(originalImageUrl) : '';
  
  // デバッグ: 商品データの画像URL情報をログ出力
  // 画像表示問題の調査のため、一時的に常にログを出力
  if (__DEV__) {
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
  }
  
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
  
  // バリューコマース商品の場合、メタデータからadTagを取得
  if (dbProduct.source === 'valuecommerce' && dbProduct.metadata) {
    normalized.adTag = dbProduct.metadata.ad_tag;
    normalized.metadata = dbProduct.metadata;
  }
  
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
      const products = data
        .filter(product => product != null)
        .map(product => {
          try {
            return normalizeProduct(product);
          } catch (err) {
            console.error('[ProductService] Error normalizing product:', err);
            return null;
          }
        })
        .filter((product): product is Product => product !== null);
      
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
        const products = newData
          .filter(product => product != null)
          .map(product => {
            try {
              return normalizeProduct(product);
            } catch (err) {
              console.error('[ProductService] Error normalizing product:', err);
              return null;
            }
          })
          .filter((product): product is Product => product !== null);
        
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
    const rakutenResult = await fetchRakutenFashionProducts(
      undefined, // keyword
      100371,    // genreId
      Math.floor(offset / limit) + 1, // page
      Math.min(limit, 30)
    );
    
    if (rakutenResult.products.length > 0) {
      return { success: true, data: rakutenResult.products };
    }
    
    return { success: false, error: error.message, data: [] };
  }
};

/**
 * 楽天商品をSupabaseに保存
 */
const saveProductsToSupabase = async (products: Product[]) => {
  try {
    // external_productsテーブルに保存する形式に変換
    const externalProducts = products.map(product => ({
      id: product.id,
      title: product.title,
      brand: product.brand,
      price: product.price,
      image_url: product.imageUrl,
      description: product.description,
      tags: product.tags || [],
      category: product.category || 'その他',
      affiliate_url: product.affiliateUrl,
      source: 'rakuten',
      is_active: true,
      created_at: new Date().toISOString(),
      last_synced: new Date().toISOString(),
      priority: 99, // 楽天商品は低優先度
      is_used: false // 楽天APIは新品のみ
    }));
    
    const { error } = await supabase
      .from('external_products')
      .upsert(externalProducts, { onConflict: 'id' });
    
    if (error) {
      console.error('[ProductService] Error saving products to Supabase:', error);
    }
  } catch (error) {
    console.error('[ProductService] Error in saveProductsToSupabase:', error);
  }
};

/**
 * 特定のタグに基づいて商品を取得
 */
export const fetchProductsByTags = async (
  tags: string[], 
  limit: number = 20,
  filters?: FilterOptions
) => {
  try {
    // Supabaseから取得
    let query = supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .not('image_url', 'eq', '');
    
    // タグでフィルタリング（OR条件）
    query = query.or(tags.map(tag => `tags.cs.{${tag}}`).join(','));
    
    // 追加フィルター条件を適用
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
      
      if (filters.includeUsed === false) {
        query = query.eq('is_used', false);
      }
    }
    
    const { data, error } = await query
      .order('priority', { ascending: true })
      .order('last_synced', { ascending: false })
      .limit(limit);
    
    if (error) {
      console.error('[ProductService] Error fetching products by tags:', error);
      return { success: false, error: error.message };
    }
    
    const products = (data || [])
      .filter(product => product != null)
      .map(product => {
        try {
          return normalizeProduct(product);
        } catch (err) {
          console.error('[ProductService] Error normalizing product in fetchProductsByTags:', err);
          return null;
        }
      })
      .filter((product): product is Product => product !== null);
    
    return { success: true, data: products };
  } catch (error: any) {
    console.error('[ProductService] Error in fetchProductsByTags:', error);
    return { success: false, error: error.message };
  }
};

/**
 * スコアリングに基づいて商品を取得（改善版）
 * ユーザーの好みと嗜好を考慮
 */
export const fetchScoredProducts = async (
  userId: string | null,
  limit: number = 20,
  offset: number = 0,
  options?: {
    enablePriceFilter?: boolean;
    enableSeasonalFilter?: boolean;
    priceFlexibility?: number; // 価格の柔軟性（1.0 = ±0%、1.3 = ±30%）
  }
) => {
  try {
    // デフォルトの商品を取得
    const productsResult = await fetchProducts(limit * 2, offset); // 多めに取得してフィルタリング
    
    if (!productsResult.success || !productsResult.data) {
      return productsResult;
    }
    
    let products = productsResult.data;
    
    // ユーザーがいる場合、嗜好に基づいてスコアリング
    if (userId) {
      const preferences = await getUserPreferences(userId);
      
      if (preferences) {
        // 価格フィルタリング
        if (options?.enablePriceFilter && preferences.priceRange) {
          const flexibility = options.priceFlexibility || 1.2;
          const minPrice = preferences.priceRange.min / flexibility;
          const maxPrice = preferences.priceRange.max * flexibility;
          
          products = products.filter(p => p.price >= minPrice && p.price <= maxPrice);
        }
        
        // スコアリング
        products = sortProductsByScore(products, preferences);
      }
    }
    
    // 季節フィルタリング
    if (options?.enableSeasonalFilter) {
      products = filterOutOfSeasonProducts(products);
    }
    
    // 必要な数だけ返す
    return {
      success: true,
      data: products.slice(0, limit)
    };
  } catch (error: any) {
    console.error('[ProductService] Error in fetchScoredProducts:', error);
    return { success: false, error: error.message };
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
    }
  } catch (error) {
    console.error('[ProductService] Error in insertSampleProducts:', error);
  }
};

/**
 * ランダムな商品を取得（単純化版）
 * 特定の条件やフィルターを考慮しつつ、ランダム性を保つ
 */
export const fetchRandomizedProducts = async (
  limit: number = 20,
  offset: number = 0,
  filters?: FilterOptions,
  seed?: string // ランダム性のシード（同じシードなら同じ結果）
) => {
  try {
    // 時刻ベースのoffset調整（より多様な商品を取得するため）
    const timeOffset = getTimeBasedOffset();
    
    console.log('[ProductService] Fetching randomized products with:', {
      limit,
      offset,
      timeOffset,
      filters
    });
    
    // より多くの商品を取得してランダム化の効果を高める
    const poolSize = Math.min(limit * 5, 100); // 最大100件まで
    
    let query = supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .not('image_url', 'eq', '');
    
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
      
      if (filters.includeUsed === false) {
        query = query.eq('is_used', false);
      }
    }
    
    // ランダムな順序を選択（時間ベース）
    const orderOptions = ['created_at', 'last_synced', 'price', 'priority'];
    const randomOrder = orderOptions[Math.abs(timeOffset) % orderOptions.length];
    const randomDirection = timeOffset % 2 === 0;
    
    // 総数を取得してランダムなoffsetを計算
    let countQuery = supabase
      .from('external_products')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .not('image_url', 'eq', '');
    
    // カウントクエリにも同じフィルターを適用
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
    
    // 必要な数だけ取得（normalizeProduct呼び出し前にnullチェック）
    const normalizedProducts = products
      .slice(0, limit)
      .filter(product => product != null) // normalizeProduct呼び出し前にnullチェック
      .map(product => {
        try {
          return normalizeProduct(product);
        } catch (err) {
          console.error('[ProductService] Error normalizing product:', err, 'Product:', product);
          return null;
        }
      })
      .filter((product): product is Product => product !== null); // null除外と型ガード
    
    console.log(`[ProductService] Fetched ${normalizedProducts.length} randomized products`);
    return { success: true, data: normalizedProducts };
    
  } catch (error: any) {
    console.error('[ProductService] Error in fetchRandomizedProducts:', error);
    return { success: false, error: error.message || 'Failed to fetch randomized products' };
  }
};

/**
 * 探索モードと推薦モードをミックスした商品取得（簡潔化版）
 * スワイプ画面用：70% ランダム + 30% 推薦
 * 重複する5-2-3パターンを削除し、RecommendationServiceに委譲
 */
// 商品IDで単一商品を取得
export const fetchProductById = async (productId: string) => {
  try {
    // IDの検証
    if (!productId || productId.trim() === '') {
      console.warn('[ProductService] fetchProductById called with empty ID');
      return { success: false, error: 'Invalid product ID' };
    }

    const { data, error } = await supabase
      .from('external_products')
      .select('*')
      .eq('id', productId)
      .maybeSingle(); // single()の代わりにmaybeSingle()を使用（0件でもエラーにならない）

    if (error) {
      console.error('[ProductService] Error fetching product by ID:', productId, error);
      return handleSupabaseError(error);
    }

    if (!data) {
      // 商品が見つからない場合は、warningレベルのログ（繰り返しエラーを避ける）
      console.warn(`[ProductService] Product not found: ${productId}`);
      return { success: false, error: 'Product not found' };
    }

    const normalizedProduct = normalizeProduct(data);
    return handleSupabaseSuccess(normalizedProduct);
  } catch (error: any) {
    console.error('[ProductService] Error in fetchProductById:', productId, error);
    return { success: false, error: error.message || 'Failed to fetch product' };
  }
};

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
    
    // ユーザーがログインしている場合、integratedRecommendationServiceを使用
    if (userId && !isFirstTime) {
      try {
        const { getEnhancedRecommendations } = await import('./integratedRecommendationService');
        const recommendationResult = await getEnhancedRecommendations(
          userId,
          limit,
          Array.from(excludeIdSet),
          adjustedFilters
        );
        
        // 全ての推薦結果を統合
        const allRecommended = [
          ...recommendationResult.recommended,
          ...recommendationResult.trending,
          ...recommendationResult.forYou
        ];
        
        // 重複を除去しながら必要な数を取得
        const uniqueProducts = allRecommended.filter(
          (product, index, self) => 
            self.findIndex(p => p.id === product.id) === index &&
            !excludeIdSet.has(product.id)
        );
        
        console.log('[fetchMixedProducts] Got integrated recommendations:', uniqueProducts.length);
        
        if (uniqueProducts.length >= limit) {
          return { success: true, data: uniqueProducts.slice(0, limit) };
        }
        
        // 不足分はランダム商品で補完
        if (uniqueProducts.length > 0) {
          const remainingCount = limit - uniqueProducts.length;
          const randomResult = await fetchRandomizedProducts(
            remainingCount,
            offset,
            adjustedFilters,
            `mixed-${userId}-${new Date().getTime()}`
          );
          
          if (randomResult.success && randomResult.data) {
            const additionalProducts = randomResult.data.filter(
              product => !excludeIdSet.has(product.id)
            );
            return { 
              success: true, 
              data: [...uniqueProducts, ...additionalProducts].slice(0, limit) 
            };
          }
        }
      } catch (error) {
        console.error('[fetchMixedProducts] Failed to get integrated recommendations:', error);
      }
    }
    
    // ログインしていない場合、またはエラーの場合はランダム商品を返す
    const randomResult = await fetchRandomizedProducts(
      limit * 2, // 除外を考慮して多めに取得
      offset,
      adjustedFilters,
      `mixed-guest-${new Date().getTime()}`
    );
    
    if (randomResult.success && randomResult.data) {
      const filteredProducts = randomResult.data.filter(
        product => !excludeIdSet.has(product.id)
      );
      
      console.log('[fetchMixedProducts] Returning random products:', filteredProducts.length);
      return { success: true, data: filteredProducts.slice(0, limit) };
    }
    
    // 全てのフォールバックが失敗した場合
    return { success: false, error: 'Failed to fetch mixed products', data: [] };
    
  } catch (error: any) {
    console.error('[ProductService] Error in fetchMixedProducts:', error);
    console.error('[ProductService] Error stack:', error.stack);
    // エラー時は通常の商品取得にフォールバック
    return fetchProducts(limit, offset, filters);
  }
};
