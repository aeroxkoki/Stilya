import { Image } from 'expo-image';
import { useCallback, useState, useRef, useEffect } from 'react';
import { Platform, PixelRatio, InteractionManager } from 'react-native';
import * as FileSystem from 'expo-file-system';

// プラットフォームに応じた最適なキャッシュディレクトリを選択
const CACHE_FOLDER = `${FileSystem.cacheDirectory}image_cache/`;

// 最適化設定情報
const IMAGE_QUALITY = 0.8;  // 画像品質（0.0～1.0）
const CACHE_TIMEOUT = 7 * 24 * 60 * 60 * 1000; // 1週間キャッシュ保持
const MAX_CACHE_SIZE = 300 * 1024 * 1024; // 300MB キャッシュサイズ上限

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
        return cacheFilePath;
      }
      
      // 期限切れの場合は削除して再ダウンロード
      await FileSystem.deleteAsync(cacheFilePath);
    }
    
    // 画像をダウンロードしてキャッシュ
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
  
  try {
    // CDNがリサイズパラメータをサポートしている場合（例: Cloudinary）
    const urlObj = new URL(url);
    
    // 一般的なCDNサービスのパターンをチェック（実際のプロダクトでは個別に調整）
    if (urlObj.hostname.includes('cloudinary.com') && optimizedWidth && optimizedHeight) {
      // Cloudinaryのリサイズパラメータ
      return url.replace('/upload/', `/upload/w_${optimizedWidth},h_${optimizedHeight},q_${IMAGE_QUALITY * 100}/`);
    } else if (urlObj.hostname.includes('imgix.net') && optimizedWidth) {
      // imgixのリサイズパラメータ
      urlObj.searchParams.append('w', optimizedWidth.toString());
      urlObj.searchParams.append('q', (IMAGE_QUALITY * 100).toString());
      return urlObj.toString();
    }
  } catch (e) {
    // URLパース失敗時はそのまま返す
  }
  
  // 対応していない場合は元のURLをそのまま返す
  return url;
};

/**
 * キャッシュサイズを取得する
 */
export const getImageCacheSize = async (): Promise<number> => {
  try {
    const cacheExists = await FileSystem.getInfoAsync(CACHE_FOLDER);
    if (!cacheExists.exists) return 0;
    
    const files = await FileSystem.readDirectoryAsync(CACHE_FOLDER);
    let totalSize = 0;
    
    for (const file of files) {
      const filePath = `${CACHE_FOLDER}${file}`;
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (fileInfo.exists && fileInfo.size) {
        totalSize += fileInfo.size;
      }
    }
    
    return totalSize;
  } catch (error) {
    console.error('Error getting cache size:', error);
    return 0;
  }
};

/**
 * キャッシュ期限切れの画像を削除する
 */
export const cleanImageCache = async (): Promise<void> => {
  try {
    // オフロードタスクとして実行（UIスレッドをブロックしない）
    InteractionManager.runAfterInteractions(async () => {
      const cacheExists = await FileSystem.getInfoAsync(CACHE_FOLDER);
      if (!cacheExists.exists) return;
      
      const files = await FileSystem.readDirectoryAsync(CACHE_FOLDER);
      const now = Date.now();
      
      // ファイル情報を収集
      const fileInfos: Array<{
        path: string;
        timestamp: number;
        size: number;
      }> = [];
      
      for (const file of files) {
        const filePath = `${CACHE_FOLDER}${file}`;
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        
        if (fileInfo.exists && fileInfo.modificationTime) {
          fileInfos.push({
            path: filePath,
            timestamp: fileInfo.modificationTime * 1000,
            size: fileInfo.size || 0
          });
        }
      }
      
      // 期限切れのファイルを削除
      const expiredFiles = fileInfos.filter(file => now - file.timestamp > CACHE_TIMEOUT);
      for (const file of expiredFiles) {
        await FileSystem.deleteAsync(file.path);
      }
      
      // キャッシュサイズが上限を超えている場合、古いファイルから削除
      const remainingFiles = fileInfos.filter(file => now - file.timestamp <= CACHE_TIMEOUT);
      const totalSize = remainingFiles.reduce((total, file) => total + file.size, 0);
      
      if (totalSize > MAX_CACHE_SIZE) {
        // 最終アクセス日時の古い順にソート
        remainingFiles.sort((a, b) => a.timestamp - b.timestamp);
        
        let sizeToFree = totalSize - MAX_CACHE_SIZE;
        for (const file of remainingFiles) {
          if (sizeToFree <= 0) break;
          await FileSystem.deleteAsync(file.path);
          sizeToFree -= file.size;
        }
      }
    });
  } catch (error) {
    console.error('Error cleaning image cache:', error);
  }
};

/**
 * 画像プリフェッチのカスタムフック（FlatListなどで先読みに使用）
 */
export const useImagePrefetch = () => {
  const [isPrefetching, setIsPrefetching] = useState(false);
  const isMounted = useRef(true);
  const prefetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
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
    
    setIsPrefetching(true);
    
    try {
      // プライオリティの高い画像（現在表示中および次に表示される可能性が高いもの）
      const highPriorityUrls = priority ? urls.slice(0, 5) : [];
      
      // 低プライオリティの画像（スクロールするとそのうち表示される可能性があるもの）
      const lowPriorityUrls = priority ? urls.slice(5) : urls;
      
      // 高プライオリティ画像を即時プリフェッチ
      if (highPriorityUrls.length > 0) {
        const prefetchPromises = highPriorityUrls.map(url => 
          Image.prefetch(url, { priority: 'high' })
        );
        await Promise.all(prefetchPromises);
      }
      
      // 低プライオリティ画像を遅延プリフェッチ（UIスレッドをブロックしない）
      if (lowPriorityUrls.length > 0) {
        prefetchTimeoutRef.current = setTimeout(() => {
          InteractionManager.runAfterInteractions(() => {
            if (!isMounted.current) return;
            
            lowPriorityUrls.forEach(url => {
              Image.prefetch(url, { priority: 'low' }).catch(e => 
                console.log(`Failed to prefetch image: ${url}`, e)
              );
            });
          });
        }, 100);
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
  }, []);
  
  return {
    prefetchImages,
    cancelPrefetching,
    isPrefetching
  };
};

/**
 * メモリキャッシュをクリアする
 */
export const clearMemoryCache = () => {
  try {
    Image.clearMemoryCache();
  } catch (e) {
    console.error('Failed to clear memory cache:', e);
  }
};
