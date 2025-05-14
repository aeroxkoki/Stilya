import { supabase } from './supabase';
import { Product, Swipe, UserPreference } from '@/types';
import { getSwipeHistory } from './swipeService';
// 直接依存を減らすため、fetchProductsByTags のインポートを削除
// import { fetchProductsByTags } from './productService';
import { mockProducts } from '@/mocks/mockProducts';
import { getProductViewHistory } from './viewHistoryService';

// モック使用フラグ (開発モードでAPI連携ができない場合に使用)
const USE_MOCK = true; // 本番環境では必ず false にすること
/**
 * 特定のタグを持つ商品を取得する（内部実装版）
 * @param tags 検索対象のタグ配列
 * @param limit 取得する商品数
 * @param excludeIds 除外する商品ID配列
 * @returns 商品の配列
 */
const fetchProductsByTags = async (
  tags: string[],
  limit: number = 10, 
  excludeIds: string[] = []
): Promise<Product[]> => {
  try {
    if (!tags || tags.length === 0) {
      return [];
    }

    if (USE_MOCK) {
      // モックデータからタグで絞り込む
      const filteredProducts = mockProducts
        .filter(p => 
          // 除外IDチェック
          !excludeIds.includes(p.id) && 
          // タグの一致チェック（少なくとも1つ一致）
          p.tags && p.tags.some(tag => tags.includes(tag))
        )
        .slice(0, limit);
      
      return filteredProducts;
    }

    let query = supabase
      .from('products')
      .select('*')
      .or(tags.map(tag => `tags.cs.{${tag}}`).join(','))
      .limit(limit);

    // 除外IDがある場合
    if (excludeIds.length > 0) {
      query = query.not('id', 'in', excludeIds);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching products by tags:', error);
      throw new Error(error.message);
    }

    if (!data || data.length === 0) {
      return [];
    }

    // データ変換
    const products = data.map((item: any) => ({
      id: item.id,
      title: item.title,
      brand: item.brand,
      price: item.price,
      imageUrl: item.image_url,
      description: item.description,
      tags: item.tags || [],
      category: item.category,
      affiliateUrl: item.affiliate_url,
      source: item.source,
      createdAt: item.created_at,
    }));

    return products;
  } catch (error) {
    console.error('Unexpected error in fetchProductsByTags:', error);
    return [];
  }
};

// キャッシュ設定
const CACHE_TTL = 5 * 60 * 1000; // 5分（ミリ秒）
const userPreferenceCache = new Map<string, { data: UserPreference, timestamp: number }>();

/**
 * ユーザーの行動履歴から好みを分析する（強化版）
 * 
 * スワイプ履歴、閲覧履歴、クリック履歴を組み合わせて、より精度の高い好み分析を行う
 * @param userId ユーザーID
 * @param skipCache キャッシュをスキップする場合はtrue
 * @returns ユーザーの好みタグとスコア
 */
export const analyzeUserPreferences = async (
  userId: string,
  skipCache: boolean = false
): Promise<UserPreference | null> => {
  // キャッシュチェック
  if (!skipCache) {
    const cachedPreference = userPreferenceCache.get(userId);
    if (cachedPreference && (Date.now() - cachedPreference.timestamp < CACHE_TTL)) {
      console.log('Using cached user preferences for user:', userId);
      return cachedPreference.data;
    }
  }

  try {
    // ユーザーのスワイプ履歴を取得
    const swipeHistory = await getSwipeHistory(userId);
    
    // 閲覧履歴を取得（最大100件）
    const viewHistory = await getProductViewHistory(userId, 100);
    
    // ユーザー行動がない場合はnullを返す
    if (swipeHistory.length === 0 && viewHistory.length === 0) {
      console.log('No user activity found for user:', userId);
      return null;
    }
    
    // スワイプ履歴から商品IDのリストを作成
    const yesProductIds = swipeHistory
      .filter(swipe => swipe.result === 'yes')
      .map(swipe => swipe.productId);
      
    const noProductIds = swipeHistory
      .filter(swipe => swipe.result === 'no')
      .map(swipe => swipe.productId);
    
    // 閲覧履歴からIDを抽出（製品データは既に取得済みなので変換のみ）
    const viewedProductIds = viewHistory.map(product => product.id);
    
    // 過去のクリックログを取得（購入リンククリック履歴）- エラーハンドリング強化
    const { data: clickLogs, error: clickError } = await supabase
      .from('click_logs')
      .select('product_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (clickError) {
      console.error('Error fetching click logs:', clickError);
    }
    
    const clickedProductIds = (clickLogs && clickLogs.length > 0) 
      ? clickLogs.map(log => log.product_id) 
      : [];
    
    // 商品IDから商品データを取得（並列処理で高速化）
    const [yesProducts, noProducts, clickedProducts] = await Promise.all([
      fetchProductsById(yesProductIds),
      fetchProductsById(noProductIds),
      fetchProductsById(clickedProductIds)
    ]);
    
    // タグスコアを計算（拡張版 - 閲覧・クリック履歴も考慮）
    const tagScores = calculateEnhancedTagScores(
      yesProducts, 
      noProducts, 
      viewHistory, 
      clickedProducts
    );
    
    // 結果を生成
    const result: UserPreference = {
      userId,
      tagScores,
      lastUpdated: new Date().toISOString(),
      topTags: getTopTags(tagScores, 10)
    };
    
    // キャッシュに保存
    userPreferenceCache.set(userId, {
      data: result,
      timestamp: Date.now()
    });
    
    return result;
  } catch (error) {
    console.error('Error analyzing user preferences:', error);
    return null;
  }
};

