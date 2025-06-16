import { Image, ImageURISource, Platform, PixelRatio, InteractionManager } from 'react-native';
import { useCallback, useState, useRef, useEffect } from 'react';
import * as FileSystem from 'expo-file-system';
import Toast from 'react-native-toast-message';

// プラットフォームに応じた最適なキャッシュディレクトリを選択
const CACHE_FOLDER = `${FileSystem.cacheDirectory}image_cache/`;

// 最適化設定情報
export const IMAGE_QUALITY = 0.8;  // 画像品質（0.0～1.0）
export const CACHE_TIMEOUT = 7 * 24 * 60 * 60 * 1000; // 1週間キャッシュ保持
export const MAX_CACHE_SIZE = 300 * 1024 * 1024; // 300MB キャッシュサイズ上限
export const LOW_MEMORY_CACHE_SIZE = 100 * 1024 * 1024; // 100MB (低メモリデバイス用)

/**
 * 画像URLをキャッシュファイル名に変換する
 */
export const getImageCacheKey = (url: string): string => {
  if (!url) return '';
  
  try {
    // URLを一意のファイル名に変換（ハッシュ関数の代わり）
    const filename = url
      .replace(/[^a-zA-Z0-9]/g, '_') // 非英数字をアンダースコアに
      .replace(/__+/g, '_')          // 複数のアンダースコアを1つに
      .slice(0, 200);                // 長すぎるファイル名を防止
    
    return `${filename}.jpg`;
  } catch (error) {
    console.error(`Error generating cache key for URL: ${url}`, error);
    // フォールバックとして単純なランダム文字列を返す
    return `fallback_${Date.now()}_${Math.random().toString(36).substring(2, 10)}.jpg`;
  }
};

/**
 * 画像のキャッシュパスを取得
 */
export const getImageCachePath = (url: string): string => {
  if (!url) return '';
  return `${CACHE_FOLDER}${getImageCacheKey(url)}`;
};

/**
 * 画像を最適化してキャッシュディレクトリに保存する
 */
export const cacheImage = async (url: string): Promise<string> => {
  if (!url) return '';
  
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
        return cacheFilePath;
      }
      
      // 期限切れの場合は削除して再ダウンロード
      await FileSystem.deleteAsync(cacheFilePath, { idempotent: true })
        .catch(e => console.log('Error deleting expired cache:', e));
    }
    
    // 画像をダウンロードしてキャッシュ（タイムアウト付き）
    const downloadOptions = {
      md5: false,
      cache: true,
      headers: {
        'Cache-Control': 'max-age=31536000',
      }
    };
    
    // 10秒のタイムアウトでダウンロード
    const downloadPromise = FileSystem.downloadAsync(url, cacheFilePath, downloadOptions);
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Download timeout')), 10000);
    });
    
    // Promise.raceでタイムアウト処理
    await Promise.race([downloadPromise, timeoutPromise]);
    
    return cacheFilePath;
  } catch (error) {
    console.error(`Error caching image ${url}:`, error);
    
    // ダウンロード失敗時は元のURLを返す
    if (__DEV__) {
      console.log(`Falling back to direct URL: ${url}`);
    }
    
    return url;
  }
};

/**
 * 画像URLから最高画質バージョンを取得する（ソース別に最適化）
 * @param url 元の画像URL
 * @param width 希望する幅（オプション）
 * @param height 希望する高さ（オプション）
 * @returns 最適化された画像URL
 */
