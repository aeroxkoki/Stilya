import { optimizeImageUrl } from './supabaseOptimization';

/**
 * 画像URLから最高画質バージョンを取得する（MVPレベル - シンプル実装）
 * @param url 元の画像URL
 * @param width 希望する幅（オプション）- MVPでは使用しない
 * @param height 希望する高さ（オプション）- MVPでは使用しない
 * @returns 最適化された画像URL
 */
export const getHighQualityImageUrl = (url: string, width?: number, height?: number): string => {
  if (!url) return '';
  
  // 無効なURLの場合は元のURLを返す
  try {
    new URL(url);
  } catch {
    return url;
  }
  
  // supabaseOptimization.tsのoptimizeImageUrlを使用して統一
  return optimizeImageUrl(url);
};

// MVPでは以下の機能は無効化（将来の拡張用にエクスポートのみ提供）
// 実装は空にして、エラーを防ぐ

export const clearMemoryCache = (): void => {
  console.log('[MVP] Memory cache clearing is disabled');
};

export const clearDiskCache = async (): Promise<number> => {
  console.log('[MVP] Disk cache clearing is disabled');
  return 0;
};

export const clearAllCache = async (): Promise<{ memoryCleared: boolean; diskBytesCleared: number; }> => {
  console.log('[MVP] Cache clearing is disabled');
  return { memoryCleared: false, diskBytesCleared: 0 };
};

export const preloadImages = async (sources: any[]): Promise<any> => {
  console.log('[MVP] Image preloading is disabled');
  return { success: 0, failed: 0, results: [] };
};

export const getCacheSize = async (): Promise<{ totalSize: number; fileCount: number; }> => {
  console.log('[MVP] Cache size check is disabled');
  return { totalSize: 0, fileCount: 0 };
};

export const getMemoryUsage = (): { used: number; total: number; percentage: number; } => {
  return { used: 0, total: 0, percentage: 0 };
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const useImagePrefetch = () => {
  return {
    prefetchImages: async () => {},
    cancelPrefetching: () => {},
    isPrefetching: false
  };
};

export const handleImageLoadError = (url: string, onError?: () => void) => {
  console.warn(`[MVP] Image load error: ${url}`);
  if (onError) onError();
};

export const cleanImageCache = async (force = false): Promise<void> => {
  console.log('[MVP] Image cache cleaning is disabled');
};

// エイリアス（互換性のため）
export const getImageCacheSize = getCacheSize;

// MVPでは使用しない定数（互換性のため）
export const IMAGE_QUALITY = 0.8;
export const CACHE_TIMEOUT = 7 * 24 * 60 * 60 * 1000;
export const MAX_CACHE_SIZE = 300 * 1024 * 1024;
export const LOW_MEMORY_CACHE_SIZE = 100 * 1024 * 1024;

// インターフェース（互換性のため）
export interface ImageOptimizationConfig {
  quality?: number;
  maxWidth?: number;
  maxHeight?: number;
  format?: 'jpeg' | 'png' | 'webp';
}
