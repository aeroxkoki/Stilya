import { Product } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RAKUTEN_APP_ID, RAKUTEN_AFFILIATE_ID, IS_DEV } from '@/utils/env';
import { generateMockProducts } from './mockDataService';

// キャッシュキー
const RAKUTEN_CACHE_KEY_PREFIX = 'rakuten_products_cache_';
const CACHE_EXPIRY = 60 * 60 * 1000; // 1時間

// レート制限対策
const RATE_LIMIT_DELAY = 1000; // 1秒の遅延
const MAX_RETRIES = 3; // 最大リトライ回数
const RETRY_DELAY = 5000; // リトライ時の待機時間（5秒）

// 中古品判定のヘルパー関数
const isUsedProduct = (product: any): boolean => {
  const title = (product.itemName || '').toLowerCase();
  const shopName = (product.shopName || '').toLowerCase();
  
  // 中古関連キーワード
  const usedKeywords = ['中古', 'used', 'ユーズド', 'セカンドハンド', 'リユース', 'アウトレット'];
  const hasUsedKeyword = usedKeywords.some(keyword => 
    title.includes(keyword) || shopName.includes(keyword)
  );
  
  // 中古専門ショップ
  const usedShops = ['セカンドストリート', 'メルカリ', 'ラクマ', '2nd street', 'リサイクル'];
  const isUsedShop = usedShops.some(shop => 
    shopName.includes(shop.toLowerCase())
  );
  
  return hasUsedKeyword || isUsedShop;
};

// APIコールの間隔を管理
let lastApiCallTime = 0;

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