/**
 * 商品IDから商品データを取得する
 * @param productIds 商品IDの配列
 * @returns 商品データの配列
 */
const fetchProductsById = async (productIds: string[]): Promise<Product[]> => {
  if (productIds.length === 0) return [];
  
  try {
    // バッチサイズを制限して大量IDの処理に対応
    const BATCH_SIZE = 100;
    const batches = [];
    
    // IDを適切なサイズのバッチに分割
    for (let i = 0; i < productIds.length; i += BATCH_SIZE) {
      const batchIds = productIds.slice(i, i + BATCH_SIZE);
      batches.push(batchIds);
    }
    
    // 各バッチで並列にデータを取得
    const batchResults = await Promise.all(
      batches.map(async (batchIds) => {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .in('id', batchIds);
          
        if (error) {
          console.error('Error fetching products by IDs:', error);
          return [];
        }
        
        return data || [];
      })
    );
    
    // 結果を結合して一つの配列にする
    const combinedData = batchResults.flat();
    
    // データの形式を変換
    return combinedData.map((item: any) => ({
      id: item.id,
      title: item.title,
      brand: item.brand,
      price: item.price,
      imageUrl: item.image_url,
      description: item.description,
      tags: item.tags || [],
      category: item.category,
      affiliateUrl: item.affiliate_url,
      source: item.source,
      createdAt: item.created_at,
    }));
  } catch (error) {
    console.error('Unexpected error in fetchProductsById:', error);
    return [];
  }
};

/**
 * 閲覧履歴やクリック履歴も考慮してタグスコアを計算する（拡張版）
 * @param yesProducts YESスワイプされた商品
 * @param noProducts NOスワイプされた商品
 * @param viewedProducts 閲覧された商品
 * @param clickedProducts クリック（購入リンク）された商品
 * @returns タグとスコアのマップ
 */
const calculateEnhancedTagScores = (
  yesProducts: Product[],
  noProducts: Product[],
  viewedProducts: Product[],
  clickedProducts: Product[]
): Record<string, number> => {
  const tagScores: Record<string, number> = {};
  
  // YESスワイプの商品からタグスコアを加算
  yesProducts.forEach(product => {
    if (!product.tags || !Array.isArray(product.tags)) return;
    
    product.tags.forEach(tag => {
      if (!tag) return; // 無効なタグをスキップ
      
      tagScores[tag] = (tagScores[tag] || 0) + TAG_SCORE_YES;
    });
  });
  
  // NOスワイプの商品からタグスコアを減算
  noProducts.forEach(product => {
    if (!product.tags || !Array.isArray(product.tags)) return;
    
    product.tags.forEach(tag => {
      if (!tag) return;
      
      tagScores[tag] = (tagScores[tag] || 0) + TAG_SCORE_NO;
    });
  });
  
  // 閲覧履歴からタグスコアを加算（閲覧が複数回あると、より高いスコア）
  // 閲覧履歴はIDベースで重複を除去したカウントマップを作成
  const viewCountMap: Record<string, number> = {};
  viewedProducts.forEach(product => {
    viewCountMap[product.id] = (viewCountMap[product.id] || 0) + 1;
  });
  
  // ユニークな閲覧商品のタグを処理
  const uniqueViewedProducts = viewedProducts.filter(
    (product, index, self) => 
      index === self.findIndex(p => p.id === product.id)
  );
  
  uniqueViewedProducts.forEach(product => {
    if (!product.tags || !Array.isArray(product.tags)) return;
    
    const viewCount = viewCountMap[product.id] || 1;
    const viewWeight = Math.min(viewCount, 3) * 0.1; // 最大3回まで重み付け（0.1, 0.2, 0.3）
    
    product.tags.forEach(tag => {
      if (!tag) return;
      
      tagScores[tag] = (tagScores[tag] || 0) + TAG_SCORE_VIEW + viewWeight;
    });
  });
  
  // クリック（購入リンク）履歴からタグスコアを加算
  clickedProducts.forEach(product => {
    if (!product.tags || !Array.isArray(product.tags)) return;
    
    product.tags.forEach(tag => {
      if (!tag) return;
      
      tagScores[tag] = (tagScores[tag] || 0) + TAG_SCORE_CLICK;
    });
  });
  
  // 最終スコアを計算（スコアが3を超えるタグには追加ボーナス）
  Object.keys(tagScores).forEach(tag => {
    if (tagScores[tag] >= TAG_BONUS_THRESHOLD) {
      tagScores[tag] += 0.5; // 高スコアタグにボーナス
    }
  });
  
  return tagScores;
};

