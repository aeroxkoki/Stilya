import { supabase } from './supabase';
import { Product, dbProductToProduct, productToDBProduct } from '@/types/product';
import { FilterOptions } from '@/contexts/FilterContext';
import { UserPreference } from '@/services/userPreferenceService';
import { calculateProductScore } from '@/utils/productScoring';
import { STYLE_ID_TO_JP_TAG } from '@/constants/constants';
import axios from 'axios';

// 楽天市場検索API（IchibaItem/Search）を使用
const RAKUTEN_API_BASE_URL = 'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601';
const RAKUTEN_APP_ID = '1082075033088952260';
const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

/**
 * 楽天APIからファッション商品を取得
 * @param keyword 検索キーワード
 * @param limit 取得件数
 * @param offset オフセット
 * @returns 商品リスト
 */
export const fetchRakutenFashionProducts = async (
  keyword?: string, 
  limit: number = 20, 
  offset: number = 0
) => {
  try {
    // 楽天市場検索APIのパラメータ
    const params = {
      applicationId: RAKUTEN_APP_ID,
      keyword: keyword || 'ファッション',
      // ファッションジャンルID（メンズ・レディース・キッズ・バッグ・小物・ブランド雑貨の親カテゴリ）
      genreId: '216131', // レディースファッション
      hits: Math.min(limit, 30), // 楽天APIの制限（最大30件）
      page: Math.floor(offset / 30) + 1,
      sort: '-updateTimestamp', // 更新日時降順
      formatVersion: '2'
    };

    console.log('[ProductService] Calling Rakuten API with params:', params);
    const response = await axios.get(RAKUTEN_API_BASE_URL, { params });
    
    if (!response.data || !response.data.Items) {
      console.error('[ProductService] No items in Rakuten API response');
      return { success: false, data: [] };
    }

    const products = response.data.Items.map((item: any) => {
      const product = item.Item;
      return {
        id: `rakuten_${product.itemCode}`,
        title: product.itemName,
        brand: product.shopName || 'ブランド不明',
        price: product.itemPrice,
        image_url: product.mediumImageUrls?.[0]?.imageUrl || product.smallImageUrls?.[0]?.imageUrl || '',
        description: product.itemCaption || '',
        tags: extractTagsFromProduct(product),
        affiliate_url: product.affiliateUrl || product.itemUrl,
        source: 'rakuten',
        is_active: true,
      };
    });

    console.log(`[ProductService] Fetched ${products.length} products from Rakuten API`);
    return { success: true, data: products };
    
  } catch (error: any) {
    console.error('[ProductService] Error fetching from Rakuten API:', error);
    return { success: false, error: error.message };
  }
};

// タグ抽出ヘルパー関数
const extractTagsFromProduct = (product: any): string[] => {
  const tags: string[] = [];
  
  // カテゴリ情報からタグを抽出
  const name = (product.itemName || product.productName || '').toLowerCase();
  if (name) {
    if (name.includes('カジュアル')) tags.push('カジュアル');
    if (name.includes('きれいめ') || name.includes('キレイめ')) tags.push('きれいめ');
    if (name.includes('ナチュラル')) tags.push('ナチュラル');
    if (name.includes('ワンピース')) tags.push('ワンピース');
    if (name.includes('スカート')) tags.push('スカート');
    if (name.includes('パンツ')) tags.push('パンツ');
    if (name.includes('シャツ')) tags.push('シャツ');
    if (name.includes('ニット')) tags.push('ニット');
    if (name.includes('メンズ')) tags.push('メンズ');
    if (name.includes('レディース')) tags.push('レディース');
  }
  
  return tags;
};

// Product正規化関数（DBのsnake_caseからアプリのcamelCaseへ変換）
const normalizeProduct = (dbProduct: any): Product => {
  return dbProductToProduct(dbProduct);
};

// カテゴリーをタグに変換するヘルパー関数
const convertCategoriesToTags = (categories: string[]): string[] => {
  const categoryToTagMap: Record<string, string[]> = {
    'ec-brand': ['ECブランド', 'オンライン'],
    'office': ['オフィス', 'ビジネス', 'きれいめ'],
    'select': ['セレクトショップ', 'トレンド'],
    'lifestyle': ['ライフスタイル', 'カジュアル'],
    'basic': ['ベーシック', 'シンプル'],
    'trend': ['トレンド', '最新'],
    'high-brand': ['ハイブランド', 'ラグジュアリー'],
    'fast-fashion': ['ファストファッション', 'プチプラ']
  };

  const tags: string[] = [];
  categories.forEach(category => {
    if (categoryToTagMap[category]) {
      tags.push(...categoryToTagMap[category]);
    }
  });
  
  return [...new Set(tags)]; // 重複を除去
};

