import { supabase } from './supabase';
import { Product, SwipeResult } from '../types/product';
import { mockProducts } from '../mocks/mockProducts';
import { Image } from 'expo-image';

// モック使用フラグ (開発モードでAPI連携ができない場合に使用)
const USE_MOCK = true; // 本番環境では必ず false にすること

// キャッシュタイムアウト (1時間)
const CACHE_TIMEOUT = 60 * 60 * 1000;

// インメモリキャッシュ
let productsCache: {
  data: Product[];
  timestamp: number;
} | null = null;

/**
 * 商品リストを取得する
 * キャッシュとPrefetchを活用して高速化
 */
export const fetchProducts = async (limit = 20, offset = 0): Promise<Product[]> => {
  try {
    if (USE_MOCK || __DEV__) {
      // 開発モードまたはモックフラグがtrueの場合はモックデータを返す
      console.log('Using mock products data');
      await prefetchImages(mockProducts);
      return mockProducts;
    }

    // キャッシュチェック
    if (productsCache && Date.now() - productsCache.timestamp < CACHE_TIMEOUT) {
      console.log('Using cached products data');
      return productsCache.data;
    }

    // Supabaseから商品データを取得
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching products:', error);
      throw new Error(error.message);
    }

    // データの形式を変換 (Supabaseのスネークケースをキャメルケースに)
    const products = data.map((item: any) => ({
      id: item.id,
      title: item.title,
      brand: item.brand,
      price: item.price,
      imageUrl: item.image_url,
      description: item.description,
      tags: item.tags,
      category: item.category,
      affiliateUrl: item.affiliate_url,
      source: item.source,
      createdAt: item.created_at,
    }));

    // キャッシュを更新
    productsCache = {
      data: products,
      timestamp: Date.now(),
    };

    // 画像のプリフェッチ
    await prefetchImages(products);

    return products;
  } catch (error) {
    console.error('Unexpected error in fetchProducts:', error);
    // エラー発生時もモックデータを返す（開発用）
    if (__DEV__) {
      return mockProducts;
    }
    throw error;
  }
};

/**
 * 画像をプリフェッチしてキャッシュする
 */
export const prefetchImages = async (products: Product[]) => {
  try {
    // 最初の5枚だけプリフェッチ
    const prefetchPromises = products.slice(0, 5).map(product => 
      Image.prefetch(product.imageUrl)
    );
    
    // 残りは非同期でバックグラウンドでプリフェッチ
    setTimeout(() => {
      products.slice(5).forEach(product => {
        Image.prefetch(product.imageUrl).catch(e => 
          console.log(`Failed to prefetch image: ${product.imageUrl}`, e)
        );
      });
    }, 100);
    
    await Promise.all(prefetchPromises);
  } catch (error) {
    console.error('Error prefetching images:', error);
  }
};

