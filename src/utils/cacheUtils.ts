import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '@/types';

// キャッシュのキー
const PRODUCT_CACHE_KEY = 'stilya_cached_products';
const CACHE_TIMESTAMP_KEY = 'stilya_product_cache_timestamp';
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24時間

/**
 * 商品データをキャッシュに保存する
 * @param products 保存する商品データの配列
 * @param appendToExisting 既存のキャッシュに追加するかどうか
 */
export const cacheProducts = async (products: Product[], appendToExisting = true): Promise<void> => {
  try {
    if (!products || products.length === 0) return;

    let cachedProducts: Product[] = [];
    
    if (appendToExisting) {
      // 既存のキャッシュを取得
      cachedProducts = await getCachedProducts();
      
      // 新しい商品を追加（ID重複を避けるため、既存のものを除外）
      const existingIds = new Set(cachedProducts.map(p => p.id));
      const newProducts = products.filter(p => !existingIds.has(p.id));
      
      cachedProducts = [...cachedProducts, ...newProducts];
    } else {
      // 既存のキャッシュを上書き
      cachedProducts = [...products];
    }

    // キャッシュの保存
    await AsyncStorage.setItem(PRODUCT_CACHE_KEY, JSON.stringify(cachedProducts));
    
    // タイムスタンプの更新
    await AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
  } catch (error) {
    console.error('Error caching products:', error);
  }
};

/**
 * キャッシュから商品データを取得する
 * @returns キャッシュされた商品データの配列
 */
export const getCachedProducts = async (): Promise<Product[]> => {
  try {
    // キャッシュの有効期限をチェック
    const isCacheValid = await isProductCacheValid();
    if (!isCacheValid) {
      return [];
    }

    // キャッシュからデータを取得
    const cachedData = await AsyncStorage.getItem(PRODUCT_CACHE_KEY);
    if (!cachedData) return [];

    return JSON.parse(cachedData);
  } catch (error) {
    console.error('Error getting cached products:', error);
    return [];
  }
};

/**
 * 商品キャッシュの有効期限をチェックする
 * @returns キャッシュが有効ならtrue
 */
export const isProductCacheValid = async (): Promise<boolean> => {
  try {
    const timestamp = await AsyncStorage.getItem(CACHE_TIMESTAMP_KEY);
    if (!timestamp) return false;

    const cacheTime = parseInt(timestamp);
    const now = Date.now();
    
    // キャッシュの有効期限は24時間
    return now - cacheTime < CACHE_EXPIRY_MS;
  } catch (error) {
    console.error('Error checking cache validity:', error);
    return false;
  }
};

/**
 * 特定のIDの商品をキャッシュから取得する
 * @param productId 商品ID
 * @returns キャッシュされた商品、見つからない場合はnull
 */
export const getCachedProductById = async (productId: string): Promise<Product | null> => {
  try {
    const cachedProducts = await getCachedProducts();
    return cachedProducts.find(p => p.id === productId) || null;
  } catch (error) {
    console.error(`Error getting cached product with ID ${productId}:`, error);
    return null;
  }
};

/**
 * 商品キャッシュをクリアする
 */
export const clearProductCache = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(PRODUCT_CACHE_KEY);
    await AsyncStorage.removeItem(CACHE_TIMESTAMP_KEY);
  } catch (error) {
    console.error('Error clearing product cache:', error);
  }
};
