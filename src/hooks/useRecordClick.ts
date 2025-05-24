import { useState } from 'react';
import { Platform } from 'react-native';
import { recordClick } from '@/services/clickService';
import { trackProductClick } from '@/services/analyticsService';
import { Product } from '@/types';

/**
 * 商品クリックの記録とトラッキングを行うためのフック
 */
export const useRecordClick = (userId?: string) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * 商品クリックを記録する
   * - clickServiceを使ってDBにログを保存
   * - analyticsServiceを使ってイベント分析用のデータを送信
   * 
   * @param productId 商品ID
   * @param product 商品データ（オプショナル、アナリティクス用）
   */
  const recordProductClick = async (
    productId: string,
    product?: Product
  ): Promise<boolean> => {
    if (!userId) {
      console.log('Cannot record click: No user ID provided');
      return false;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      // Supabaseにクリックログを保存
      await recordClick(userId, productId);
      
      // アナリティクスにイベントを送信
      const productData = product ? {
        title: product.title,
        brand: product.brand,
        price: product.price,
        category: product.category,
        source: product.source,
      } : { id: productId };
      
      await trackProductClick(productId, {
        ...productData,
        platform: Platform.OS,
        timestamp: new Date().toISOString(),
      }, userId);
      
      setLoading(false);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Failed to record product click:', errorMessage);
      setError(`クリックの記録に失敗しました: ${errorMessage}`);
      setLoading(false);
      return false;
    }
  };
  
  return {
    recordProductClick,
    loading,
    error,
  };
};