// 既存のProductFilterOptionsインターフェース
export interface ProductFilterOptions {
  categories?: string[];
  priceRange?: [number, number];
  selectedTags?: string[];
  includeUsed?: boolean;
}

/**
 * FilterOptions を ProductFilterOptions に変換
 * @param filters グローバルフィルターオプション
 * @returns 商品フィルターオプション
 */
export const convertToProductFilters = (filters: FilterOptions): ProductFilterOptions => {
  const productFilters: ProductFilterOptions = {
    priceRange: filters.priceRange,
    selectedTags: [],
    includeUsed: filters.includeUsed ?? true  // デフォルトはtrue
  };
  
  // スタイルをタグに変換（複数選択対応）
  if (filters.styles && filters.styles.length > 0) {
    productFilters.selectedTags = [...filters.styles];
  }
  
  // 気分タグを追加
  if (filters.moods && filters.moods.length > 0) {
    // 新着フィルターは時間ベースなので、ここでは除外
    const nonTemporalMoods = filters.moods.filter(mood => mood !== '新着');
    productFilters.selectedTags = [...(productFilters.selectedTags || []), ...nonTemporalMoods];
  }
  
  return productFilters;
};

/**
 * FilterOptions に基づいてクエリをフィルタリングする
 * Supabaseクエリに直接適用する場合に使用
 * 
 * @param query Supabaseクエリビルダー
 * @param filters フィルターオプション
 * @returns フィルタリングされたクエリ
 */
export const applyFiltersToQuery = (query: any, filters: FilterOptions) => {
  let filteredQuery = query;
  
  // 価格範囲フィルター（防御的チェックを追加）
  if (filters.priceRange && Array.isArray(filters.priceRange) && filters.priceRange.length >= 2) {
    const [minPrice, maxPrice] = filters.priceRange;
    if (typeof minPrice === 'number' && minPrice > 0) {
      filteredQuery = filteredQuery.gte('price', minPrice);
    }
    if (typeof maxPrice === 'number' && maxPrice < 50000) {
      filteredQuery = filteredQuery.lte('price', maxPrice);
    }
  }
  
  // 性別フィルター（gender列を直接使用）
  if (filters.gender && filters.gender !== 'all') {
    if (filters.gender === 'unisex') {
      // ユニセックスの場合
      filteredQuery = filteredQuery.eq('gender', 'unisex');
    } else {
      // male/femaleの場合は、該当する性別とunisexも含む
      filteredQuery = filteredQuery.in('gender', [filters.gender, 'unisex']);
    }
  }
  
  // スタイルフィルター（タグベース）- 複数選択対応
  if (filters.styles && filters.styles.length > 0) {
    // 複数スタイルのいずれかを含む商品を取得
    const styleConditions = filters.styles.map(style => `style_tags.cs.{${style}}`).join(',');
    filteredQuery = filteredQuery.or(styleConditions);
  }
  
  // 気分フィルター
  if (filters.moods && filters.moods.length > 0) {
    // 新着フィルター
    if (filters.moods.includes('新着')) {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      filteredQuery = filteredQuery.gte('created_at', sevenDaysAgo);
    }
    
    // セールフィルター
    if (filters.moods.includes('セール')) {
      // is_saleフィールドがある場合は使用、なければタグで判定
      filteredQuery = filteredQuery.or('is_sale.eq.true,tags.cs.{セール}');
    }
    
    // 人気フィルター
    if (filters.moods.includes('人気')) {
      // 現時点では「人気」タグで判定
      // TODO: 将来的にはスワイプ数を集計する別テーブルまたはビューを作成して対応
      filteredQuery = filteredQuery.contains('tags', ['人気', 'トレンド', 'ベストセラー']);
    }
  }
  
  // 中古品フィルター
  if (filters.includeUsed === false) {
    filteredQuery = filteredQuery.eq('is_used', false);
  }
  // includeUsed === true または undefined の場合は、フィルターを適用しない（新品・中古品両方を含む）
  
  return filteredQuery;
};

