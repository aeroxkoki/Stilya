/**
 * 画像関連のユーティリティ関数（改善版）
 * 
 * 楽天の画像URLを最適化し、確実に表示できるようにする
 */

import { useCallback, useRef } from 'react';
import { Image } from 'react-native';

// デフォルトのプレースホルダー画像URLリスト
const PLACEHOLDER_IMAGES = [
  'https://via.placeholder.com/800x800/f5f5f5/cccccc?text=No+Image',
  'https://picsum.photos/800/800?grayscale',
  'https://placehold.co/800x800/e5e7eb/9ca3af?text=Loading'
];

/**
 * 画像URLを最適化する統一関数
 * 楽天の画像URLの問題を修正し、高画質版を返す
 */
export const optimizeImageUrl = (url: string | undefined | null): string => {
  // URLが存在しない場合はプレースホルダーを返す
  if (!url || typeof url !== 'string' || url.trim() === '') {
    console.log('[ImageUtils] Invalid URL, returning placeholder');
    return PLACEHOLDER_IMAGES[0];
  }
  
  let optimizedUrl = url.trim();
  
  try {
    // 1. HTTPをHTTPSに変換（必須）
    if (optimizedUrl.startsWith('http://')) {
      optimizedUrl = optimizedUrl.replace('http://', 'https://');
      console.log('[ImageUtils] Converted HTTP to HTTPS');
    }
    
    // 2. 楽天の画像URLの場合の最適化
    if (optimizedUrl.includes('rakuten.co.jp')) {
      console.log('[ImageUtils] Processing Rakuten image URL');
      
      // 楽天のCDN URLパターンの処理
      // thumbnail.image.rakuten.co.jp の場合
      if (optimizedUrl.includes('thumbnail.image.rakuten.co.jp')) {
        // 既存のパラメータをチェック
        if (optimizedUrl.includes('?_ex=')) {
          // すでに_exパラメータがある場合はそのまま使用
          console.log('[ImageUtils] Using existing _ex parameter');
        } else if (optimizedUrl.includes('?')) {
          // 他のパラメータがある場合は_exを追加
          optimizedUrl = optimizedUrl + '&_ex=800x800';
          console.log('[ImageUtils] Added _ex parameter to existing query');
        } else {
          // パラメータがない場合は新規追加
          optimizedUrl = optimizedUrl + '?_ex=800x800';
          console.log('[ImageUtils] Added new _ex parameter');
        }
      }
      // shop.r10s.jpやimage.rakuten.co.jp の場合
      else if (optimizedUrl.includes('shop.r10s.jp') || optimizedUrl.includes('image.rakuten.co.jp')) {
        // これらのドメインは通常そのまま使える
        console.log('[ImageUtils] Rakuten shop/image URL - using as is');
      }
      
      // 楽天の画像URLパターンによる追加の最適化
      // PC=...の古いパラメータを_ex=...に変換
      if (optimizedUrl.includes('PC=')) {
        optimizedUrl = optimizedUrl.replace(/PC=[^&]+/, '_ex=800x800');
        console.log('[ImageUtils] Converted PC parameter to _ex');
      }
    }
    
    // 3. 最終的なURL検証
    const urlObj = new URL(optimizedUrl);
    
    // HTTPSでない場合は強制的にHTTPSに
    if (urlObj.protocol !== 'https:') {
      urlObj.protocol = 'https:';
      optimizedUrl = urlObj.toString();
      console.log('[ImageUtils] Forced HTTPS protocol');
    }
    
    // 特殊文字のエンコード（楽天URLの場合はスキップ）
    if (!optimizedUrl.includes('rakuten.co.jp')) {
      optimizedUrl = encodeURI(decodeURI(optimizedUrl));
    }
    
    console.log('[ImageUtils] Optimized URL:', {
      original: url.substring(0, 100),
      optimized: optimizedUrl.substring(0, 100),
      changed: url !== optimizedUrl
    });
    
    return optimizedUrl;
    
  } catch (error) {
    // URLとして無効な場合はプレースホルダーを返す
    console.warn('[ImageUtils] Error optimizing URL:', {
      url: url.substring(0, 100),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    return PLACEHOLDER_IMAGES[0];
  }
};

/**
 * 商品データから画像URLを取得する統一関数
 * Product型のimageUrlフィールドを使用
 */
export const getProductImageUrl = (product: any): string => {
  // 複数の画像フィールドをチェック（優先順位付き）
  const rawUrl = product?.imageUrl || 
                 product?.image_url || 
                 product?.image || 
                 product?.thumbnail || 
                 '';
  
  if (__DEV__ && !rawUrl) {
    console.warn('[ImageUtils] No image URL found in product:', {
      productId: product?.id,
      productTitle: product?.title?.substring(0, 50),
      availableFields: Object.keys(product || {})
    });
  }
  
  return optimizeImageUrl(rawUrl);
};

/**
 * 画像URLが有効かどうかの詳細チェック
 */
export const isValidImageUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    // HTTPSかつ、適切な画像拡張子またはimage.rakuten.co.jpドメインの場合
    const isHttps = urlObj.protocol === 'https:';
    const hasImageExtension = /\.(jpg|jpeg|png|gif|webp|svg)/i.test(urlObj.pathname);
    const isRakutenImage = urlObj.hostname.includes('rakuten.co.jp');
    const isPlaceholder = urlObj.hostname.includes('placeholder') || 
                          urlObj.hostname.includes('picsum') ||
                          urlObj.hostname.includes('placehold');
    
    return isHttps && (hasImageExtension || isRakutenImage || isPlaceholder);
  } catch {
    return false;
  }
};