// 商品詳細を取得する
export const fetchProductById = async (productId: string): Promise<Product | null> => {
  try {
    if (USE_MOCK || __DEV__) {
      // モックデータから該当商品を検索
      const product = mockProducts.find(p => p.id === productId);
      return product || null;
    }

    // キャッシュから検索
    if (productsCache) {
      const cachedProduct = productsCache.data.find(p => p.id === productId);
      if (cachedProduct) {
        return cachedProduct;
      }
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) {
      console.error('Error fetching product by ID:', error);
      throw new Error(error.message);
    }

    if (!data) {
      return null;
    }

    // データの形式を変換
    return {
      id: data.id,
      title: data.title,
      brand: data.brand,
      price: data.price,
      imageUrl: data.image_url,
      description: data.description,
      tags: data.tags,
      category: data.category,
      affiliateUrl: data.affiliate_url,
      source: data.source,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('Unexpected error in fetchProductById:', error);
    if (__DEV__ && mockProducts.length > 0) {
      // 開発モードではエラーが発生した場合、モックの最初のアイテムを返す
      return mockProducts.find(p => p.id === productId) || mockProducts[0];
    }
    throw error;
  }
};

// スワイプ結果を保存する
export const saveSwipeResult = async (swipeResult: SwipeResult): Promise<void> => {
  try {
    if (USE_MOCK || __DEV__) {
      // 開発モードではログ出力のみ
      console.log('Saving swipe result (mock):', swipeResult);
      return;
    }

    const { error } = await supabase
      .from('swipes')
      .insert([
        {
          user_id: swipeResult.userId,
          product_id: swipeResult.productId,
          result: swipeResult.result,
        }
      ]);

    if (error) {
      console.error('Error saving swipe result:', error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Unexpected error in saveSwipeResult:', error);
    throw error;
  }
};

// レコメンデーション用のキャッシュ
let recommendationsCache: {
  [userId: string]: {
    data: Product[];
    timestamp: number;
  };
} = {};

// おすすめ商品を取得する
export const fetchRecommendedProducts = async (userId: string, limit = 10): Promise<Product[]> => {
  try {
    if (USE_MOCK || __DEV__) {
      // 開発モードではモックデータの一部を返す
      console.log('Using mock recommended products data');
      const recommendations = mockProducts.slice(0, limit);
      await prefetchImages(recommendations);
      return recommendations;
    }

    // キャッシュチェック
    if (
      recommendationsCache[userId] && 
      Date.now() - recommendationsCache[userId].timestamp < CACHE_TIMEOUT
    ) {
      console.log('Using cached recommendations data');
      return recommendationsCache[userId].data;
    }

    // 本来は推薦アルゴリズムをここに実装
    // 現段階ではユーザーがYesと答えた商品のタグに基づく簡易レコメンドを想定
    
    // 1. ユーザーがYesと答えた商品のIDを取得
    const { data: swipedYes, error: swipeError } = await supabase
      .from('swipes')
      .select('product_id')
      .eq('user_id', userId)
      .eq('result', 'yes');

    if (swipeError) {
      console.error('Error fetching swiped yes products:', swipeError);
      throw new Error(swipeError.message);
    }

    if (!swipedYes || swipedYes.length === 0) {
      // Yesの履歴がない場合は人気商品を返す
      const { data: popularProducts, error: popularError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (popularError) {
        console.error('Error fetching popular products:', popularError);
        throw new Error(popularError.message);
      }

      const recommendations = popularProducts.map((item: any) => ({
        id: item.id,
        title: item.title,
        brand: item.brand,
        price: item.price,
        imageUrl: item.image_url,
        description: item.description,
        tags: item.tags,
        category: item.category,
        affiliateUrl: item.affiliate_url,
        source: item.source,
        createdAt: item.created_at,
      }));

      // キャッシュを更新
      recommendationsCache[userId] = {
        data: recommendations,
        timestamp: Date.now(),
      };

      await prefetchImages(recommendations);
      return recommendations;
    }

    // 2. Yesと答えた商品のタグを取得
    const swipedProductIds = swipedYes.map((item: any) => item.product_id);
    const { data: swipedProducts, error: productError } = await supabase
      .from('products')
      .select('tags')
      .in('id', swipedProductIds);

    if (productError) {
      console.error('Error fetching swiped products:', productError);
      throw new Error(productError.message);
    }

    // 3. タグを集計
    const tagCounts: Record<string, number> = {};
    swipedProducts.forEach((product: any) => {
      if (product.tags) {
        product.tags.forEach((tag: string) => {
          tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
      }
    });

    // 4. 上位のタグを抽出
    const topTags = Object.entries(tagCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);

    if (topTags.length === 0) {
      // タグがない場合は人気商品を返す
      const { data: popularProducts, error: popularError } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (popularError) {
        console.error('Error fetching popular products:', popularError);
        throw new Error(popularError.message);
      }

      const recommendations = popularProducts.map((item: any) => ({
        id: item.id,
        title: item.title,
        brand: item.brand,
        price: item.price,
        imageUrl: item.image_url,
        description: item.description,
        tags: item.tags,
        category: item.category,
        affiliateUrl: item.affiliate_url,
        source: item.source,
        createdAt: item.created_at,
      }));

      // キャッシュを更新
      recommendationsCache[userId] = {
        data: recommendations,
        timestamp: Date.now(),
      };

      await prefetchImages(recommendations);
      return recommendations;
    }

    // 5. タグに基づいて商品を検索（既にスワイプした商品を除く）
    const { data: recommendedProducts, error: recommendError } = await supabase
      .from('products')
      .select('*')
      .not('id', 'in', swipedProductIds)
      .containsAny('tags', topTags)
      .limit(limit);

    if (recommendError) {
      console.error('Error fetching recommended products:', recommendError);
      throw new Error(recommendError.message);
    }

    const recommendations = recommendedProducts.map((item: any) => ({
      id: item.id,
      title: item.title,
      brand: item.brand,
      price: item.price,
      imageUrl: item.image_url,
      description: item.description,
      tags: item.tags,
      category: item.category,
      affiliateUrl: item.affiliate_url,
      source: item.source,
      createdAt: item.created_at,
    }));

    // キャッシュを更新
    recommendationsCache[userId] = {
      data: recommendations,
      timestamp: Date.now(),
    };

    await prefetchImages(recommendations);
    return recommendations;
  } catch (error) {
    console.error('Unexpected error in fetchRecommendedProducts:', error);
    // エラー発生時はモックデータを返す（開発用）
    if (__DEV__) {
      return mockProducts.slice(0, limit);
    }
    throw error;
  }
};

// クリックログを記録する
export const recordProductClick = async (userId: string, productId: string): Promise<void> => {
  try {
    if (USE_MOCK || __DEV__) {
      // 開発モードではログ出力のみ
      console.log('Recording product click (mock):', { userId, productId });
      return;
    }

    const { error } = await supabase
      .from('click_logs')
      .insert([
        {
          user_id: userId,
          product_id: productId,
        }
      ]);

    if (error) {
      console.error('Error recording product click:', error);
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Unexpected error in recordProductClick:', error);
    // 開発モードではエラーを無視
    if (!__DEV__) {
      throw error;
    }
  }
};

// キャッシュをクリアする
export const clearProductsCache = () => {
  productsCache = null;
  recommendationsCache = {};
  console.log('Products cache cleared');
};