/**
 * 上位のタグを取得する
 * @param tagScores タグスコアのマップ
 * @param limit 取得するタグ数
 * @returns 上位のタグ配列
 */
const getTopTags = (tagScores: Record<string, number>, limit: number): string[] => {
  return Object.entries(tagScores)
    .filter(([_, score]) => score > MIN_CONFIDENCE_SCORE) // スコアが一定以上のものだけ
    .sort((a, b) => b[1] - a[1]) // スコアの高い順にソート
    .slice(0, limit) // 上位N個を取得
    .map(([tag, _]) => tag); // タグのみの配列に変換
};

// 商品レコメンドのキャッシュ
interface RecommendationCacheItem {
  products: Product[];
  timestamp: number;
}
const recommendationCache = new Map<string, RecommendationCacheItem>();

/**
 * ユーザーの好みに基づいて商品を推薦する
 * @param userId ユーザーID
 * @param limit 取得する商品数
 * @param excludeIds 除外する商品ID（すでにスワイプした商品など）
 * @param skipCache キャッシュをスキップする場合はtrue
 * @returns 推薦商品の配列
 */
export const getRecommendedProducts = async (
  userId: string,
  limit = 10,
  excludeIds: string[] = [],
  skipCache: boolean = false
): Promise<Product[]> => {
  try {
    // キャッシュキーを生成
    const cacheKey = `${userId}_${limit}_${excludeIds.join(',')}`; 
    
    // キャッシュチェック
    if (!skipCache) {
      const cached = recommendationCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
        console.log('Using cached recommendations for:', cacheKey);
        return cached.products;
      }
    }
    
    // ユーザーの好みを分析
    const userPreference = await analyzeUserPreferences(userId);
    
    if (!userPreference || !userPreference.topTags || userPreference.topTags.length === 0) {
      console.log('No user preferences found, using popular products instead');
      // 好みが分析できなかった場合は人気商品を返す
      const popularProducts = await getPopularProducts(limit, excludeIds);
      
      // キャッシュに保存
      recommendationCache.set(cacheKey, {
        products: popularProducts,
        timestamp: Date.now()
      });
      
      return popularProducts;
    }
    
    // 上位タグを使用して関連商品を取得
    let recommendedProducts: Product[] = [];
    
    // タグに基づく検索のための準備
    const validTags: string[] = [];
    
    // userPreferenceからタグを抽出（型安全性を確保）
    if (userPreference.topTags && Array.isArray(userPreference.topTags)) {
      // 文字列のタグのみを収集
      const stringTags: string[] = userPreference.topTags.filter((tag): tag is string => typeof tag === 'string');
      validTags.push(...stringTags);
    }
    
    // 有効なタグがある場合は、それを使って商品を検索
    if (validTags.length > 0) {
      console.log(`Searching with ${validTags.length} tags:`, validTags);
      
      // 文字列のみを含む配列を新しく作成（型互換性のため）
      const searchTags: string[] = [...validTags]; 
      
      recommendedProducts = await fetchProductsByTags(
        searchTags,
        limit * 2, // 多めに取得して後でフィルタリング
        excludeIds
      );
    } else {
      console.log('No valid tags found for search, using popular products instead');
      // 有効なタグが見つからない場合は人気商品を返す
      const popularProducts = await getPopularProducts(limit, excludeIds);
      
      // キャッシュに保存
      recommendationCache.set(cacheKey, {
        products: popularProducts,
        timestamp: Date.now()
      });
      
      return popularProducts;
    }
    
    if (recommendedProducts.length === 0) {
      // タグで検索してもヒットしなければ人気商品を返す
      const popularProducts = await getPopularProducts(limit, excludeIds);
      
      // キャッシュに保存
      recommendationCache.set(cacheKey, {
        products: popularProducts,
        timestamp: Date.now()
      });
      
      return popularProducts;
    }
    
    // タグスコアを使用して商品をランク付け
    recommendedProducts = rankProductsByTagScores(
      recommendedProducts,
      userPreference.tagScores
    );
    
    // 上位の商品を取得
    const result = recommendedProducts.slice(0, limit);
    
    // キャッシュに保存
    recommendationCache.set(cacheKey, {
      products: result,
      timestamp: Date.now()
    });
    
    return result;
  } catch (error) {
    console.error('Error getting recommended products:', error);
    // エラー時は空配列を返す（UIがクラッシュしないように）
    return [];
  }
};

