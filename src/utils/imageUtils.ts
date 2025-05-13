import { Image } from 'expo-image';
import { useCallback, useState } from 'react';
import { Platform, PixelRatio } from 'react-native';
import * as FileSystem from 'expo-file-system';

// プラットフォームに応じた最適なキャッシュディレクトリを選択
const CACHE_FOLDER = `${FileSystem.cacheDirectory}image_cache/`;

// 最適化設定情報
const IMAGE_QUALITY = 0.8;  // 画像品質（0.0～1.0）
const CACHE_TIMEOUT = 7 * 24 * 60 * 60 * 1000; // 1週間キャッシュ保持

/**
 * 画像URLをキャッシュファイル名に変換する
 */
export const getImageCacheKey = (url: string): string => {
  // URLを一意のファイル名に変換（ハッシュ関数の代わり）
  const filename = url
    .replace(/[^a-zA-Z0-9]/g, '_') // 非英数字をアンダースコアに
    .replace(/__+/g, '_');         // 複数のアンダースコアを1つに
  
  return `${filename}.jpg`;
};

/**
 * 画像のキャッシュパスを取得
 */
export const getImageCachePath = (url: string): string => {
  return `${CACHE_FOLDER}${getImageCacheKey(url)}`;
};

/**
 * 画像を最適化してキャッシュディレクトリに保存する
 */
export const cacheImage = async (url: string): Promise<string> => {
  try {
    // キャッシュディレクトリの作成
    await FileSystem.makeDirectoryAsync(CACHE_FOLDER, {
      intermediates: true
    }).catch(() => {}); // ディレクトリが既に存在する場合のエラーを無視
    
    const cacheFilePath = getImageCachePath(url);
    
    // キャッシュファイルが存在するか確認
    const fileInfo = await FileSystem.getInfoAsync(cacheFilePath);
    
    // キャッシュが既に存在し、期限内なら再利用
    if (fileInfo.exists && fileInfo.modificationTime) {
      const now = Date.now();
      const fileTimestamp = fileInfo.modificationTime * 1000;
      
      if (now - fileTimestamp < CACHE_TIMEOUT) {
        console.log(`Using cached image: ${cacheFilePath}`);
        return cacheFilePath;
      }
      
      // 期限切れの場合は削除して再ダウンロード
      console.log(`Cache expired for: ${url}`);
      await FileSystem.deleteAsync(cacheFilePath);
    }
    
    // 画像をダウンロードしてキャッシュ
    console.log(`Downloading and caching image: ${url}`);
    await FileSystem.downloadAsync(url, cacheFilePath);
    
    return cacheFilePath;
  } catch (error) {
    console.error(`Error caching image ${url}:`, error);
    return url; // エラー時は元のURLを返す
  }
};

/**
 * 画像URLを解像度に応じて最適化する
 * ※CDNなどでURLベースの解像度指定に対応している場合に使用
 */
export const getOptimizedImageUrl = (url: string, width?: number, height?: number): string => {
  if (!url) return '';
  
  // 画面の解像度に基づいて最適なサイズを計算
  const screenScale = PixelRatio.get();
  const optimizedWidth = width ? Math.round(width * screenScale) : undefined;
  const optimizedHeight = height ? Math.round(height * screenScale) : undefined;
  
  // 今回はサンプルなので、そのままURLを返す
  // 実際のプロダクトでは、CDNのURLパラメータなどを使って解像度調整を行うケースが多い
  // 例: https://example.com/image.jpg?width=300&height=200&quality=80
  return url;
};

/**
 * キャッシュ期限切れの画像を削除する
 */
export const cleanImageCache = async (): Promise<void> => {
  try {
    const cacheExists = await FileSystem.getInfoAsync(CACHE_FOLDER);
    if (!cacheExists.exists) return;
    
    const files = await FileSystem.readDirectoryAsync(CACHE_FOLDER);
    const now = Date.now();
    
    for (const file of files) {
      const filePath = `${CACHE_FOLDER}${file}`;
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      
      if (fileInfo.modificationTime) {
        const fileTimestamp = fileInfo.modificationTime * 1000;
        if (now - fileTimestamp > CACHE_TIMEOUT) {
          console.log(`Removing expired cache: ${file}`);
          await FileSystem.deleteAsync(filePath);
        }
      }
    }
  } catch (error) {
    console.error('Error cleaning image cache:', error);
  }
};

/**
 * 画像プリフェッチのカスタムフック
 */
export const useImagePrefetch = () => {
  const [isPrefetching, setIsPrefetching] = useState(false);
  
  const prefetchImages = useCallback(async (urls: string[]) => {
    if (!urls || urls.length === 0) return;
    
    setIsPrefetching(true);
    
    try {
      // 最初の5枚をプリオリティ高くプリフェッチ
      const highPriorityUrls = urls.slice(0, 5);
      const prefetchPromises = highPriorityUrls.map(url => Image.prefetch(url));
      
      // 残りはバックグラウンドで順次プリフェッチ
      setTimeout(() => {
        urls.slice(5).forEach(url => {
          Image.prefetch(url).catch(e => 
            console.log(`Failed to prefetch image: ${url}`, e)
          );
        });
      }, 100);
      
      await Promise.all(prefetchPromises);
    } catch (error) {
      console.error('Error prefetching images:', error);
    } finally {
      setIsPrefetching(false);
    }
  }, []);
  
  return {
    prefetchImages,
    isPrefetching
  };
};
