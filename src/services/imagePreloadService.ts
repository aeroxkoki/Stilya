/**
 * 画像プリロードサービス
 * 次に表示される商品画像を事前に読み込むことで、UXを改善
 */

import { Image } from 'expo-image';
import { Product } from '@/types';
import { getProductImageUrl } from '@/utils/imageUtils';

class ImagePreloadService {
  private preloadedUrls: Set<string> = new Set();
  private preloadQueue: string[] = [];
  private isPreloading = false;
  private maxCacheSize = 20; // 最大キャッシュ数

  /**
   * 商品リストの画像をプリロード
   * @param products プリロードする商品リスト
   * @param startIndex 開始インデックス
   * @param count プリロード数
   */
  async preloadProductImages(
    products: Product[],
    startIndex: number = 0,
    count: number = 5
  ): Promise<void> {
    if (!products || products.length === 0) return;

    // プリロードする画像URLを取得
    const urls: string[] = [];
    const endIndex = Math.min(startIndex + count, products.length);
    
    for (let i = startIndex; i < endIndex; i++) {
      const url = getProductImageUrl(products[i]);
      if (url && !this.preloadedUrls.has(url)) {
        urls.push(url);
      }
    }

    if (urls.length === 0) return;

    // キューに追加
    this.preloadQueue.push(...urls);
    
    // プリロード処理を開始
    if (!this.isPreloading) {
      await this.processPreloadQueue();
    }
  }

  /**
   * プリロードキューを処理
   */
  private async processPreloadQueue(): Promise<void> {
    if (this.preloadQueue.length === 0) {
      this.isPreloading = false;
      return;
    }

    this.isPreloading = true;

    while (this.preloadQueue.length > 0) {
      const url = this.preloadQueue.shift();
      if (!url || this.preloadedUrls.has(url)) continue;

      try {
        // expo-imageのプリロード機能を使用
        await Image.prefetch(url);
        
        // プリロード済みURLを記録
        this.preloadedUrls.add(url);
        
        // キャッシュサイズ制限
        if (this.preloadedUrls.size > this.maxCacheSize) {
          const oldestUrls = Array.from(this.preloadedUrls).slice(0, 5);
          oldestUrls.forEach(oldUrl => this.preloadedUrls.delete(oldUrl));
        }
        
        if (__DEV__) {
          console.log(`[ImagePreloadService] Preloaded: ${url.substring(0, 50)}...`);
        }
      } catch (error) {
        if (__DEV__) {
          console.warn(`[ImagePreloadService] Failed to preload: ${url}`, error);
        }
      }
      
      // 次のプリロードまで少し待機（ネットワーク負荷軽減）
      await new Promise(resolve => setTimeout(resolve, 30));
    }

    this.isPreloading = false;
  }

  /**
   * 単一画像のプリロード
   */
  async preloadImage(url: string): Promise<void> {
    if (!url || this.preloadedUrls.has(url)) return;

    try {
      await Image.prefetch(url);
      this.preloadedUrls.add(url);
    } catch (error) {
      if (__DEV__) {
        console.warn(`[ImagePreloadService] Failed to preload single image: ${url}`, error);
      }
    }
  }

  /**
   * キャッシュをクリア
   */
  clearCache(): void {
    this.preloadedUrls.clear();
    this.preloadQueue = [];
    
    // expo-imageのキャッシュもクリア
    Image.clearMemoryCache();
    
    if (__DEV__) {
      console.log('[ImagePreloadService] Cache cleared');
    }
  }

  /**
   * プリロード済みかチェック
   */
  isPreloaded(url: string): boolean {
    return this.preloadedUrls.has(url);
  }
}

// シングルトンインスタンス
export const imagePreloadService = new ImagePreloadService();