/**
 * ユーザーの好みに合わせて商品をランク付けする
 * @param products 商品配列
 * @param tagScores タグスコアのマップ
 * @returns ランク付けされた商品配列
 */
const rankProductsByTagScores = (
  products: Product[],
  tagScores: Record<string, number>
): Product[] => {
  // 各商品にスコアを設定
  const productsWithScore = products.map(product => {
    let score = 0;
    
    // 商品のタグごとにスコアを加算
    if (product.tags && Array.isArray(product.tags)) {
      product.tags.forEach(tag => {
        if (tagScores[tag]) {
          score += tagScores[tag];
        }
      });
    }
    
    return { product, score };
  });
  
  // スコアの高い順にソート
  productsWithScore.sort((a, b) => b.score - a.score);
  
  // 商品のみの配列に変換
  return productsWithScore.map(item => item.product);
};

// 人気商品のキャッシュ
const popularProductsCache = new Map<string, { products: Product[], timestamp: number }>();

/**
 * 人気商品を取得する（好みが分析できない場合のフォールバック）
 * @param limit 取得する商品数
 * @param excludeIds 除外する商品ID
 * @returns 人気商品の配列
 */
const getPopularProducts = async (
  limit: number = 10,
  excludeIds: string[] = []
): Promise<Product[]> => {
  // キャッシュキー
  const cacheKey = `popular_${limit}_${excludeIds.join(',')}`;
  
  // キャッシュチェック
  const cached = popularProductsCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
    return cached.products;
  }
  
  try {
    let query = supabase
      .from('products')
      .select('*')
      .limit(limit);
      
    // 除外IDがある場合（大量の除外IDに対応）
    if (excludeIds.length > 0) {
      // 除外IDの数が多すぎる場合はバッチ処理
      if (excludeIds.length > 100) {
        // IDをフィルタリングする関数
        const filterExcludedProducts = (products: any[]): any[] => {
          const excludeSet = new Set(excludeIds);
          return products.filter(product => !excludeSet.has(product.id));
        };
        
        // 除外IDを使わずに多めに取得してからフィルタリング
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .limit(limit * 3); // 多めに取得
        
        if (error) {
          console.error('Error fetching popular products:', error);
          throw new Error(error.message);
        }
        
        if (!data || data.length === 0) {
          return [];
        }
        
        // 除外IDをフィルタリング
        const filteredData = filterExcludedProducts(data);
        
        // 上位N件を返す
        const result = filteredData.slice(0, limit).map((item: any) => ({
          id: item.id,
          title: item.title,
          brand: item.brand,
          price: item.price,
          imageUrl: item.image_url,
          description: item.description,
          tags: item.tags || [],
          category: item.category,
          affiliateUrl: item.affiliate_url,
          source: item.source,
          createdAt: item.created_at,
        }));
        
        // キャッシュに保存
        popularProductsCache.set(cacheKey, {
          products: result,
          timestamp: Date.now()
        });
        
        return result;
      } else {
        // 除外IDの数が少ない場合は通常のクエリ
        query = query.not('id', 'in', excludeIds);
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching popular products:', error);
      throw new Error(error.message);
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // データの形式を変換
    const result = data.map((item: any) => ({
      id: item.id,
      title: item.title,
      brand: item.brand,
      price: item.price,
      imageUrl: item.image_url,
      description: item.description,
      tags: item.tags || [],
      category: item.category,
      affiliateUrl: item.affiliate_url,
      source: item.source,
      createdAt: item.created_at,
    }));
    
    // キャッシュに保存
    popularProductsCache.set(cacheKey, {
      products: result,
      timestamp: Date.now()
    });
    
    return result;
  } catch (error) {
    console.error('Unexpected error in getPopularProducts:', error);
    return [];
  }
};

// カテゴリ別レコメンドのキャッシュ
const categoryRecommendationCache = new Map<string, { data: Record<string, Product[]>, timestamp: number }>();

/**
 * カテゴリ別におすすめ商品を取得する
 * @param userId ユーザーID
 * @param categories 取得するカテゴリの配列
 * @param limit カテゴリごとの取得数
 * @param skipCache キャッシュをスキップする場合はtrue
 * @returns カテゴリごとの商品リスト
 */
export const getRecommendationsByCategory = async (
  userId: string,
  categories: string[] = ['tops', 'bottoms', 'outerwear', 'accessories'],
  limit: number = 5,
  skipCache: boolean = false
): Promise<Record<string, Product[]>> => {
  try {
    // キャッシュキー
    const cacheKey = `${userId}_${categories.join(',')}_${limit}`;
    
    // キャッシュチェック
    if (!skipCache) {
      const cached = categoryRecommendationCache.get(cacheKey);
      if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
        console.log('Using cached category recommendations for:', cacheKey);
        return cached.data;
      }
    }
    
    const result: Record<string, Product[]> = {};
    
    // ユーザーの好みを分析
    const userPreference = await analyzeUserPreferences(userId);
    
    // スワイプ済みの商品IDを取得
    const swipeHistory = await getSwipeHistory(userId);
    const swipedProductIds = swipeHistory.map(swipe => swipe.productId);
    
    // 各カテゴリごとに並列処理
    const categoryPromises = categories.map(async (category) => {
      try {
        let products: Product[] = [];
        
        if (userPreference && userPreference.topTags && userPreference.topTags.length > 0) {
          // カテゴリと好みのタグで商品を検索
          const validTags: string[] = [];
          
          // userPreferenceからタグを抽出（型安全性を確保）
          if (userPreference.topTags && Array.isArray(userPreference.topTags)) {
            // 文字列のタグのみを収集
            const stringTags: string[] = userPreference.topTags.filter((tag): tag is string => typeof tag === 'string');
            validTags.push(...stringTags);
          }
          
          // 有効なタグがある場合は、それを使って商品を検索
          if (validTags.length > 0) {
            // 文字列のみを含む配列を新しく作成（型互換性のため）
            const searchTags: string[] = [...validTags];
            
            products = await fetchProductsByCategoryAndTags(
              category,
              searchTags,
              limit,
              swipedProductIds
            );
          } else {
            // タグが見つからない場合はカテゴリのみで検索
            products = await fetchProductsByCategory(
              category,
              limit,
              swipedProductIds
            );
          }
          
          if (products.length > 0 && userPreference.tagScores) {
            // タグスコアを使用してランク付け
            products = rankProductsByTagScores(
              products,
              userPreference.tagScores
            );
          }
        }
        
        // 好みのタグで見つからなかった場合はカテゴリのみで検索
        if (products.length === 0) {
          products = await fetchProductsByCategory(
            category,
            limit,
            swipedProductIds
          );
        }
        
        return { category, products };
      } catch (error) {
        console.error(`Error fetching products for category ${category}:`, error);
        return { category, products: [] };
      }
    });
    
    // 全カテゴリの処理を待機
    const categoryResults = await Promise.all(categoryPromises);
    
    // 結果をマージ
    categoryResults.forEach(({ category, products }) => {
      result[category] = products;
    });
    
    // キャッシュに保存
    categoryRecommendationCache.set(cacheKey, {
      data: result,
      timestamp: Date.now()
    });
    
    return result;
  } catch (error) {
    console.error('Error getting recommendations by category:', error);
    return {};
  }
};

