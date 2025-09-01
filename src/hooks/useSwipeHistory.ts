import { useState, useEffect, useCallback } from 'react';
import { Product } from '@/types';
import { getSwipeHistory as getSwipeHistoryService, SwipeData } from '@/services/swipeService';
import { fetchProductById } from '@/services/product';
import { useAuth } from './useAuth';

interface UseSwipeHistoryReturn {
  swipeHistory: Product[];
  loading: boolean;
  error: string | null;
  refreshing: boolean;
  getSwipeHistory: (filter?: 'yes' | 'no' | 'all') => Promise<void>;
  refreshHistory: () => Promise<void>;
}

/**
 * スワイプ履歴管理用のカスタムフック
 */
export const useSwipeHistory = (): UseSwipeHistoryReturn => {
  const { user } = useAuth();
  const [swipeHistory, setSwipeHistory] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [currentFilter, setCurrentFilter] = useState<'yes' | 'no' | 'all'>('all');

  const getSwipeHistory = useCallback(async (filter: 'yes' | 'no' | 'all' = 'all') => {
    if (!user || !user.id) {
      console.log('[useSwipeHistory] No user or user.id available, skipping swipe history fetch');
      setSwipeHistory([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setCurrentFilter(filter);

      // 'all'の場合はundefinedとして扱う（全履歴取得）
      const filterResult = filter === 'all' ? undefined : filter;
      
      // スワイプ履歴を取得
      const swipeData = await getSwipeHistoryService(user.id, filterResult);
      
      if (swipeData && swipeData.length > 0) {
        // 商品IDのリストを抽出（重複を除去）
        const uniqueProductIds = [...new Set(swipeData.map(swipe => swipe.productId))];
        
        console.log(`[useSwipeHistory] Fetching ${uniqueProductIds.length} unique products from ${swipeData.length} swipes`);
        
        // スワイプ結果のマップを作成
        const swipeResultMap = new Map<string, 'yes' | 'no'>();
        swipeData.forEach(swipe => {
          swipeResultMap.set(swipe.productId, swipe.result);
        });
        
        // 商品詳細を取得（バッチ処理）
        const batchSize = 10;
        const validProducts: Product[] = [];
        const seenIds = new Set<string>();
        
        for (let i = 0; i < uniqueProductIds.length; i += batchSize) {
          const batch = uniqueProductIds.slice(i, i + batchSize);
          const productPromises = batch.map(id => fetchProductById(id));
          
          try {
            const productResults = await Promise.all(productPromises);
            
            productResults.forEach(result => {
              if (result && 'success' in result && result.success && result.data) {
                const product = result.data;
                // IDが正しい形式で、重複していないことを確認
                if (product.id && !seenIds.has(product.id)) {
                  seenIds.add(product.id);
                  // スワイプ結果を商品データに追加
                  const productWithSwipeResult = {
                    ...product,
                    swipeResult: swipeResultMap.get(product.id) || undefined
                  };
                  validProducts.push(productWithSwipeResult);
                }
              }
            });
          } catch (batchError) {
            console.error(`[useSwipeHistory] Error fetching batch ${i / batchSize}:`, batchError);
          }
        }
        
        console.log(`[useSwipeHistory] Successfully loaded ${validProducts.length} products`);
        setSwipeHistory(validProducts);
      } else {
        setSwipeHistory([]);
      }
    } catch (error: any) {
      console.error('[useSwipeHistory] Error getting swipe history:', error);
      setError(error.message || 'スワイプ履歴の取得に失敗しました');
      setSwipeHistory([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  const refreshHistory = useCallback(async () => {
    setRefreshing(true);
    await getSwipeHistory(currentFilter);
  }, [currentFilter, getSwipeHistory]);

  // 初回ロード
  useEffect(() => {
    if (user && user.id) {
      getSwipeHistory('all');
    }
  }, [user]);

  return {
    swipeHistory,
    loading,
    error,
    refreshing,
    getSwipeHistory,
    refreshHistory
  };
};
