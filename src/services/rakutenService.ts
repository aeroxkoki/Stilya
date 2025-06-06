import axios from 'axios';
import { Product } from '@/types';
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 楽天APIキー（.envファイルから読み込む想定）
const RAKUTEN_APP_ID = process.env.RAKUTEN_APP_ID || 'YOUR_RAKUTEN_APP_ID';
const RAKUTEN_AFFILIATE_ID = process.env.RAKUTEN_AFFILIATE_ID || 'YOUR_RAKUTEN_AFFILIATE_ID';

// キャッシュキー
const RAKUTEN_CACHE_KEY_PREFIX = 'rakuten_products_cache_';
const CACHE_EXPIRY = 60 * 60 * 1000; // 1時間

// キャッシュからデータを取得
const getFromCache = async (cacheKey: string) => {
  try {
    const cachedData = await AsyncStorage.getItem(`${RAKUTEN_CACHE_KEY_PREFIX}${cacheKey}`);
    if (cachedData) {
      const { data, timestamp } = JSON.parse(cachedData);
      // キャッシュの有効期限をチェック
      if (Date.now() - timestamp < CACHE_EXPIRY) {
        return data;
      }
    }
    return null;
  } catch (error) {
    console.error('Error getting data from cache:', error);
    return null;
  }
};

// キャッシュにデータを保存
const saveToCache = async (cacheKey: string, data: any) => {
  try {
    const cacheData = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(
      `${RAKUTEN_CACHE_KEY_PREFIX}${cacheKey}`,
      JSON.stringify(cacheData)
    );
  } catch (error) {
    console.error('Error saving data to cache:', error);
  }
};

/**
 * 楽天商品検索APIからファッション商品を取得
 */
export const fetchRakutenFashionProducts = async (
  keyword?: string,
  genreId: number = 100371, // デフォルトは女性ファッション
  page: number = 1,
  hits: number = 30,
  forceRefresh: boolean = false
): Promise<{
  products: Product[];
  totalProducts: number;
  pageCount: number;
}> => {
  try {
    // キャッシュキーの生成
    const cacheKey = `fashion_${genreId}_${keyword || 'all'}_${page}_${hits}`;
    
    // 強制更新でなければキャッシュをチェック
    if (!forceRefresh) {
      const cachedData = await getFromCache(cacheKey);
      if (cachedData) {
        console.log('Using cached Rakuten products data');
        return cachedData;
      }
    }
    
    // リクエストパラメータ
    const params: any = {
      applicationId: RAKUTEN_APP_ID,
      affiliateId: RAKUTEN_AFFILIATE_ID,
      genreId: genreId.toString(),
      hits,
      page,
      format: 'json',
    };
    
    // キーワードがあれば追加
    if (keyword) {
      params.keyword = keyword;
    }
    
    // 楽天APIにリクエスト
    const response = await axios.get(
      'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706',
      { params }
    );
    
    const { Items, count, pageCount } = response.data;
    
    if (!Items || Items.length === 0) {
      return {
        products: [],
        totalProducts: 0,
        pageCount: 0,
      };
    }
    
    // APIレスポンスをアプリの形式に変換
    const products: Product[] = Items.map((item: any) => {
      const product = item.Item;
      return {
        id: product.itemCode,
        title: product.itemName,
        price: product.itemPrice,
        brand: product.shopName, // 楽天APIではshopNameが相当
        imageUrl: product.mediumImageUrls[0]?.imageUrl.replace('?_ex=128x128', '?_ex=500x500') || '',
        description: product.itemCaption,
        tags: extractTags(product.itemName, product.tagIds || []),
        category: genreId.toString(),
        affiliateUrl: product.affiliateUrl,
        source: 'rakuten',
        createdAt: new Date().toISOString(),
      };
    });
    
    // 画像のプリフェッチ
    await prefetchImages(products);
    
    const result = {
      products,
      totalProducts: count,
      pageCount,
    };
    
    // 結果をキャッシュに保存
    await saveToCache(cacheKey, result);
    
    return result;
  } catch (error) {
    console.error('Error fetching Rakuten products:', error);
    throw error;
  }
};

/**
 * 特定のジャンルの商品を取得
 */
export const fetchRakutenGenreProducts = async (
  genreId: number,
  page: number = 1,
  hits: number = 30
): Promise<Product[]> => {
  try {
    const { products } = await fetchRakutenFashionProducts(
      undefined,
      genreId,
      page,
      hits
    );
    return products;
  } catch (error) {
    console.error(`Error fetching genre ${genreId} products:`, error);
    return [];
  }
};

/**
 * 関連商品（同じタグを持つ商品）を取得
 */
export const fetchRelatedProducts = async (
  tags: string[],
  excludeIds: string[] = [],
  limit: number = 10
): Promise<Product[]> => {
  try {
    if (!tags || tags.length === 0) {
      return [];
    }
    
    // タグで検索
    const tagKeyword = tags.slice(0, 2).join(' '); // 最初の2つのタグだけ使用
    
    const { products } = await fetchRakutenFashionProducts(
      tagKeyword,
      undefined,
      1,
      limit * 2 // 多めに取得して除外IDをフィルタリング
    );
    
    // 除外IDを除外
    const filteredProducts = products.filter(
      product => !excludeIds.includes(product.id)
    ).slice(0, limit);
    
    return filteredProducts;
  } catch (error) {
    console.error('Error fetching related products:', error);
    return [];
  }
};

/**
 * 商品名やタグからタグ情報を抽出
 */
const extractTags = (itemName: string, tagIds: number[]): string[] => {
  const tags: string[] = [];
  
  // タグIDからジャンル名を推測（本来はAPIでジャンル名を取得するべき）
  if (tagIds.includes(100371)) {
    tags.push('レディース');
  }
  if (tagIds.includes(551177)) {
    tags.push('メンズ');
  }
  
  // 商品名から特徴を抽出
  const keywordMap: { [key: string]: string } = {
    'シャツ': 'シャツ',
    'ブラウス': 'ブラウス',
    'Tシャツ': 'Tシャツ',
    'カットソー': 'カットソー',
    'ワンピース': 'ワンピース',
    'スカート': 'スカート',
    'パンツ': 'パンツ',
    'デニム': 'デニム',
    'ジーンズ': 'ジーンズ',
    'ジャケット': 'ジャケット',
    'コート': 'コート',
    'セーター': 'セーター',
    'ニット': 'ニット',
    'カジュアル': 'カジュアル',
    'フォーマル': 'フォーマル',
    '春': '春',
    '夏': '夏',
    '秋': '秋',
    '冬': '冬',
    'オフィス': 'オフィス',
    'デート': 'デート',
  };
  
  // 商品名から特徴を抽出
  Object.entries(keywordMap).forEach(([keyword, tag]) => {
    if (itemName.includes(keyword) && !tags.includes(tag)) {
      tags.push(tag);
    }
  });
  
  return tags;
};

/**
 * 画像をプリフェッチ
 */
const prefetchImages = async (products: Product[]) => {
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
 * キャッシュをクリア
 */
export const clearRakutenCache = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const rakutenCacheKeys = keys.filter(key => 
      key.startsWith(RAKUTEN_CACHE_KEY_PREFIX)
    );
    
    if (rakutenCacheKeys.length > 0) {
      await AsyncStorage.multiRemove(rakutenCacheKeys);
      console.log(`Cleared ${rakutenCacheKeys.length} Rakuten cache items`);
    }
  } catch (error) {
    console.error('Error clearing Rakuten cache:', error);
  }
};
