import { Image } from 'expo-image';

/**
 * expo-imageのキャッシュをクリアする
 * 画像が更新されない問題を解決するため
 */
export async function clearImageCache() {
  try {
    console.log('[ImageCache] Clearing all image caches...');
    
    // expo-imageのキャッシュをクリア
    await Image.clearDiskCache();
    await Image.clearMemoryCache();
    
    console.log('[ImageCache] ✅ Cache cleared successfully');
    return true;
  } catch (error) {
    console.error('[ImageCache] ❌ Failed to clear cache:', error);
    return false;
  }
}

/**
 * 特定のURLのキャッシュをクリア
 * @param url 画像URL
 */
export async function clearImageCacheForUrl(url: string) {
  try {
    console.log('[ImageCache] Clearing cache for URL:', url);
    
    // URLごとのキャッシュクリアは expo-image では直接サポートされていないため、
    // 全体のキャッシュをクリアする
    await clearImageCache();
    
    return true;
  } catch (error) {
    console.error('[ImageCache] Failed to clear cache for URL:', error);
    return false;
  }
}

/**
 * 開発モードでのみキャッシュをクリア
 */
export async function clearImageCacheInDev() {
  if (__DEV__) {
    return await clearImageCache();
  }
  return false;
}
