/**
 * Supabase無料枠最適化ユーティリティ
 * 
 * 無料枠制限:
 * - ストレージ: 1GB
 * - データベース: 500MB  
 * - API呼び出し: 月2M
 * - 同時接続: 50
 */

// データベース容量の最適化設定
export const DB_OPTIMIZATION = {
  // 最大保存商品数（500MBを考慮して余裕を持たせる）
  MAX_PRODUCTS: 45000,
  // 商品ローテーション期間（日数）
  ROTATION_DAYS: 7,
  // バッチ処理サイズ
  BATCH_SIZE: 100,
  // 古い商品の削除しきい値（日数）
  OLD_PRODUCT_THRESHOLD: 14,
  // 1日あたりの推奨同期商品数
  DAILY_SYNC_LIMIT: 2000,
};

// ストレージ容量の最適化設定（将来の画像保存用）
export const STORAGE_OPTIMIZATION = {
  // 画像の最大サイズ（KB）
  MAX_IMAGE_SIZE_KB: 200,
  // サムネイルサイズ
  THUMBNAIL_SIZE: { width: 150, height: 150 },
  // キャッシュ有効期限（日数）
  CACHE_EXPIRY_DAYS: 30,
};

// API呼び出しの最適化設定
export const API_OPTIMIZATION = {
  // バッチ取得サイズ
  FETCH_BATCH_SIZE: 50,
  // API呼び出し間隔（ミリ秒）
  API_CALL_INTERVAL: 100,
  // 再試行回数
  MAX_RETRIES: 3,
  // 月間API呼び出し上限
  MONTHLY_CALL_LIMIT: 1800000, // 200万の90%で安全マージン
  // 1日あたりのAPI呼び出し目標
  DAILY_CALL_TARGET: 60000,
};

// 同時接続の最適化設定
export const CONNECTION_OPTIMIZATION = {
  // 最大同時接続数
  MAX_CONCURRENT_CONNECTIONS: 40, // 50の80%で安全マージン
  // 接続プールサイズ
  CONNECTION_POOL_SIZE: 10,
  // 接続タイムアウト（秒）
  CONNECTION_TIMEOUT: 30,
};

/**
 * 商品データのサイズを推定（バイト）
 */
export const estimateProductSize = (product: any): number => {
  const jsonString = JSON.stringify(product);
  return new TextEncoder().encode(jsonString).length;
};

/**
 * 現在のDB使用量を推定（MB）
 */
export const estimateDBUsage = (productCount: number, avgProductSizeBytes: number = 1024): number => {
  return (productCount * avgProductSizeBytes) / (1024 * 1024);
};

/**
 * 安全に追加できる商品数を計算
 */
export const calculateSafeProductLimit = (currentProductCount: number): number => {
  const remainingProducts = DB_OPTIMIZATION.MAX_PRODUCTS - currentProductCount;
  return Math.max(0, remainingProducts);
};

/**
 * API呼び出しレート制限チェック
 */
export const checkAPIRateLimit = (dailyCalls: number): boolean => {
  return dailyCalls < API_OPTIMIZATION.DAILY_CALL_TARGET;
};

/**
 * データベース容量警告レベルを取得
 */
export const getDBCapacityWarningLevel = (productCount: number): 'safe' | 'warning' | 'critical' => {
  const usagePercent = (productCount / DB_OPTIMIZATION.MAX_PRODUCTS) * 100;
  
  if (usagePercent < 60) return 'safe';
  if (usagePercent < 80) return 'warning';
  return 'critical';
};

/**
 * 推奨される同期戦略を取得
 */
export const getRecommendedSyncStrategy = (productCount: number) => {
  const warningLevel = getDBCapacityWarningLevel(productCount);
  
  switch (warningLevel) {
    case 'safe':
      return {
        dailySync: 2000,
        rotationDays: 7,
        priority: 'all_brands',
        message: '積極的に商品を追加できます',
      };
    case 'warning':
      return {
        dailySync: 1000,
        rotationDays: 5,
        priority: 'high_priority_only',
        message: '古い商品の削除を併用してください',
      };
    case 'critical':
      return {
        dailySync: 500,
        rotationDays: 3,
        priority: 'essential_only',
        message: '容量管理を優先してください',
      };
  }
};

/**
 * 画像URLの最適化（MVPレベル - 楽天URL修正のみ）
 * 楽天のサムネイルURLを高画質版に変換する
 */
export const optimizeImageUrl = (url: string): string => {
  if (!url) return '';
  
  try {
    // 楽天のサムネイルURLを高画質版に変換
    if (url.includes('thumbnail.image.rakuten.co.jp')) {
      // サムネイルドメインを通常の画像ドメインに変更
      let optimizedUrl = url.replace('thumbnail.image.rakuten.co.jp', 'image.rakuten.co.jp');
      
      // URLパス内のサイズ指定を除去
      optimizedUrl = optimizedUrl
        .replace('/128x128/', '/')
        .replace('/64x64/', '/')
        .replace('/pc/', '/')
        .replace('/thumbnail/', '/');
      
      // クエリパラメータのサイズ指定を除去
      optimizedUrl = optimizedUrl
        .replace('?_ex=128x128', '')
        .replace('?_ex=64x64', '')
        .replace('&_ex=128x128', '')
        .replace('&_ex=64x64', '');
      
      if (__DEV__) {
        console.log('[ImageOptimization] 楽天URL変換:', {
          original: url,
          optimized: optimizedUrl
        });
      }
      
      return optimizedUrl;
    }
    
    // その他のURLはそのまま返す（MVPではシンプルに）
    return url;
    
  } catch (error) {
    console.warn('[Optimization] Error optimizing image URL:', error);
    // エラーの場合は元のURLを使用
    return url;
  }
};

/**
 * バッチ処理の最適化設定を取得
 */
export const getBatchProcessingConfig = (totalItems: number) => {
  const batchSize = Math.min(DB_OPTIMIZATION.BATCH_SIZE, totalItems);
  const batchCount = Math.ceil(totalItems / batchSize);
  const processingTime = batchCount * API_OPTIMIZATION.API_CALL_INTERVAL;
  
  return {
    batchSize,
    batchCount,
    estimatedTimeMs: processingTime,
    estimatedTimeMinutes: Math.ceil(processingTime / 60000),
  };
};
