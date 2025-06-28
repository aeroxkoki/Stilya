import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Expo-imageのキャッシュをクリア
 */
export async function clearImageCache() {
  try {
    console.log('[ImageCache] Clearing image cache...');
    
    // Expo Image のキャッシュをクリア
    await Image.clearDiskCache();
    await Image.clearMemoryCache();
    
    console.log('[ImageCache] Cache cleared successfully');
    return true;
  } catch (error) {
    console.error('[ImageCache] Failed to clear cache:', error);
    return false;
  }
}

/**
 * アプリの全キャッシュをクリア（開発用）
 */
export async function clearAllCaches() {
  try {
    console.log('[Cache] Clearing all caches...');
    
    // 画像キャッシュをクリア
    await clearImageCache();
    
    // AsyncStorageのキャッシュをクリア（オプション）
    const keys = await AsyncStorage.getAllKeys();
    if (keys.length > 0) {
      await AsyncStorage.multiRemove(keys);
      console.log(`[Cache] Cleared ${keys.length} AsyncStorage items`);
    }
    
    console.log('[Cache] All caches cleared successfully');
    return true;
  } catch (error) {
    console.error('[Cache] Failed to clear all caches:', error);
    return false;
  }
}

/**
 * デバッグ用：キャッシュ状態を確認
 */
export async function getCacheInfo() {
  try {
    const asyncStorageKeys = await AsyncStorage.getAllKeys();
    
    return {
      asyncStorageItemCount: asyncStorageKeys.length,
      asyncStorageKeys: asyncStorageKeys.slice(0, 10), // 最初の10個のキーのみ
    };
  } catch (error) {
    console.error('[Cache] Failed to get cache info:', error);
    return null;
  }
}
