/**
 * 画像関連のユーティリティ関数（簡素化版）
 * 
 * 楽天の画像URLを最適化し、確実に表示できるようにする
 */

/**
 * 画像URLを最適化する統一関数
 * 楽天の画像URLの問題を修正し、高画質版を返す
 */
export const optimizeImageUrl = (url: string | undefined | null): string => {
  // デフォルトのプレースホルダー画像
  const PLACEHOLDER_IMAGE = 'https://via.placeholder.com/400x400/f0f0f0/666666?text=No+Image';
  
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
      // サムネイルドメインを通常の画像ドメインに変更
      if (optimizedUrl.includes('thumbnail.image.rakuten.co.jp')) {
        optimizedUrl = optimizedUrl.replace('thumbnail.image.rakuten.co.jp', 'image.rakuten.co.jp');
      }
      
      // パス内のサイズ指定を削除（全て一括で処理）
      optimizedUrl = optimizedUrl
        .replace(/\/128x128\//g, '/')
        .replace(/\/64x64\//g, '/')
        .replace(/\/pc\//g, '/')
        .replace(/\/thumbnail\//g, '/')
        .replace(/\/cabinet\/128x128\//g, '/cabinet/')
        .replace(/\/cabinet\/64x64\//g, '/cabinet/');
      
      // クエリパラメータのサイズ指定を削除
      if (optimizedUrl.includes('_ex=')) {
        optimizedUrl = optimizedUrl
          .replace(/_ex=128x128/g, '')
          .replace(/_ex=64x64/g, '')
          .replace(/\?$/g, '') // 末尾の?を削除
          .replace(/&$/g, ''); // 末尾の&を削除
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
 * imageUrlとimage_urlの両方に対応
 */
export const getProductImageUrl = (product: any): string => {
  const rawUrl = product?.imageUrl || product?.image_url || '';
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