export const getHighQualityImageUrl = (url: string, width?: number, height?: number): string => {
  if (!url) return '';
  
  try {
    // 楽天画像の最適化
    if (url.includes('rakuten.co.jp')) {
      // クエリパラメータを解析
      const hasQuery = url.includes('?');
      let optimizedUrl = url;
      
      // パスの置換（低解像度→高解像度）
      optimizedUrl = optimizedUrl
        .replace(/\/128x128\//, '/600x600/')
        .replace(/\/64x64\//, '/600x600/')
        .replace(/\/pc\//, '/600x600/')
        .replace(/\/thumbnail\//, '/600x600/');
      
      // _exパラメータの置換または追加
      if (optimizedUrl.includes('_ex=')) {
        optimizedUrl = optimizedUrl.replace(/_ex=\d+x\d+/, '_ex=640x640');
      } else if (hasQuery) {
        optimizedUrl += '&_ex=640x640';
      } else {
        optimizedUrl += '?_ex=640x640';
      }
      
      // _scパラメータ（スケーリング）の追加
      if (!optimizedUrl.includes('_sc=')) {
        optimizedUrl += (hasQuery || optimizedUrl.includes('?') ? '&' : '?') + '_sc=1';
      }
      
      return optimizedUrl;
    }
    
    // Amazonの画像最適化
    if (url.includes('amazon.com') || url.includes('amazon.co.jp')) {
      // SLxxx形式の部分を高解像度に置換
      return url.replace(/\._[^.]*_\./, '._SL1500_.');
    }
    
    // ZOZOTOWNの画像最適化
    if (url.includes('zozo.jp')) {
      // クエリパラメータを削除して高解像度パスを指定
      return url.replace(/\?.*$/, '').replace(/\/c\/\d+x\d+/, '/c/1200x1200');
    }
    
    // CDN系の画像（Cloudinary等）
    if (url.includes('cloudinary.com')) {
      return url.replace(/\/upload\//, '/upload/q_auto,f_auto,w_1200/');
    }
    
    // ImgixやThumbor系のURLパラメータ最適化
    if (url.includes('imgix.net') || url.includes('thumbor')) {
      const separator = url.includes('?') ? '&' : '?';
      return `${url}${separator}w=${width || 1200}&q=90`;
    }
    
    // その他の一般的な画像URL
    return url;
    
  } catch (error) {
    console.warn('[ImageUtils] Error optimizing image URL:', error);
    return url;
  }
};

/**
 * メモリキャッシュをクリア
 */
export const clearMemoryCache = (): void => {
  // Image APIのメモリキャッシュクリア
  if ((Image as any).clearMemoryCache) {
    (Image as any).clearMemoryCache();
  }
  console.log('Memory cache cleared');
};

/**
 * ディスクキャッシュをクリア
 * @returns 削除されたファイルサイズ（バイト）
 */
export const clearDiskCache = async (): Promise<number> => {
  try {
    const cacheDir = CACHE_FOLDER;
    const cacheInfo = await FileSystem.getInfoAsync(cacheDir);
    if (!cacheInfo.exists) return 0;

    const files = await FileSystem.readDirectoryAsync(cacheDir);
    let totalSize = 0;

    for (const file of files) {
      const filePath = `${cacheDir}${file}`;
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      
      if (fileInfo.exists && !fileInfo.isDirectory) {
        totalSize += fileInfo.size || 0;
        await FileSystem.deleteAsync(filePath, { idempotent: true });
      }
    }

    return totalSize;
  } catch (error) {
    console.error('Error clearing disk cache:', error);
    return 0;
  }
};

/**
 * 全てのキャッシュをクリア
 */
export const clearAllCache = async (): Promise<{
  memoryCleared: boolean;
  diskBytesCleared: number;
}> => {
  const memoryCleared = true;
  clearMemoryCache();
  
  const diskBytesCleared = await clearDiskCache();
  
  return {
    memoryCleared,
    diskBytesCleared,
  };
};

/**
 * 画像のプリロード
 * @param sources プリロードする画像ソースの配列
 * @returns プリロード結果
 */
export const preloadImages = async (sources: ImageURISource[]): Promise<{
  success: number;
  failed: number;
  results: boolean[];
}> => {
  const results = await Promise.allSettled(
    sources.map(source => 
      new Promise<void>((resolve, reject) => {
        Image.prefetch(source.uri!)
          .then(() => resolve())
          .catch(reject);
      })
    )
  );

  const success = results.filter(result => result.status === 'fulfilled').length;
  const failed = results.filter(result => result.status === 'rejected').length;
  const boolResults = results.map(result => result.status === 'fulfilled');

  return { success, failed, results: boolResults };
};

/**
 * キャッシュサイズを取得する
 * @returns キャッシュサイズ情報
 */
export const getCacheSize = async (): Promise<{
  totalSize: number;
  fileCount: number;
}> => {
  try {
    const cacheDir = CACHE_FOLDER;
    const cacheInfo = await FileSystem.getInfoAsync(cacheDir);
    if (!cacheInfo.exists) return { totalSize: 0, fileCount: 0 };

    const files = await FileSystem.readDirectoryAsync(cacheDir);
    let totalSize = 0;
    let fileCount = 0;

    for (const file of files) {
      const filePath = `${cacheDir}${file}`;
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      
      if (fileInfo.exists && !fileInfo.isDirectory) {
        totalSize += fileInfo.size || 0;
        fileCount++;
      }
    }

    return { totalSize, fileCount };
  } catch (error) {
    console.error('Error getting cache size:', error);
    return { totalSize: 0, fileCount: 0 };
  }
};

/**
 * メモリ使用量を取得（プラットフォーム固有）
 */
export const getMemoryUsage = (): {
  used: number;
  total: number;
  percentage: number;
} => {
  try {
    // パフォーマンス情報が利用可能な場合のみ
    if (typeof performance !== 'undefined' && (performance as any).memory) {
      const memory = (performance as any).memory;
      return {
        used: memory.usedJSHeapSize || 0,
        total: memory.totalJSHeapSize || 0,
        percentage: memory.totalJSHeapSize > 0 
          ? (memory.usedJSHeapSize / memory.totalJSHeapSize) * 100 
          : 0,
      };
    }
    
    return { used: 0, total: 0, percentage: 0 };
  } catch (error) {
    console.error('Error getting memory usage:', error);
    return { used: 0, total: 0, percentage: 0 };
  }
};

/**
 * 画像最適化設定
 */
export interface ImageOptimizationConfig {
  quality?: number; // 0.0 - 1.0
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'png' | 'webp';
}

/**
 * フォーマットされたサイズ文字列を取得
 * @param bytes バイト数
 * @returns フォーマットされた文字列
 */
export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * 画像プリフェッチのカスタムフック（FlatListなどで先読みに使用）
 */
export const useImagePrefetch = () => {
  const [isPrefetching, setIsPrefetching] = useState(false);
  const isMounted = useRef(true);
  const prefetchTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prefetchErrorCount = useRef(0);
  
  // コンポーネントのアンマウント時にクリーンアップ
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (prefetchTimeoutRef.current) {
        clearTimeout(prefetchTimeoutRef.current);
      }
    };
  }, []);
  
  const prefetchImages = useCallback(async (urls: string[], priority = false) => {
    if (!urls || urls.length === 0) return;
    
    // URLを整理（null/undefined/空文字の除去、重複排除）
    const validUrls = [...new Set(urls.filter(url => !!url))];
    if (validUrls.length === 0) return;
    
    setIsPrefetching(true);
    
    try {
      // プライオリティの高い画像（現在表示中および次に表示される可能性が高いもの）
      const highPriorityUrls = priority ? validUrls.slice(0, 5) : [];
      
      // 低プライオリティの画像（スクロールするとそのうち表示される可能性があるもの）
      const lowPriorityUrls = priority ? validUrls.slice(5) : validUrls;
      
      // 高プライオリティ画像を即時プリフェッチ
      if (highPriorityUrls.length > 0) {
        const prefetchPromises = highPriorityUrls.map(url => 
          Image.prefetch(url)
            .catch(e => {
              prefetchErrorCount.current += 1;
              console.warn(`Failed to prefetch high priority image: ${url}`, e);
              return false;
            })
        );
        
        await Promise.all(prefetchPromises);
        
        // エラーが多すぎる場合はユーザーに通知（オプション）
        if (prefetchErrorCount.current > 5 && prefetchErrorCount.current > highPriorityUrls.length / 2) {
          // ネットワーク接続の問題の可能性を示唆
          Toast?.show?.({
            type: 'info',
            text1: '画像の読み込みに問題が発生しています',
            text2: 'ネットワーク接続を確認してください',
            position: 'bottom',
            visibilityTime: 3000,
          } as any);
          prefetchErrorCount.current = 0; // カウンターリセット
        }
      }
      
      // 低プライオリティ画像を遅延プリフェッチ（UIスレッドをブロックしない）
      if (lowPriorityUrls.length > 0) {
        prefetchTimeoutRef.current = setTimeout(() => {
          InteractionManager.runAfterInteractions(() => {
            if (!isMounted.current) return;
            
            // バッチごとに処理（全てを一度に処理しない）
            const batchSize = 10;
            let currentBatch = 0;
            
            const processBatch = () => {
              if (!isMounted.current) return;
              
              const start = currentBatch * batchSize;
              const end = Math.min(start + batchSize, lowPriorityUrls.length);
              const batch = lowPriorityUrls.slice(start, end);
              
              batch.forEach(url => {
                Image.prefetch(url).catch(e => {
                  if (__DEV__) {
                    console.log(`Failed to prefetch low priority image: ${url}`, e);
                  }
                });
              });
              
              currentBatch++;
              
              // 次のバッチがある場合は遅延実行
              if (start + batchSize < lowPriorityUrls.length) {
                setTimeout(processBatch, 300);
              }
            };
            
            processBatch();
          });
        }, 200);
      }
    } catch (error) {
      console.error('Error prefetching images:', error);
    } finally {
      if (isMounted.current) {
        setIsPrefetching(false);
      }
    }
  }, []);
  
  const cancelPrefetching = useCallback(() => {
    if (prefetchTimeoutRef.current) {
      clearTimeout(prefetchTimeoutRef.current);
      prefetchTimeoutRef.current = null;
    }
    setIsPrefetching(false);
    prefetchErrorCount.current = 0;
  }, []);
  
  return {
    prefetchImages,
    cancelPrefetching,
    isPrefetching
  };
};

/**
 * 画像読み込みエラー処理のための関数
 * @param url 画像URL
 * @param onError エラーコールバック
 */
export const handleImageLoadError = (url: string, onError?: () => void) => {
  console.warn(`Image load error: ${url}`);
  
  // エラーが発生した画像のキャッシュを削除
  try {
    const cachePath = getImageCachePath(url);
    if (cachePath) {
      FileSystem.deleteAsync(cachePath, { idempotent: true })
        .catch(e => console.log('Error deleting cached image:', e));
    }
  } catch (e) {
    console.error('Error handling image load error:', e);
  }
  
  // コールバックが提供されている場合は実行
  if (onError) {
    onError();
  }
};

/**
 * キャッシュ期限切れの画像を削除する（簡易版）
 */
export const cleanImageCache = async (force = false): Promise<void> => {
  try {
    const cacheExists = await FileSystem.getInfoAsync(CACHE_FOLDER);
    if (!cacheExists.exists) {
      await FileSystem.makeDirectoryAsync(CACHE_FOLDER, { intermediates: true })
        .catch(() => {});
      return;
    }
    
    const files = await FileSystem.readDirectoryAsync(CACHE_FOLDER);
    const now = Date.now();
    let deletedCount = 0;
    
    for (const file of files) {
      const filePath = `${CACHE_FOLDER}${file}`;
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      
      if (fileInfo.exists && fileInfo.modificationTime) {
        const fileTimestamp = fileInfo.modificationTime * 1000;
        
        // 期限切れまたは強制削除の場合
        if (force || (now - fileTimestamp > CACHE_TIMEOUT)) {
          await FileSystem.deleteAsync(filePath, { idempotent: true })
            .catch(e => console.warn(`Failed to delete cache file ${file}:`, e));
          deletedCount++;
        }
      }
    }
    
    if (__DEV__) {
      console.log(`[CACHE] Cleaned up ${deletedCount} files`);
    }
  } catch (error) {
    console.error('Error cleaning image cache:', error);
  }
};

// 互換性のためのエイリアス
export const getImageCacheSize = getCacheSize;
