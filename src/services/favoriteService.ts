import { supabase } from './supabase';
import { generateDummyProducts } from '@/utils/dummyData';

// モック使用フラグ
const USE_MOCK = true; // 本番環境では必ず false にすること

// インメモリキャッシュ
interface FavoriteCache {
  [userId: string]: {
    favorites: string[];  // 商品IDの配列
    timestamp: number;    // キャッシュのタイムスタンプ
  };
}

const favoriteCache: FavoriteCache = {};

// キャッシュタイムアウト (1時間)
const CACHE_TIMEOUT = 60 * 60 * 1000;

/**
 * ユーザーのお気に入り商品一覧を取得する
 */
export const getFavorites = async (userId: string) => {
  try {
    // キャッシュチェック
    if (
      favoriteCache[userId] &&
      Date.now() - favoriteCache[userId].timestamp < CACHE_TIMEOUT
    ) {
      return favoriteCache[userId].favorites;
    }

    if (USE_MOCK || __DEV__) {
      // 開発用：ランダムなお気に入りを生成
      console.log('Using mock favorites data');
      const mockProducts = generateDummyProducts(10);
      const favorites = mockProducts
        .slice(0, 5) // 最初の5つだけを選択
        .map(product => product.id);
      
      // キャッシュ更新
      favoriteCache[userId] = {
        favorites,
        timestamp: Date.now(),
      };
      
      return favorites;
    }

    // DBから取得
    const { data, error } = await supabase
      .from('favorites')
      .select('product_id')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching favorites:', error);
      throw new Error(error.message);
    }

    // 商品IDの配列に変換
    const favoriteIds = data.map(item => item.product_id);
    
    // キャッシュ更新
    favoriteCache[userId] = {
      favorites: favoriteIds,
      timestamp: Date.now(),
    };
    
    return favoriteIds;
  } catch (error) {
    console.error('Unexpected error in getFavorites:', error);
    // エラー時は空配列を返す
    return [];
  }
};

/**
 * 商品がお気に入りに入っているか確認する
 */
export const isFavorite = async (userId: string, productId: string): Promise<boolean> => {
  try {
    // キャッシュチェック
    if (
      favoriteCache[userId] &&
      Date.now() - favoriteCache[userId].timestamp < CACHE_TIMEOUT
    ) {
      return favoriteCache[userId].favorites.includes(productId);
    }

    if (USE_MOCK || __DEV__) {
      // 開発用：ランダムにお気に入りを判定
      return Math.random() > 0.7; // 30%の確率でお気に入り済みとする
    }

    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (error && error.code !== 'PGRST116') { // PGRST116: ノーデータ時のエラー
      console.error('Error checking favorite status:', error);
      return false;
    }

    return !!data;
  } catch (error) {
    console.error('Unexpected error in isFavorite:', error);
    return false;
  }
};

/**
 * お気に入りに追加/削除を切り替える
 */
export const toggleFavorite = async (userId: string, productId: string): Promise<boolean> => {
  try {
    // 現在のお気に入り状態を確認
    const isCurrentlyFavorite = await isFavorite(userId, productId);
    
    if (USE_MOCK || __DEV__) {
      console.log(`Mock: ${isCurrentlyFavorite ? 'Removing' : 'Adding'} product ${productId} ${isCurrentlyFavorite ? 'from' : 'to'} favorites`);
      
      // キャッシュを更新
      if (favoriteCache[userId]) {
        if (isCurrentlyFavorite) {
          // 削除
          favoriteCache[userId] = {
            favorites: favoriteCache[userId].favorites.filter(id => id !== productId),
            timestamp: Date.now(),
          };
        } else {
          // 追加
          favoriteCache[userId] = {
            favorites: [...favoriteCache[userId].favorites, productId],
            timestamp: Date.now(),
          };
        }
      } else {
        // 新規作成
        favoriteCache[userId] = {
          favorites: [productId],
          timestamp: Date.now(),
        };
      }
      
      return !isCurrentlyFavorite;
    }

    if (isCurrentlyFavorite) {
      // お気に入りから削除
      const { error } = await supabase
        .from('favorites')
        .delete()
        .match({ user_id: userId, product_id: productId });

      if (error) {
        console.error('Error removing favorite:', error);
        throw new Error(error.message);
      }
      
      // キャッシュ更新
      if (favoriteCache[userId]) {
        favoriteCache[userId] = {
          favorites: favoriteCache[userId].favorites.filter(id => id !== productId),
          timestamp: Date.now(),
        };
      }
      
      return false;
    } else {
      // お気に入りに追加
      const { error } = await supabase
        .from('favorites')
        .insert({
          user_id: userId,
          product_id: productId,
        });

      if (error) {
        console.error('Error adding favorite:', error);
        throw new Error(error.message);
      }
      
      // キャッシュ更新
      if (favoriteCache[userId]) {
        favoriteCache[userId] = {
          favorites: [...favoriteCache[userId].favorites, productId],
          timestamp: Date.now(),
        };
      } else {
        favoriteCache[userId] = {
          favorites: [productId],
          timestamp: Date.now(),
        };
      }
      
      return true;
    }
  } catch (error) {
    console.error('Unexpected error in toggleFavorite:', error);
    throw error;
  }
};

/**
 * キャッシュをクリアする
 */
export const clearFavoriteCache = (userId?: string) => {
  if (userId) {
    delete favoriteCache[userId];
  } else {
    Object.keys(favoriteCache).forEach(key => {
      delete favoriteCache[key];
    });
  }
  console.log('Favorites cache cleared');
};