/**
 * フォールバック画像URLを取得
 */
export const getFallbackImageUrl = (index: number = 0): string => {
  return PLACEHOLDER_IMAGES[index % PLACEHOLDER_IMAGES.length];
};

// 互換性のためのエイリアス
export const getHighQualityImageUrl = optimizeImageUrl;

/**
 * 画像のプリフェッチ（事前読み込み）を管理するカスタムフック
 */
export const useImagePrefetch = () => {
  const prefetchedUrls = useRef<Set<string>>(new Set());
  const prefetchQueue = useRef<Promise<any>[]>([]);
  const failedUrls = useRef<Set<string>>(new Set());
  
  /**
   * 画像URLの配列をプリフェッチする
   * @param urls プリフェッチするURL配列
   * @param isHighPriority 高優先度でプリフェッチするかどうか
   * @param parallel 並列実行数（デフォルト: 3）
   */
  const prefetchImages = useCallback(async (urls: string[], isHighPriority: boolean = false, parallel: number = 3) => {
    // 重複を避けるため、まだプリフェッチされていないURLのみをフィルタリング
    const urlsToPreload = urls.filter(url => {
      const optimizedUrl = optimizeImageUrl(url);
      return optimizedUrl && 
             !prefetchedUrls.current.has(optimizedUrl) && 
             !failedUrls.current.has(optimizedUrl);
    });
    
    if (urlsToPreload.length === 0) {
      return;
    }
    
    console.log(`[ImagePrefetch] Prefetching ${urlsToPreload.length} images (high priority: ${isHighPriority})`);
    
    try {
      // 並列実行で効率的にプリフェッチ
      const prefetchBatch = async (batchUrls: string[]) => {
        const promises = batchUrls.map(url => {
          const optimizedUrl = optimizeImageUrl(url);
          
          // URLを記録
          prefetchedUrls.current.add(optimizedUrl);
          
          // React Nativeの画像プリフェッチAPI を使用
          return Image.prefetch(optimizedUrl)
            .then(() => {
              console.log('[ImagePrefetch] Successfully prefetched:', optimizedUrl.substring(0, 100));
              return true;
            })
            .catch(error => {
              console.warn('[ImagePrefetch] Failed to prefetch:', {
                url: optimizedUrl.substring(0, 100),
                error: error?.message || 'Unknown error'
              });
              // 失敗したURLは記録から削除して失敗リストに追加
              prefetchedUrls.current.delete(optimizedUrl);
              failedUrls.current.add(optimizedUrl);
              return false;
            });
        });
        return Promise.all(promises);
      };
      
      // バッチに分割して実行
      const batches = [];
      for (let i = 0; i < urlsToPreload.length; i += parallel) {
        batches.push(urlsToPreload.slice(i, i + parallel));
      }
      
      const allPromises = [];
      
      if (isHighPriority) {
        // 高優先度の場合はバッチを順次実行
        for (const batch of batches) {
          const results = await prefetchBatch(batch);
          allPromises.push(...results);
        }
        const successCount = allPromises.filter(r => r).length;
        console.log(`[ImagePrefetch] High priority prefetch complete: ${successCount}/${urlsToPreload.length} succeeded`);
      } else {
        // 低優先度の場合は非同期で並列実行
        batches.forEach(batch => {
          const batchPromise = prefetchBatch(batch).then((results) => {
            const successCount = results.filter(r => r).length;
            console.log(`[ImagePrefetch] Background batch complete: ${successCount}/${batch.length} succeeded`);
            return results;
          });
          prefetchQueue.current.push(batchPromise);
          allPromises.push(batchPromise);
        });
        
        // バックグラウンドで実行
        Promise.all(allPromises).then(() => {
          // 完了したプロミスをキューから削除
          allPromises.forEach(p => {
            const index = prefetchQueue.current.indexOf(p);
            if (index > -1) {
              prefetchQueue.current.splice(index, 1);
            }
          });
        });
      }
    } catch (error) {
      console.error('[ImagePrefetch] Error during prefetch:', error);
    }
  }, []);
  
  /**
   * 失敗したURLを再試行
   */
  const retryFailedUrls = useCallback(async () => {
    const failedUrlArray = Array.from(failedUrls.current);
    failedUrls.current.clear();
    
    if (failedUrlArray.length > 0) {
      console.log(`[ImagePrefetch] Retrying ${failedUrlArray.length} failed URLs`);
      await prefetchImages(failedUrlArray, false);
    }
  }, [prefetchImages]);
  
  /**
   * プリフェッチキューをクリアする
   */
  const clearPrefetchQueue = useCallback(() => {
    prefetchQueue.current = [];
    prefetchedUrls.current.clear();
    failedUrls.current.clear();
    console.log('[ImagePrefetch] Cleared prefetch queue and cache');
  }, []);
  
  return {
    prefetchImages,
    retryFailedUrls,
    clearPrefetchQueue,
    prefetchedCount: prefetchedUrls.current.size,
    failedCount: failedUrls.current.size
  };
};
