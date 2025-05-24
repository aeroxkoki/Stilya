import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * ローカルストレージ操作のユーティリティ
 * キャッシュやオフライン対応のためのデータ永続化を担当
 */

// キー定数
export const STORAGE_KEYS = {
  AUTH_TOKEN: '@stilya:auth_token',
  USER_PROFILE: '@stilya:user_profile',
  OFFLINE_SWIPES: '@stilya:offline_swipes',
  CACHE_PRODUCTS: '@stilya:cache_products',
  CACHE_TIMESTAMP: '@stilya:cache_timestamp',
  THEME_PREFERENCE: '@stilya:theme_preference',
  APP_SETTINGS: '@stilya:app_settings',
};

// データを保存する
export const storeData = async <T>(key: string, value: T): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(value);
    await AsyncStorage.setItem(key, jsonValue);
  } catch (error) {
    console.error(`Error storing data for key ${key}:`, error);
    throw error;
  }
};

// データを取得する
export const getData = async <T>(key: string): Promise<T | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(key);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error(`Error retrieving data for key ${key}:`, error);
    return null;
  }
};

// データを削除する
export const removeData = async (key: string): Promise<void> => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error(`Error removing data for key ${key}:`, error);
    throw error;
  }
};

// 複数のデータを一度に保存する
export const storeMultipleData = async (keyValuePairs: [string, any][]): Promise<void> => {
  try {
    const pairs: [string, string][] = keyValuePairs.map(([key, value]) => [key, JSON.stringify(value)]);
    await AsyncStorage.multiSet(pairs);
  } catch (error) {
    console.error('Error storing multiple data:', error);
    throw error;
  }
};

// 複数のデータを一度に取得する
export const getMultipleData = async (keys: string[]): Promise<Record<string, any>> => {
  try {
    const pairs = await AsyncStorage.multiGet(keys);
    return pairs.reduce<Record<string, any>>((acc, [key, value]) => {
      if (value) {
        acc[key] = JSON.parse(value);
      }
      return acc;
    }, {});
  } catch (error) {
    console.error('Error retrieving multiple data:', error);
    return {};
  }
};

// アプリのすべてのデータをクリアする（ログアウト時など）
export const clearAllData = async (): Promise<void> => {
  try {
    const keysToKeep = [STORAGE_KEYS.THEME_PREFERENCE, STORAGE_KEYS.APP_SETTINGS];
    const allKeys = await AsyncStorage.getAllKeys();
    const keysToRemove = allKeys.filter(key => !keysToKeep.includes(key));
    
    if (keysToRemove.length > 0) {
      await AsyncStorage.multiRemove(keysToRemove);
    }
  } catch (error) {
    console.error('Error clearing all data:', error);
    throw error;
  }
};

// キャッシュのタイムスタンプを確認し、有効期限内かどうかをチェック
export const isCacheValid = async (key: string, maxAge: number): Promise<boolean> => {
  try {
    const timestampKey = `${key}_timestamp`;
    const timestamp = await AsyncStorage.getItem(timestampKey);
    
    if (!timestamp) return false;
    
    const storedTime = parseInt(timestamp, 10);
    const currentTime = Date.now();
    
    // maxAgeはミリ秒単位
    return currentTime - storedTime < maxAge;
  } catch (error) {
    console.error(`Error checking cache validity for ${key}:`, error);
    return false;
  }
};

// キャッシュデータを保存し、タイムスタンプも更新
export const setCacheData = async <T>(key: string, data: T): Promise<void> => {
  try {
    const timestampKey = `${key}_timestamp`;
    const currentTime = Date.now().toString();
    
    const pairs: [string, string][] = [
      [key, JSON.stringify(data)],
      [timestampKey, currentTime]
    ];
    
    await AsyncStorage.multiSet(pairs);
  } catch (error) {
    console.error(`Error setting cache data for ${key}:`, error);
    throw error;
  }
};

// オフラインデータ追加（配列に新しい要素を追加）
export const addToOfflineQueue = async <T>(key: string, item: T): Promise<void> => {
  try {
    const existingData = await getData<T[]>(key) || [];
    const updatedData = [...existingData, item];
    await storeData(key, updatedData);
  } catch (error) {
    console.error(`Error adding to offline queue for ${key}:`, error);
    throw error;
  }
};

// オフラインキューをクリア
export const clearOfflineQueue = async (key: string): Promise<void> => {
  try {
    await storeData(key, []);
  } catch (error) {
    console.error(`Error clearing offline queue for ${key}:`, error);
    throw error;
  }
};
