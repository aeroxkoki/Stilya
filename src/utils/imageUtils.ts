/**
 * 画像関連のユーティリティ関数（簡素化版）
 * 
 * 楽天の画像URLを最適化し、確実に表示できるようにする
 */

import { useCallback, useRef } from 'react';
import { Image } from 'react-native';

/**
 * 画像URLを最適化する統一関数
 * 楽天の画像URLの問題を修正し、高画質版を返す
 */
export const optimizeImageUrl = (url: string | undefined | null): string => {
  // デフォルトのプレースホルダー画像（Picsum Photos - 最高画質）
  const PLACEHOLDER_IMAGE = 'https://picsum.photos/800/800?grayscale';
  
  // URLが存在しない場合はプレースホルダーを返す
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return PLACEHOLDER_IMAGE;
  }
  
  let optimizedUrl = url.trim();
  
  try {
    // 1. HTTPをHTTPSに変換（必須）
    if (optimizedUrl.startsWith('http://')) {
      optimizedUrl = optimizedUrl.replace('http://', 'https://');
    }
    
    // 2. 楽天の画像URLの場合の最適化
    if (optimizedUrl.includes('rakuten.co.jp')) {
      // 重要: image.rakuten.co.jpは外部アクセスを制限しているため、
      // サムネイルURLをそのまま使用する（変換しない）
      
      // HTTPSへの変換は維持
      if (optimizedUrl.startsWith('http://')) {
        optimizedUrl = optimizedUrl.replace('http://', 'https://');
      }
      
      // 高画質サイズパラメータを設定（最高画質）
      if (optimizedUrl.includes('thumbnail.image.rakuten.co.jp') && optimizedUrl.includes('_ex=')) {
        // 既存のサイズパラメータを800x800に変更（最高画質）
        optimizedUrl = optimizedUrl.replace(/_ex=\d+x\d+/g, '_ex=800x800');
      } else if (optimizedUrl.includes('thumbnail.image.rakuten.co.jp') && !optimizedUrl.includes('_ex=')) {
        // サイズパラメータがない場合は追加
        optimizedUrl += optimizedUrl.includes('?') ? '&_ex=800x800' : '?_ex=800x800';
      }
    }
    
    // 3. 最終的なURL検証
    new URL(optimizedUrl); // URLとして有効かチェック
    
    return optimizedUrl;
    
  } catch (error) {
    // URLとして無効な場合はプレースホルダーを返す
    console.warn('[ImageUtils] Invalid URL:', url, error);
    return PLACEHOLDER_IMAGE;
  }
};

/**
 * 商品データから画像URLを取得する統一関数
 * Product型のimageUrlフィールドを使用
 */
export const getProductImageUrl = (product: any): string => {
  const rawUrl = product?.imageUrl || '';
  return optimizeImageUrl(rawUrl);
};

/**
 * 画像URLが有効かどうかの簡易チェック
 */
export const isValidImageUrl = (url: string): boolean => {
  if (!url || typeof url !== 'string') return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

// 互換性のためのエイリアス
export const getHighQualityImageUrl = optimizeImageUrl;

/**
 * 画像のプリフェッチ（事前読み込み）を管理するカスタムフック
 */
export const useImagePrefetch = () => {
  const prefetchedUrls = useRef<Set<string>>(new Set());
  const prefetchQueue = useRef<Promise<any>[]>([]);
  
  /**
   * 画像URLの配列をプリフェッチする
   * @param urls プリフェッチするURL配列
   * @param isHighPriority 高優先度でプリフェッチするかどうか
   */
  const prefetchImages = useCallback(async (urls: string[], isHighPriority: boolean = false) => {
    // 重複を避けるため、まだプリフェッチされていないURLのみをフィルタリング
    const urlsToPreload = urls.filter(url => {
      const optimizedUrl = optimizeImageUrl(url);
      return optimizedUrl && !prefetchedUrls.current.has(optimizedUrl);
    });
    
    if (urlsToPreload.length === 0) {
      return;
    }
    
    console.log(`[ImagePrefetch] Prefetching ${urlsToPreload.length} images (high priority: ${isHighPriority})`);
    
    try {
      // 各URLを最適化してプリフェッチ
      const promises = urlsToPreload.map(url => {
        const optimizedUrl = optimizeImageUrl(url);
        
        // URLを記録
        prefetchedUrls.current.add(optimizedUrl);
        
        // React Nativeの画像プリフェッチAPI を使用
        return Image.prefetch(optimizedUrl)
          .then(() => {
            console.log('[ImagePrefetch] Successfully prefetched:', optimizedUrl);
          })
          .catch(error => {
            console.warn('[ImagePrefetch] Failed to prefetch:', optimizedUrl, error);
            // 失敗したURLは記録から削除
            prefetchedUrls.current.delete(optimizedUrl);
          });
      });
      
      if (isHighPriority) {
        // 高優先度の場合は全て完了を待つ
        await Promise.all(promises);
      } else {
        // 低優先度の場合はキューに追加
        prefetchQueue.current.push(...promises);
        
        // バックグラウンドで実行
        Promise.all(promises).then(() => {
          // 完了したプロミスをキューから削除
          promises.forEach(p => {
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
   * プリフェッチキューをクリアする
   */
  const clearPrefetchQueue = useCallback(() => {
    prefetchQueue.current = [];
    prefetchedUrls.current.clear();
    console.log('[ImagePrefetch] Cleared prefetch queue and cache');
  }, []);
  
  return {
    prefetchImages,
    clearPrefetchQueue,
    prefetchedCount: prefetchedUrls.current.size
  };
};
