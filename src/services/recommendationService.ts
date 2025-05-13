import { supabase } from './supabase';
import { Product, Swipe, UserPreference } from '@/types';
import { getSwipeHistory } from './swipeService';
import { fetchProductsByTags } from './productService';
import { getProductViewHistory } from './viewHistoryService';

// タグの重み付けスコア
const TAG_SCORE_YES = 1.0;    // YESスワイプの場合のスコア
const TAG_SCORE_NO = -0.5;    // NOスワイプの場合のスコア
const TAG_SCORE_VIEW = 0.3;   // 閲覧履歴の場合のスコア
const TAG_SCORE_CLICK = 0.5;  // クリック（購入リンク）の場合のスコア
const TAG_BONUS_THRESHOLD = 3;  // このスコア以上のタグを重要タグとして扱う
const MIN_CONFIDENCE_SCORE = 0.6; // この値以上のタグを使ったレコメンドを行う

/**
 * ユーザーの行動履歴から好みを分析する（強化版）
 * 
 * スワイプ履歴、閲覧履歴、クリック履歴を組み合わせて、より精度の高い好み分析を行う
 * @param userId ユーザーID
 * @returns ユーザーの好みタグとスコア
 */
export const analyzeUserPreferences = async (userId: string): Promise<UserPreference | null> => {
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
    
    // 過去のクリックログを取得（購入リンククリック履歴）
    const { data: clickLogs } = await supabase
      .from('click_logs')
      .select('product_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50);
    
    const clickedProductIds = clickLogs ? clickLogs.map(log => log.product_id) : [];
    
    // 商品IDから商品データを取得
    const yesProducts = await fetchProductsById(yesProductIds);
    const noProducts = await fetchProductsById(noProductIds);
    const clickedProducts = await fetchProductsById(clickedProductIds);
    
    // タグスコアを計算（拡張版 - 閲覧・クリック履歴も考慮）
    const tagScores = calculateEnhancedTagScores(
      yesProducts, 
      noProducts, 
      viewHistory, 
      clickedProducts
    );
    
    // デバッグ情報
    console.log('Enhanced user preference analysis:', {
      userId,
      totalSwipes: swipeHistory.length,
      yesSwipes: yesProductIds.length,
      noSwipes: noProductIds.length,
      viewedProducts: viewHistory.length,
      clickedProducts: clickedProducts.length,
      topTags: Object.entries(tagScores)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    });
    
    return {
      userId,
      tagScores,
      lastUpdated: new Date().toISOString(),
      topTags: getTopTags(tagScores, 10)
    };
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
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds);
      
    if (error) {
      console.error('Error fetching products by IDs:', error);
      throw new Error(error.message);
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
    if (!product.tags) return;
    
    product.tags.forEach(tag => {
      if (!tagScores[tag]) {
        tagScores[tag] = 0;
      }
      tagScores[tag] += TAG_SCORE_YES;
    });
  });
  
  // NOスワイプの商品からタグスコアを減算
  noProducts.forEach(product => {
    if (!product.tags) return;
    
    product.tags.forEach(tag => {
      if (!tagScores[tag]) {
        tagScores[tag] = 0;
      }
      tagScores[tag] += TAG_SCORE_NO;
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
    if (!product.tags) return;
    
    const viewCount = viewCountMap[product.id] || 1;
    const viewWeight = Math.min(viewCount, 3) * 0.1; // 最大3回まで重み付け（0.1, 0.2, 0.3）
    
    product.tags.forEach(tag => {
      if (!tagScores[tag]) {
        tagScores[tag] = 0;
      }
      tagScores[tag] += TAG_SCORE_VIEW + viewWeight;
    });
  });
  
  // クリック（購入リンク）履歴からタグスコアを加算
  clickedProducts.forEach(product => {
    if (!product.tags) return;
    
    product.tags.forEach(tag => {
      if (!tagScores[tag]) {
        tagScores[tag] = 0;
      }
      tagScores[tag] += TAG_SCORE_CLICK;
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
 * 商品データからタグスコアを計算する（基本版）
 * @param yesProducts YESスワイプされた商品
 * @param noProducts NOスワイプされた商品
 * @returns タグとスコアのマップ
 */
const calculateTagScores = (yesProducts: Product[], noProducts: Product[]): Record<string, number> => {
  const tagScores: Record<string, number> = {};
  
  // YESスワイプの商品からタグスコアを加算
  yesProducts.forEach(product => {
    if (!product.tags) return;
    
    product.tags.forEach(tag => {
      if (!tagScores[tag]) {
        tagScores[tag] = 0;
      }
      tagScores[tag] += TAG_SCORE_YES;
    });
  });
  
  // NOスワイプの商品からタグスコアを減算
  noProducts.forEach(product => {
    if (!product.tags) return;
    
    product.tags.forEach(tag => {
      if (!tagScores[tag]) {
        tagScores[tag] = 0;
      }
      tagScores[tag] += TAG_SCORE_NO;
    });
  });
  
  return tagScores;
};
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

/**
 * ユーザーの好みに基づいて商品を推薦する
 * @param userId ユーザーID
 * @param limit 取得する商品数
 * @param excludeIds 除外する商品ID（すでにスワイプした商品など）
 * @returns 推薦商品の配列
 */
export const getRecommendedProducts = async (
  userId: string,
  limit = 10,
  excludeIds: string[] = []
): Promise<Product[]> => {
  try {
    // ユーザーの好みを分析
    const userPreference = await analyzeUserPreferences(userId);
    
    if (!userPreference || !userPreference.topTags || userPreference.topTags.length === 0) {
      console.log('No user preferences found, using popular products instead');
      // 好みが分析できなかった場合は人気商品を返す
      return getPopularProducts(limit, excludeIds);
    }
    
    // 上位タグを使用して関連商品を取得
    let recommendedProducts = await fetchProductsByTags(
      userPreference.topTags,
      limit * 2, // 多めに取得して後でフィルタリング
      excludeIds
    );
    
    if (recommendedProducts.length === 0) {
      // タグで検索してもヒットしなければ人気商品を返す
      return getPopularProducts(limit, excludeIds);
    }
    
    // タグスコアを使用して商品をランク付け
    recommendedProducts = rankProductsByTagScores(
      recommendedProducts,
      userPreference.tagScores
    );
    
    // 上位の商品を返す
    return recommendedProducts.slice(0, limit);
  } catch (error) {
    console.error('Error getting recommended products:', error);
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
    if (product.tags) {
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
  try {
    let query = supabase
      .from('products')
      .select('*')
      .limit(limit);
      
    // 除外IDがある場合
    if (excludeIds.length > 0) {
      query = query.not('id', 'in', excludeIds);
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
    console.error('Unexpected error in getPopularProducts:', error);
    return [];
  }
};

/**
 * カテゴリ別におすすめ商品を取得する
 * @param userId ユーザーID
 * @param categories 取得するカテゴリの配列
 * @param limit カテゴリごとの取得数
 * @returns カテゴリごとの商品リスト
 */
export const getRecommendationsByCategory = async (
  userId: string,
  categories: string[] = ['tops', 'bottoms', 'outerwear', 'accessories'],
  limit: number = 5
): Promise<Record<string, Product[]>> => {
  try {
    const result: Record<string, Product[]> = {};
    
    // ユーザーの好みを分析
    const userPreference = await analyzeUserPreferences(userId);
    
    // スワイプ済みの商品IDを取得
    const swipeHistory = await getSwipeHistory(userId);
    const swipedProductIds = swipeHistory.map(swipe => swipe.productId);
    
    // 各カテゴリごとに処理
    for (const category of categories) {
      if (userPreference && userPreference.topTags && userPreference.topTags.length > 0) {
        // カテゴリと好みのタグで商品を検索
        const products = await fetchProductsByCategoryAndTags(
          category,
          userPreference.topTags,
          limit,
          swipedProductIds
        );
        
        if (products.length > 0) {
          // タグスコアを使用してランク付け
          const rankedProducts = rankProductsByTagScores(
            products,
            userPreference.tagScores
          );
          
          result[category] = rankedProducts;
          continue;
        }
      }
      
      // 好みのタグで見つからなかった場合はカテゴリのみで検索
      const fallbackProducts = await fetchProductsByCategory(
        category,
        limit,
        swipedProductIds
      );
      
      result[category] = fallbackProducts;
    }
    
    return result;
  } catch (error) {
    console.error('Error getting recommendations by category:', error);
    return {};
  }
};

/**
 * カテゴリとタグで商品を検索する
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
    
    let query = supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .containsAny('tags', tags)
      .limit(limit);
      
    // 除外IDがある場合
    if (excludeIds.length > 0) {
      query = query.not('id', 'in', excludeIds);
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
      query = query.not('id', 'in', excludeIds);
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
