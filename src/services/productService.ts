import { supabase } from './supabase';
import { Product } from '@/types';
import { Image } from 'expo-image';
import { mockProducts } from '@/mocks/mockProducts';

// モック使用フラグ (開発モードでAPI連携ができない場合に使用)
const USE_MOCK = true; // 本番環境では必ず false にすること

// キャッシュタイムアウト (1時間)
const CACHE_TIMEOUT = 60 * 60 * 1000;

// インメモリキャッシュ
let productsCache: {
  data: Product[];
  timestamp: number;
} | null = null;

// ページネーション情報
let paginationInfo = {
  hasMore: true,
  currentOffset: 0,
  totalFetched: 0,
};

/**
 * 商品リストを取得する
 * キャッシュとPrefetchを活用して高速化
 */
export const fetchProducts = async (limit = 20, offset = 0, forceRefresh = false): Promise<{
  products: Product[];
  hasMore: boolean;
  totalFetched: number;
}> => {
  try {
    // 強制更新フラグがあるかキャッシュが無効の場合はキャッシュをクリア
    if (forceRefresh || !productsCache || Date.now() - productsCache.timestamp >= CACHE_TIMEOUT) {
      productsCache = null;
      paginationInfo = {
        hasMore: true,
        currentOffset: 0,
        totalFetched: 0,
      };
    }

    if (USE_MOCK || __DEV__) {
      // 開発モードまたはモックフラグがtrueの場合はモックデータを返す
      console.log('Using mock products data');
      
      // モックデータでページネーションをシミュレート
      const paginatedMockProducts = mockProducts.slice(offset, offset + limit);
      
      // プリフェッチは最初のセットだけ
      if (offset === 0) {
        await prefetchImages(paginatedMockProducts);
      }
      
      const hasMore = offset + limit < mockProducts.length;
      const totalFetched = Math.min(offset + limit, mockProducts.length);
      
      // ページネーション情報を更新
      paginationInfo = {
        hasMore,
        currentOffset: offset + limit,
        totalFetched,
      };
      
      return {
        products: paginatedMockProducts,
        hasMore,
        totalFetched,
      };
    }

    // キャッシュチェック (初回または最初のページの場合は常に使用)
    if (productsCache && offset === 0) {
      console.log('Using cached products data');
      
      // キャッシュからページに対応するデータを取得
      const paginatedProducts = productsCache.data.slice(offset, offset + limit);
      
      return {
        products: paginatedProducts,
        hasMore: paginationInfo.hasMore,
        totalFetched: paginationInfo.totalFetched,
      };
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

    if (!data || data.length === 0) {
      // ページネーション情報を更新
      paginationInfo.hasMore = false;
      
      return {
        products: [],
        hasMore: false,
        totalFetched: paginationInfo.totalFetched,
      };
    }

    // データの形式を変換 (Supabaseのスネークケースをキャメルケースに)
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

    // ページネーション情報を更新 (取得数がlimitより少ない場合は最後と判断)
    const hasMore = products.length === limit;
    const totalFetched = paginationInfo.totalFetched + products.length;
    
    paginationInfo = {
      hasMore,
      currentOffset: offset + products.length,
      totalFetched,
    };
    
    // キャッシュを更新 (新しいデータを追加)
    if (productsCache) {
      // 既存のキャッシュにデータを追加
      productsCache = {
        data: [...productsCache.data, ...products],
        timestamp: Date.now(),
      };
    } else {
      // 新規にキャッシュを作成
      productsCache = {
        data: products,
        timestamp: Date.now(),
      };
    }

    // 画像のプリフェッチ
    await prefetchImages(products);

    return {
      products,
      hasMore,
      totalFetched,
    };
  } catch (error) {
    console.error('Unexpected error in fetchProducts:', error);
    // エラー発生時もモックデータを返す（開発用）
    if (__DEV__) {
      const paginatedMockProducts = mockProducts.slice(offset, offset + limit);
      const hasMore = offset + limit < mockProducts.length;
      
      return {
        products: paginatedMockProducts,
        hasMore,
        totalFetched: offset + paginatedMockProducts.length,
      };
    }
    throw error;
  }
};

/**
 * 次のページの商品を取得する
 */
export const fetchNextPage = async (limit = 20): Promise<{
  products: Product[];
  hasMore: boolean;
  totalFetched: number;
}> => {
  // 次のページが存在しない場合は空配列を返す
  if (!paginationInfo.hasMore) {
    return {
      products: [],
      hasMore: false,
      totalFetched: paginationInfo.totalFetched,
    };
  }
  
  // 次のページを取得
  return fetchProducts(limit, paginationInfo.currentOffset);
};

/**
 * 画像をプリフェッチしてキャッシュする
 */
export const prefetchImages = async (products: Product[]) => {
  try {
    if (!products || products.length === 0) return;
    
    // 最初の5枚だけプリフェッチ
    const prefetchPromises = products.slice(0, 5).map(product => 
      product.imageUrl ? Image.prefetch(product.imageUrl) : Promise.resolve(false)
    );
    
    // 残りは非同期でバックグラウンドでプリフェッチ
    setTimeout(() => {
      products.slice(5).forEach(product => {
        if (product.imageUrl) {
          Image.prefetch(product.imageUrl).catch(e => 
            console.log(`Failed to prefetch image: ${product.imageUrl}`, e)
          );
        }
      });
    }, 100);
    
    await Promise.all(prefetchPromises);
  } catch (error) {
    console.error('Error prefetching images:', error);
  }
};

/**
 * 商品詳細を取得する
 */
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
      tags: data.tags || [],
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

/**
 * キャッシュをクリアする
 */
export const clearProductsCache = () => {
  productsCache = null;
  paginationInfo = {
    hasMore: true,
    currentOffset: 0,
    totalFetched: 0,
  };
  console.log('Products cache cleared');
};

/**
 * 特定のタグを持つ商品を取得する
 */
export const fetchProductsByTags = async (
  tags: string[],
  limit = 10, 
  excludeIds: string[] = []
): Promise<Product[]> => {
  try {
    if (!tags || tags.length === 0) {
      return [];
    }

    if (USE_MOCK || __DEV__) {
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
      .containsAny('tags', tags)
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

    // プリフェッチ
    await prefetchImages(products);

    return products;
  } catch (error) {
    console.error('Unexpected error in fetchProductsByTags:', error);
    if (__DEV__) {
      // 開発モードではモックデータでの代替処理
      return mockProducts
        .filter(p => 
          !excludeIds.includes(p.id) && 
          p.tags && p.tags.some(tag => tags.includes(tag))
        )
        .slice(0, limit);
    }
    throw error;
  }
};
