import { Image } from 'expo-image';
import { useCallback, useState, useRef, useEffect } from 'react';
import { Platform, PixelRatio, InteractionManager } from 'react-native';
import * as FileSystem from 'expo-file-system';
import Toast from 'react-native-toast-message';

// プラットフォームに応じた最適なキャッシュディレクトリを選択
const CACHE_FOLDER = `${FileSystem.cacheDirectory}image_cache/`;

// 最適化設定情報
const IMAGE_QUALITY = 0.8;  // 画像品質（0.0～1.0）
const CACHE_TIMEOUT = 7 * 24 * 60 * 60 * 1000; // 1週間キャッシュ保持
const MAX_CACHE_SIZE = 300 * 1024 * 1024; // 300MB キャッシュサイズ上限
const LOW_MEMORY_CACHE_SIZE = 100 * 1024 * 1024; // 100MB (低メモリデバイス用)

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
    // URLパース
    const urlObj = new URL(url);
    
    // CDNサービスのパターンをチェック
    if (urlObj.hostname.includes('cloudinary.com') && optimizedWidth && optimizedHeight) {
      // Cloudinaryのリサイズパラメータ
      return url.replace('/upload/', `/upload/w_${optimizedWidth},h_${optimizedHeight},q_${IMAGE_QUALITY * 100}/`);
    } else if (urlObj.hostname.includes('imgix.net') && optimizedWidth) {
      // imgixのリサイズパラメータ
      urlObj.searchParams.append('w', optimizedWidth.toString());
      urlObj.searchParams.append('q', (IMAGE_QUALITY * 100).toString());
      return urlObj.toString();
    } else if (urlObj.hostname.includes('images.rakuten.co.jp') && optimizedWidth) {
      // 楽天画像APIのリサイズパラメータ
      if (url.includes('?')) {
        return `${url}&ex=${optimizedWidth}x0`;
      } else {
        return `${url}?ex=${optimizedWidth}x0`;
      }
    } else if (urlObj.hostname.includes('images-amazon.com') && optimizedWidth) {
      // Amazon画像のリサイズパラメータ
      return url.replace(/\._[^.]*_\./, `._SL${optimizedWidth}_AC_`);
    }
  } catch (e) {
    // URLパース失敗時はそのまま返す
    if (__DEV__) {
      console.warn(`Error optimizing URL ${url}:`, e);
    }
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
    
    // バッチサイズごとに処理（メモリ使用量を抑制）
    const BATCH_SIZE = 20;
    for (let i = 0; i < files.length; i += BATCH_SIZE) {
      const batch = files.slice(i, i + BATCH_SIZE);
      
      // 並列処理でパフォーマンス改善
      const sizePromises = batch.map(async (file) => {
        const filePath = `${CACHE_FOLDER}${file}`;
        const fileInfo = await FileSystem.getInfoAsync(filePath);
        return fileInfo.exists && fileInfo.size ? fileInfo.size : 0;
      });
      
      const sizes = await Promise.all(sizePromises);
      totalSize += sizes.reduce((sum, size) => sum + size, 0);
      
      // バッチ間でUIスレッドをブロックしないようにする
      if (i + BATCH_SIZE < files.length) {
        await new Promise(resolve => setTimeout(resolve, 0));
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
export const cleanImageCache = async (force = false): Promise<void> => {
  try {
    // オフロードタスクとして実行（UIスレッドをブロックしない）
    InteractionManager.runAfterInteractions(async () => {
      const cacheExists = await FileSystem.getInfoAsync(CACHE_FOLDER);
      if (!cacheExists.exists) {
        await FileSystem.makeDirectoryAsync(CACHE_FOLDER, { intermediates: true })
          .catch(() => {});
        return;
      }
      
      const files = await FileSystem.readDirectoryAsync(CACHE_FOLDER);
      const now = Date.now();
      
      if (files.length === 0) return;
      
      // ファイル情報を段階的に収集してメモリ使用量を抑制
      let fileInfos: Array<{
        path: string;
        timestamp: number;
        size: number;
      }> = [];
      
      // バッチサイズごとに処理
      const BATCH_SIZE = 20;
      for (let i = 0; i < files.length; i += BATCH_SIZE) {
        const batch = files.slice(i, i + BATCH_SIZE);
        
        // 並列処理
        const batchInfos = await Promise.all(
          batch.map(async (file) => {
            const filePath = `${CACHE_FOLDER}${file}`;
            const fileInfo = await FileSystem.getInfoAsync(filePath);
            
            if (fileInfo.exists && fileInfo.modificationTime) {
              return {
                path: filePath,
                timestamp: fileInfo.modificationTime * 1000,
                size: fileInfo.size || 0
              };
            }
            return null;
          })
        );
        
        // null以外の結果をfileInfosに追加
        fileInfos = fileInfos.concat(batchInfos.filter(Boolean) as any);
        
        // バッチ間でUIスレッドをブロックしないようにする
        if (i + BATCH_SIZE < files.length) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
      
      // 期限切れのファイルまたは強制クリーンアップの場合は全ファイルを対象
      const filesToDelete = force 
        ? fileInfos 
        : fileInfos.filter(file => now - file.timestamp > CACHE_TIMEOUT);
      
      // 削除処理もバッチで行う
      for (let i = 0; i < filesToDelete.length; i += BATCH_SIZE) {
        const deleteBatch = filesToDelete.slice(i, i + BATCH_SIZE);
        
        await Promise.all(
          deleteBatch.map(file => 
            FileSystem.deleteAsync(file.path, { idempotent: true }).catch(e => 
              console.warn(`Failed to delete cache file ${file.path}:`, e)
            )
          )
        );
        
        // バッチ間で処理を中断しないようにする
        if (i + BATCH_SIZE < filesToDelete.length) {
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
      
      // 期限内のファイルのみを残す
      const remainingFiles = force 
        ? [] 
        : fileInfos.filter(file => now - file.timestamp <= CACHE_TIMEOUT);
      
      // キャッシュサイズが上限を超えている場合、古いファイルから削除
      const totalSize = remainingFiles.reduce((total, file) => total + file.size, 0);
      const cacheLimit = await isLowMemoryDevice() ? LOW_MEMORY_CACHE_SIZE : MAX_CACHE_SIZE;
      
      if (totalSize > cacheLimit) {
        // 最終アクセス日時の古い順にソート
        remainingFiles.sort((a, b) => a.timestamp - b.timestamp);
        
        let sizeToFree = totalSize - cacheLimit;
        for (const file of remainingFiles) {
          if (sizeToFree <= 0) break;
          
          await FileSystem.deleteAsync(file.path, { idempotent: true })
            .catch(e => console.warn(`Failed to delete cache file ${file.path}:`, e));
          
          sizeToFree -= file.size;
          
          // 処理が長時間になる場合はタイムスライシング
          await new Promise(resolve => setTimeout(resolve, 0));
        }
      }
      
      if (__DEV__) {
        console.log(`[CACHE] Cleaned up ${filesToDelete.length} files, ${remainingFiles.length} remaining`);
      }
    });
  } catch (error) {
    console.error('Error cleaning image cache:', error);
  }
};

/**
 * ローメモリデバイスの判定
 */
const isLowMemoryDevice = async (): Promise<boolean> => {
  // 動的インポートでモジュール循環参照を回避
  const { isLowEndDevice } = await import('./performance/memory');
  return await isLowEndDevice();
};

/**
 * 画像プリフェッチのカスタムフック（FlatListなどで先読みに使用）
 */
export const useImagePrefetch = () => {
  const [isPrefetching, setIsPrefetching] = useState(false);
  const isMounted = useRef(true);
  const prefetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
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
          Toast?.show?.(({
            type: 'info',
            text1: '画像の読み込みに問題が発生しています',
            text2: 'ネットワーク接続を確認してください',
            position: 'bottom',
            visibilityTime: 3000,
          }) as any);
          prefetchErrorCount.current = 0; // カウンターリセット
        }
      }
      
      // 低プライオリティ画像を遅延プリフェッチ（UIスレッドをブロックしない）
      if (lowPriorityUrls.length > 0) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
 * メモリキャッシュをクリアする
 */
export const clearMemoryCache = () => {
  try {
    Image.clearMemoryCache();
  } catch (e) {
    console.error('Failed to clear memory cache:', e);
  }
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