// 遅延処理のヘルパー関数
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// レート制限を考慮したAPIコール（fetchベース）
const rateLimitedApiCall = async (url: string, retryCount = 0): Promise<any> => {
  // API呼び出し間隔の制御
  const now = Date.now();
  const timeSinceLastCall = now - lastApiCallTime;
  
  if (timeSinceLastCall < RATE_LIMIT_DELAY) {
    await sleep(RATE_LIMIT_DELAY - timeSinceLastCall);
  }
  
  lastApiCallTime = Date.now();
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    if (response.status === 429 && retryCount < MAX_RETRIES) {
      console.log(`楽天APIレート制限に達しました。${RETRY_DELAY / 1000}秒後にリトライします... (${retryCount + 1}/${MAX_RETRIES})`);
      await sleep(RETRY_DELAY);
      return rateLimitedApiCall(url, retryCount + 1);
    }
    
    if (!response.ok) {
      // エラーレスポンスの詳細を取得
      let errorDetails = '';
      try {
        const errorBody = await response.text();
        errorDetails = errorBody;
        console.error('[RakutenService] API Error Response:', {
          status: response.status,
          statusText: response.statusText,
          body: errorBody,
          url: url
        });
      } catch (e) {
        console.error('[RakutenService] Could not parse error response');
      }
      throw new Error(`HTTP error! status: ${response.status}, details: ${errorDetails}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error: any) {
    console.error('[RakutenService] API call error:', error);
    throw error;
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
  // キャッシュキーの生成
  const cacheKey = `fashion_${genreId}_${keyword || 'all'}_${page}_${hits}`;
  
  try {
    // 強制更新でなければキャッシュをチェック
    if (!forceRefresh) {
      const cachedData = await getFromCache(cacheKey);
      if (cachedData) {
        console.log('Using cached Rakuten products data');
        return cachedData;
      }
    }
    
    // APIキーが設定されていない場合はエラーをスロー
    if (!RAKUTEN_APP_ID || !RAKUTEN_AFFILIATE_ID) {
      console.error('[RakutenService] API keys not set!');
      console.error('[RakutenService] RAKUTEN_APP_ID:', RAKUTEN_APP_ID ? 'Set' : 'Missing');
      console.error('[RakutenService] RAKUTEN_AFFILIATE_ID:', RAKUTEN_AFFILIATE_ID ? 'Set' : 'Missing');
      throw new Error('Rakuten API keys are not configured');
    }
    
    console.log('[RakutenService] API keys are set, proceeding with real API call');
    
    // APIリクエストのパラメータを構築
    const params = new URLSearchParams({
      format: 'json',
      keyword: keyword || 'ファッション',
      genreId: genreId.toString(),
      page: page.toString(),
      hits: hits.toString(),
      applicationId: RAKUTEN_APP_ID,
      // affiliateIdは存在する場合のみ追加
      ...(RAKUTEN_AFFILIATE_ID ? { affiliateId: RAKUTEN_AFFILIATE_ID } : {}),
      sort: '+updateTimestamp', // 新着順
      imageFlag: '1', // 画像ありのみ
    });
    
    // APIのURLを最新バージョンに更新
    const url = `https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706?${params}`;
    
    console.log('[RakutenService] API URL:', url.replace(RAKUTEN_APP_ID, 'APP_ID_HIDDEN'));
    
    console.log('[RakutenService] Fetching from API...');
    const data = await rateLimitedApiCall(url);
    
    if (!data || !data.Items) {
      console.error('Invalid response from Rakuten API');
      return {
        products: [],
        totalProducts: 0,
        pageCount: 0,
      };
    }
    
    // APIレスポンスをProduct型に変換
    const products: Product[] = data.Items
      .map((item: any) => {
        const productItem = item.Item || item;
        
        // 必須項目のチェック
        if (!productItem.itemCode || !productItem.itemName || !productItem.itemPrice) {
          console.warn('[RakutenService] Skipping invalid product:', productItem);
          return null;
        }
        
        // タグの生成
        const tags: string[] = [];
        if (productItem.itemName) {
          // 商品名から簡単なタグを抽出
          if (productItem.itemName.includes('ワンピース')) tags.push('ワンピース');
          if (productItem.itemName.includes('トップス')) tags.push('トップス');
          if (productItem.itemName.includes('パンツ')) tags.push('パンツ');
          if (productItem.itemName.includes('スカート')) tags.push('スカート');
          if (productItem.itemName.includes('アウター')) tags.push('アウター');
          if (productItem.itemName.includes('バッグ')) tags.push('バッグ');
          if (productItem.itemName.includes('シューズ') || productItem.itemName.includes('靴')) tags.push('シューズ');
        }
        
        // ジャンルIDに基づくタグ
        if (genreId === 100371) tags.push('レディース');
        if (genreId === 551177) tags.push('メンズ');
        
        return {
          id: productItem.itemCode,
          title: productItem.itemName,
          price: productItem.itemPrice,
          brand: productItem.shopName || 'ブランド不明',
          // 画像URLは大きいサイズを優先的に選択
          imageUrl: productItem.mediumImageUrls?.length > 0 
            ? productItem.mediumImageUrls[0].imageUrl.replace('128x128', '600x600')
            : (productItem.imageUrl || ''),
          description: productItem.itemCaption || '',
          tags: tags,
          category: 'ファッション',
          affiliateUrl: productItem.affiliateUrl || productItem.itemUrl || '',
          source: 'rakuten',
          createdAt: new Date().toISOString(),
          isUsed: isUsedProduct(productItem), // 中古品判定
        };
      })
      .filter((product: Product | null) => product !== null); // 無効な商品を除外
    
    const result = {
      products,
      totalProducts: data.count || products.length,
      pageCount: data.pageCount || 1,
    };
    
    // 結果をキャッシュに保存
    await saveToCache(cacheKey, result);
    
    return result;
  } catch (error: any) {
    console.error('[RakutenService] Error fetching products:', error);
    throw error;
  }
};

/**
 * ジャンル別に商品を取得（カテゴリ一覧用）
 */
export const fetchRakutenGenreProducts = async (
  genreId: number,
  page: number = 1,
  hits: number = 10
): Promise<Product[]> => {
  try {
    const result = await fetchRakutenFashionProducts(undefined, genreId, page, hits);
    return result.products;
  } catch (error) {
    console.error(`Error fetching products for genre ${genreId}:`, error);
    return [];
  }
};