/**
 * カテゴリとタグで商品を検索する
 * @param category 商品カテゴリ
 * @param tags 検索タグ配列
 * @param limit 取得数
 * @param excludeIds 除外ID配列
 * @returns 商品配列
 */
const fetchProductsByCategoryAndTags = async (
  category: string,
  tags: string[],
  limit: number,
  excludeIds: string[] = []
): Promise<Product[]> => {
  try {
    if (!tags || tags.length === 0) {
      return fetchProductsByCategory(category, limit, excludeIds);
    }
    
    // タグが多すぎる場合は上位のタグのみを使用
    const usedTags = tags.length > 5 ? tags.slice(0, 5) : tags;
    
    let query = supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .or(usedTags.map(tag => `tags.cs.{${tag}}`).join(','))
      .limit(limit);
      
    // 除外IDがある場合
    if (excludeIds.length > 0) {
      if (excludeIds.length > 100) {
        // 多数の除外IDがある場合は後でフィルタリング
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching products by category and tags:', error);
          throw new Error(error.message);
        }
        
        if (!data || data.length === 0) {
          return [];
        }
        
        // 除外IDをフィルタリング
        const excludeSet = new Set(excludeIds);
        const filteredData = data.filter(item => !excludeSet.has(item.id));
        
        // データの形式を変換
        return filteredData.slice(0, limit).map((item: any) => ({
          id: item.id,
          title: item.title,
          brand: item.brand,
          price: item.price,
          imageUrl: item.image_url,
          description: item.description,
          tags: item.tags || [],
          category: item.category,
          affiliateUrl: item.affiliate_url,
          source: item.source,
          createdAt: item.created_at,
        }));
      } else {
        query = query.not('id', 'in', excludeIds);
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching products by category and tags:', error);
      throw new Error(error.message);
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // データの形式を変換
    return data.map((item: any) => ({
      id: item.id,
      title: item.title,
      brand: item.brand,
      price: item.price,
      imageUrl: item.image_url,
      description: item.description,
      tags: item.tags || [],
      category: item.category,
      affiliateUrl: item.affiliate_url,
      source: item.source,
      createdAt: item.created_at,
    }));
  } catch (error) {
    console.error('Unexpected error in fetchProductsByCategoryAndTags:', error);
    return [];
  }
};

/**
 * カテゴリで商品を検索する
 * @param category 商品カテゴリ
 * @param limit 取得数
 * @param excludeIds 除外ID配列
 * @returns 商品配列
 */
const fetchProductsByCategory = async (
  category: string,
  limit: number,
  excludeIds: string[] = []
): Promise<Product[]> => {
  try {
    let query = supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .limit(limit);
      
    // 除外IDがある場合
    if (excludeIds.length > 0) {
      if (excludeIds.length > 100) {
        // 多数の除外IDがある場合は後でフィルタリング
        const { data, error } = await query;
        
        if (error) {
          console.error('Error fetching products by category:', error);
          throw new Error(error.message);
        }
        
        if (!data || data.length === 0) {
          return [];
        }
        
        // 除外IDをフィルタリング
        const excludeSet = new Set(excludeIds);
        const filteredData = data.filter(item => !excludeSet.has(item.id));
        
        // データの形式を変換
        return filteredData.slice(0, limit).map((item: any) => ({
          id: item.id,
          title: item.title,
          brand: item.brand,
          price: item.price,
          imageUrl: item.image_url,
          description: item.description,
          tags: item.tags || [],
          category: item.category,
          affiliateUrl: item.affiliate_url,
          source: item.source,
          createdAt: item.created_at,
        }));
      } else {
        query = query.not('id', 'in', excludeIds);
      }
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching products by category:', error);
      throw new Error(error.message);
    }
    
    if (!data || data.length === 0) {
      return [];
    }
    
    // データの形式を変換
    return data.map((item: any) => ({
      id: item.id,
      title: item.title,
      brand: item.brand,
      price: item.price,
      imageUrl: item.image_url,
      description: item.description,
      tags: item.tags || [],
      category: item.category,
      affiliateUrl: item.affiliate_url,
      source: item.source,
      createdAt: item.created_at,
    }));
  } catch (error) {
    console.error('Unexpected error in fetchProductsByCategory:', error);
    return [];
  }
};

/**
 * キャッシュを削除する（テスト用）
 */
export const clearRecommendationCaches = (): void => {
  userPreferenceCache.clear();
  recommendationCache.clear();
  popularProductsCache.clear();
  categoryRecommendationCache.clear();
  console.log('All recommendation caches cleared');
};