/**
 * フィルターオプションに基づいて商品を取得する新しい関数
 * @param filters FilterOptions
 * @param limit 取得件数
 * @param offset オフセット
 * @returns フィルタリングされた商品リスト
 */
export async function getFilteredProducts(
  filters: FilterOptions,
  limit: number = 20,
  offset: number = 0
): Promise<{ success: boolean; data?: Product[]; error?: string; count?: number }> {
  try {
    console.log('[ProductService] Getting filtered products:', { filters, limit, offset });
    
    let query = supabase
      .from('external_products')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .not('image_url', 'eq', '');
    
    // フィルターを適用
    query = applyFiltersToQuery(query, filters);
    
    // ページネーション
    query = query
      .order('priority', { ascending: true, nullsFirst: false })
      .order('last_synced', { ascending: false })
      .range(offset, offset + limit - 1);
    
    const { data, error, count } = await query;
    
    if (error) {
      console.error('[ProductService] Error fetching filtered products:', error);
      return { success: false, error: error.message };
    }
    
    if (!data || data.length === 0) {
      console.log('[ProductService] No products found with filters:', filters);
      return { success: true, data: [], count: 0 };
    }
    
    const products = data
      .filter(product => product != null)
      .map(product => normalizeProduct(product))
      .filter((product): product is Product => product !== null);
    
    console.log(`[ProductService] Found ${products.length} filtered products`);
    
    return { success: true, data: products, count: count || 0 };
  } catch (error: any) {
    console.error('[ProductService] Error in getFilteredProducts:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 商品を取得（Supabase優先、楽天APIフォールバック）
 * MVP戦略に基づいた優先度付き取得
 */
export const fetchProducts = async (limit: number = 20, offset: number = 0, filters?: ProductFilterOptions) => {
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
      // カテゴリーフィルター（英語カテゴリーを日本語タグに変換してフィルタリング）
      if (filters.categories && filters.categories.length > 0) {
        const categoryTags = convertCategoriesToTags(filters.categories);
        if (categoryTags.length > 0) {
          query = query.or(categoryTags.map(tag => `tags.cs.{${tag}}`).join(','));
        }
      }
      
      // 価格範囲フィルター（防御的チェックを追加）
      if (filters.priceRange && Array.isArray(filters.priceRange) && filters.priceRange.length >= 2) {
        const [minPrice, maxPrice] = filters.priceRange;
        if (typeof minPrice === 'number' && minPrice > 0) {
          query = query.gte('price', minPrice);
        }
        if (typeof maxPrice === 'number' && maxPrice < Infinity) {
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
      .select('*')
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
      limit,
      offset
    );
    
    if (rakutenResult.success && rakutenResult.data) {
      // 楽天APIの結果をSupabaseに保存（バックグラウンドで）
      saveProductsToSupabase(rakutenResult.data).catch(err => {
        console.error('[ProductService] Failed to save Rakuten products to Supabase:', err);
      });
      
      return rakutenResult;
    }
    
    return { success: false, error: 'Failed to fetch products from both sources' };
    
  } catch (error: any) {
    console.error('[ProductService] Unexpected error in fetchProducts:', error);
    return { success: false, error: error.message };
  }
};

/**
 * スワイプ履歴に基づいてスコアリングされた商品を取得（推薦用）
 * 
 * @param userId ユーザーID
 * @param limit 取得件数
 * @param offset オフセット（ページネーション用）
 * @param options 推薦オプション
 * @returns スコアリングされた商品リスト
 */
export const fetchScoredProducts = async (
  userId: string,
  limit: number = 20,
  offset: number = 0,
  options?: {
    excludeIds?: string[];
    enablePriceFilter?: boolean;
    priceFlexibility?: number;
    enableSeasonalFilter?: boolean;
  }
) => {
  try {
    console.log('[ProductService] Fetching scored products for user:', userId);
    
    // ユーザー嗜好を取得
    const { getUserPreferences } = await import('./userPreferenceService');
    const userPref = await getUserPreferences(userId);
    
    if (!userPref) {
      console.log('[ProductService] No user preferences found, fetching default products');
      return fetchProducts(limit, offset);
    }
    
    // クエリを構築
    let query = supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .not('image_url', 'eq', '');
    
    // 除外IDがある場合
    if (options?.excludeIds && options.excludeIds.length > 0) {
      query = query.not('id', 'in', `(${options.excludeIds.join(',')})`);
    }
    
    // 価格フィルター（ユーザーの平均価格帯に基づく）
    if (options?.enablePriceFilter && userPref.avgPrice) {
      const flexibility = options.priceFlexibility || 1.5;
      const minPrice = Math.max(0, userPref.avgPrice * (1 - flexibility));
      const maxPrice = userPref.avgPrice * flexibility;
      query = query.gte('price', minPrice).lte('price', maxPrice);
    }
    
    // 季節フィルター（現在の季節に合った商品）
    if (options?.enableSeasonalFilter) {
      const currentMonth = new Date().getMonth() + 1;
      const seasonTags = getSeasonTags(currentMonth);
      if (seasonTags.length > 0) {
        query = query.or(seasonTags.map(tag => `tags.cs.{${tag}}`).join(','));
      }
    }
    
    // より多くの商品を取得してスコアリング
    const { data, error } = await query
      .limit(limit * 3) // スコアリング用に多めに取得
      .order('last_synced', { ascending: false });
    
    if (error) {
      console.error('[ProductService] Error fetching products:', error);
      return { success: false, error: error.message };
    }
    
    if (!data || data.length === 0) {
      console.log('[ProductService] No products found for scoring');
      return { success: true, data: [] };
    }
    
    // 商品をスコアリング
    const scoredProducts = data
      .map(product => {
        const normalizedProduct = normalizeProduct(product);
        const score = calculateProductScore(normalizedProduct, userPref);
        return {
          ...normalizedProduct,
          score
        };
      })
      .sort((a, b) => b.score - a.score); // スコアの高い順にソート
    
    // オフセットを適用して必要な数だけ返す
    const products = scoredProducts
      .slice(offset, offset + limit)
      .map(({ score, ...product }) => product); // スコアを除去
    
    console.log(`[ProductService] Scored and returned ${products.length} products`);
    
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
      affiliate_url: 'https://www.hm.com/',
      source: 'manual',
      priority: 4,
      is_active: true,
      last_synced: new Date().toISOString(),
      created_at: new Date().toISOString()
    },
    {
      id: `sample_005_${Date.now()}_5`,
      title: 'フラワープリントワンピース',
      brand: 'ZARA',
      price: 7990,
      image_url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400',
      description: '華やかなフラワープリントのワンピース',
      tags: ['フェミニン', 'ワンピース', '春夏', 'デート'],
      category: 'ワンピース',
      affiliate_url: 'https://www.zara.com/',
      source: 'manual',
      priority: 5,
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
    } else {
      console.log('[ProductService] Sample products inserted successfully');
    }
  } catch (err) {
    console.error('[ProductService] Unexpected error inserting sample products:', err);
  }
};

/**
 * Product型（camelCase）をDBProduct型（snake_case）に変換
 */
const denormalizeProduct = (product: Product): any => {
  return productToDBProduct(product);
};

/**
 * 楽天APIから取得した商品をSupabaseに保存
 */
const saveProductsToSupabase = async (products: Product[]) => {
  try {
    // Product型をDB形式に変換
    const dbProducts = products.map(product => ({
      ...denormalizeProduct(product),
      last_synced: new Date().toISOString()
    }));
    
    const { error } = await supabase
      .from('external_products')
      .upsert(dbProducts, { onConflict: 'id' });
    
    if (error) {
      console.error('[ProductService] Error saving products to Supabase:', error);
    } else {
      console.log(`[ProductService] Saved ${products.length} products to Supabase`);
    }
  } catch (err) {
    console.error('[ProductService] Unexpected error saving products:', err);
  }
};

/**
 * 商品詳細を取得
 */
export const fetchProductDetail = async (productId: string): Promise<Product | null> => {
  try {
    const { data, error } = await supabase
      .from('external_products')
      .select('*')
      .eq('id', productId)
      .single();
    
    if (error) {
      console.error('[ProductService] Error fetching product detail:', error);
      return null;
    }
    
    return normalizeProduct(data);
  } catch (error) {
    console.error('[ProductService] Unexpected error fetching product detail:', error);
    return null;
  }
};

/**
 * 季節に応じたタグを取得
 */
const getSeasonTags = (month: number): string[] => {
  if (month >= 3 && month <= 5) {
    return ['春', '春夏', 'ライト'];
  } else if (month >= 6 && month <= 8) {
    return ['夏', '春夏', 'クール', '涼しい'];
  } else if (month >= 9 && month <= 11) {
    return ['秋', '秋冬', 'ウォーム'];
  } else {
    return ['冬', '秋冬', '暖かい', 'ニット'];
  }
};

/**
 * 商品検索（キーワード検索）
 */
export const searchProducts = async (
  keyword: string,
  limit: number = 20,
  offset: number = 0
): Promise<{ success: boolean; data?: Product[]; error?: string }> => {
  try {
    const { data, error } = await supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .or(`title.ilike.%${keyword}%,brand.ilike.%${keyword}%,description.ilike.%${keyword}%`)
      .order('priority', { ascending: true })
      .range(offset, offset + limit - 1);
    
    if (error) {
      console.error('[ProductService] Error searching products:', error);
      return { success: false, error: error.message };
    }
    
    const products = data?.map(normalizeProduct) || [];
    return { success: true, data: products };
  } catch (error: any) {
    console.error('[ProductService] Unexpected error searching products:', error);
    return { success: false, error: error.message };
  }
};

/**
 * 商品の総数を取得
 */
export const getProductCount = async (filters?: ProductFilterOptions): Promise<number> => {
  try {
    let query = supabase
      .from('external_products')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);
    
    if (filters) {
      // フィルター条件を適用
      if (filters.categories && filters.categories.length > 0) {
        const categoryTags = convertCategoriesToTags(filters.categories);
        if (categoryTags.length > 0) {
          query = query.or(categoryTags.map(tag => `tags.cs.{${tag}}`).join(','));
        }
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
    
    const { count, error } = await query;
    
    if (error) {
      console.error('[ProductService] Error getting product count:', error);
      return 0;
    }
    
    return count || 0;
  } catch (error) {
    console.error('[ProductService] Unexpected error getting product count:', error);
    return 0;
  }
};

/**
 * ランダムな商品を取得（初回ユーザー向け）
 */
export const fetchRandomProducts = async (limit: number = 20): Promise<Product[]> => {
  try {
    // 総数を取得
    const count = await getProductCount();
    if (count === 0) return [];
    
    // ランダムなオフセットを生成
    const randomOffset = Math.floor(Math.random() * Math.max(0, count - limit));
    
    const { data, error } = await supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .not('image_url', 'eq', '')
      .range(randomOffset, randomOffset + limit - 1);
    
    if (error) {
      console.error('[ProductService] Error fetching random products:', error);
      return [];
    }
    
    return data?.map(normalizeProduct) || [];
  } catch (error) {
    console.error('[ProductService] Unexpected error fetching random products:', error);
    return [];
  }
};

/**
 * タグに基づいて商品を取得
 * @param tags タグリスト
 * @param limit 取得件数
 * @param filters フィルターオプション
 * @returns 商品リスト
 */
export const fetchProductsByTags = async (
  tags: string[],
  limit: number = 20,
  filters?: FilterOptions
): Promise<{ success: boolean; data?: Product[]; error?: string }> => {
  try {
    if (!tags || tags.length === 0) {
      return { success: true, data: [] };
    }

    console.log('[ProductService] Fetching products by tags:', tags);

    let query = supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .not('image_url', 'eq', '');

    // タグによるフィルタリング
    query = query.contains('tags', tags);

    // フィルターを適用
    if (filters) {
      query = applyFiltersToQuery(query, filters);
    }

    // ランダムに並び替え
    query = query
      .order('priority', { ascending: true })
      .order('last_synced', { ascending: false })
      .limit(limit);

    const { data, error } = await query;

    if (error) {
      console.error('[ProductService] Error fetching products by tags:', error);
      return { success: false, error: error.message };
    }

    const products = data?.map(normalizeProduct) || [];
    console.log(`[ProductService] Found ${products.length} products with tags:`, tags);

    return { success: true, data: products };
  } catch (error: any) {
    console.error('[ProductService] Unexpected error fetching products by tags:', error);
    return { success: false, error: error.message };
  }
};

/**
 * ランダム化された商品を取得（シードによる擬似ランダム）
 * @param limit 取得件数
 * @param offset オフセット
 * @param filters フィルターオプション
 * @param seed ランダムシード
 * @returns 商品リスト
 */
export const fetchRandomizedProducts = async (
  limit: number = 20,
  offset: number = 0,
  filters?: FilterOptions,
  seed?: string
): Promise<{ success: boolean; data?: Product[]; error?: string }> => {
  try {
    console.log('[ProductService] Fetching randomized products:', { limit, offset, seed });

    let query = supabase
      .from('external_products')
      .select('*')
      .eq('is_active', true)
      .not('image_url', 'is', null)
      .not('image_url', 'eq', '');

    // フィルターを適用
    if (filters) {
      query = applyFiltersToQuery(query, filters);
    }

    // シード付きランダム化（PostgreSQLのsetseed使用）
    if (seed) {
      // シードから数値を生成（0-1の範囲）
      const seedValue = seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 100 / 100;
      // 注：実際のランダム化はデータベース側で実装する必要があります
      // ここでは優先度とタイムスタンプでの疑似ランダムを使用
      const randomSort = seedValue > 0.5 ? 'priority' : 'last_synced';
      query = query.order(randomSort, { ascending: seedValue > 0.5 });
    } else {
      // デフォルトのソート
      query = query
        .order('priority', { ascending: true })
        .order('last_synced', { ascending: false });
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) {
      console.error('[ProductService] Error fetching randomized products:', error);
      return { success: false, error: error.message };
    }

    const products = data?.map(normalizeProduct) || [];
    console.log(`[ProductService] Found ${products.length} randomized products`);

    return { success: true, data: products };
  } catch (error: any) {
    console.error('[ProductService] Unexpected error fetching randomized products:', error);
    return { success: false, error: error.message };
  }
};

// normalizeProductをエクスポート
export { normalizeProduct };

// FilterOptionsをre-export
export type { FilterOptions } from '@/contexts/FilterContext';

/**
 * 商品IDで単一の商品を取得
 * @param productId 商品ID
 * @returns 商品データ
 */
export const fetchProductById = async (productId: string): Promise<{ success: boolean; data?: Product; error?: string }> => {
  try {
    if (!productId) {
      console.error('[ProductService] No productId provided');
      return { success: false, error: 'Product ID is required' };
    }

    console.log('[ProductService] Fetching product by ID:', productId);

    const { data, error } = await supabase
      .from('external_products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) {
      console.error('[ProductService] Error fetching product by ID:', error);
      return { success: false, error: error.message };
    }

    if (!data) {
      console.log('[ProductService] Product not found for ID:', productId);
      return { success: false, error: 'Product not found' };
    }

    const product = normalizeProduct(data);
    console.log('[ProductService] Successfully fetched product:', product.title);

    return { success: true, data: product };
  } catch (error: any) {
    console.error('[ProductService] Unexpected error fetching product by ID:', error);
    return { success: false, error: error.message };
  }
};

// fetchMixedProducts - ミックスされた商品を取得（男性・女性・ユニセックス）
export const fetchMixedProducts = async (
  limit: number = 20,
  offset: number = 0,
  filters?: FilterOptions
): Promise<{ success: boolean; data?: Product[]; error?: string }> => {
  try {
    let query = supabase
      .from('external_products')
      .select('*')
      .is('is_active', true);

    // フィルター適用
    if (filters) {
      // 価格フィルター（防御的チェックを追加）
      if (filters.priceRange && Array.isArray(filters.priceRange) && filters.priceRange.length >= 2) {
        const [minPrice, maxPrice] = filters.priceRange;
        if (typeof minPrice === 'number') {
          query = query.gte('price', minPrice);
        }
        if (typeof maxPrice === 'number') {
          query = query.lte('price', maxPrice);
        }
      }

      // スタイルフィルター
      if (filters.styles && filters.styles.length > 0) {
        query = query.overlaps('tags', filters.styles);
      }

      // 性別フィルター
      if (filters.gender && filters.gender !== 'all') {
        query = query.eq('gender', filters.gender);
      }
    }

    // ページネーション
    query = query.range(offset, offset + limit - 1)
                 .order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error('[ProductService] Error fetching mixed products:', error);
      return { success: false, error: error.message };
    }

    const products = data?.map(normalizeProduct) || [];
    console.log(`[ProductService] Found ${products.length} mixed products`);

    return { success: true, data: products };
  } catch (error: any) {
    console.error('[ProductService] Unexpected error fetching mixed products:', error);
    return { success: false, error: error.message };
  }
};
