import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchScoredProducts, fetchSeasonalProducts, fetchProductsInPriceRange } from '@/services/productService';
import { Product } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { getSwipeHistory } from '@/services/swipeService';
import { recordSwipe } from '@/services/swipeService';
import { useImagePrefetch } from '@/utils/imageUtils';
import { InteractionManager } from 'react-native';

/**
 * Phase 2: スコアリングシステムを使用した商品取得フック
 * パーソナライズ、季節性、価格帯最適化に対応
 */

interface UsePersonalizedProductsOptions {
  mode?: 'default' | 'seasonal' | 'price' | 'all';
  priceFlexibility?: number;
}

interface UsePersonalizedProductsReturn {
  products: Product[];
  currentIndex: number;
  currentProduct: Product | undefined;
  isLoading: boolean;
  error: string | null;
  loadMore: (reset?: boolean) => Promise<void>;
  resetProducts: () => void;
  refreshProducts: () => Promise<void>;
  handleSwipe: (product: Product, direction: 'left' | 'right') => void;
  hasMore: boolean;
  totalFetched: number;
  scoringMode: string;
}

export const usePersonalizedProducts = (
  options: UsePersonalizedProductsOptions = {}
): UsePersonalizedProductsReturn => {
  const { mode = 'default', priceFlexibility = 1.2 } = options;
  const { user, isInitialized } = useAuth();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [totalFetched, setTotalFetched] = useState(0);
  
  const pageSize = 20;
  const { prefetchImages } = useImagePrefetch();
  const loadingRef = useRef(false);
  const swipedProductsRef = useRef<Set<string>>(new Set());
  
  // 現在表示中の商品
  const currentProduct = products[currentIndex];
  
  // スワイプ履歴を取得
  useEffect(() => {
    const fetchSwipeHistory = async () => {
      if (!user) return;
      
      try {
        const swipeHistory = await getSwipeHistory(user.id);
        const swipedIds = new Set(swipeHistory.map(swipe => swipe.productId));
        swipedProductsRef.current = swipedIds;
        
        // 10件以上スワイプしている場合は、高度な推薦を使用
        if (swipeHistory.length >= 10) {
          console.log('[usePersonalizedProducts] User has sufficient swipe history for personalization');
        }
      } catch (err) {
        console.error('Error fetching swipe history:', err);
      }
    };
    
    fetchSwipeHistory();
  }, [user]);
  
  // 商品データを取得
  const loadProducts = useCallback(async (reset = false) => {
    if (loadingRef.current && !reset) return;
    if (!user) return;
    
    loadingRef.current = true;
    
    try {
      if (reset) {
        setIsLoading(true);
        setCurrentIndex(0);
        setPage(0);
        setProducts([]);
        setHasMore(true);
        setTotalFetched(0);
        setError(null);
        swipedProductsRef.current.clear();
      } else if (!hasMore) {
        loadingRef.current = false;
        return;
      }
      
      // 現在のページを計算
      const currentPage = reset ? 0 : page;
      const offset = currentPage * pageSize;
      
      console.log(`[usePersonalizedProducts] Loading products - mode: ${mode}, page: ${currentPage}`);
      
      let response;
      
      // モードに応じて適切な関数を呼び出す
      switch (mode) {
        case 'seasonal':
          response = await fetchSeasonalProducts(user.id, pageSize, offset);
          break;
        case 'price':
          response = await fetchProductsInPriceRange(user.id, pageSize, offset);
          break;
        case 'all':
          response = await fetchScoredProducts(user.id, pageSize, offset, {
            enableSeasonalFilter: true,
            enablePriceFilter: true,
            priceFlexibility
          });
          break;
        default:
          response = await fetchScoredProducts(user.id, pageSize, offset);
      }
      
      if (!response?.success) {
        setError(response?.error || '商品データの取得に失敗しました');
        loadingRef.current = false;
        return;
      }
      
      const newProducts = response.data || [];
      console.log(`[usePersonalizedProducts] Fetched ${newProducts.length} products`);
      
      // スワイプ済みの商品を除外
      const filteredProducts = newProducts.filter(
        product => !swipedProductsRef.current.has(product.id)
      );
      
      console.log(`[usePersonalizedProducts] After filtering: ${filteredProducts.length} products`);
      
      // 結果が少ない場合は次のページを試みる
      if (filteredProducts.length === 0 && newProducts.length > 0) {
        console.log('[usePersonalizedProducts] All products were swiped, trying next page...');
        setPage(prevPage => prevPage + 1);
        loadingRef.current = false;
        if (!reset) {
          setTimeout(() => loadProducts(false), 100);
        }
        return;
      }
      
      // 商品データを更新
      if (reset) {
        setProducts(filteredProducts);
      } else {
        setProducts(prev => {
          const uniqueProducts = filteredProducts.filter(
            p => !prev.some(existing => existing.id === p.id)
          );
          return [...prev, ...uniqueProducts];
        });
      }
      
      setTotalFetched(prev => prev + filteredProducts.length);
      setHasMore(newProducts.length >= pageSize);
      
      if (!reset) {
        setPage(prevPage => prevPage + 1);
      }
      
      // 画像のプリフェッチ
      InteractionManager.runAfterInteractions(() => {
        const imagesToPrefetch = filteredProducts
          .map(p => p.imageUrl)
          .filter(Boolean) as string[];
          
        if (imagesToPrefetch.length > 0) {
          prefetchImages(imagesToPrefetch, reset);
        }
      });
      
    } catch (err) {
      setError('商品データの読み込みに失敗しました。');
      console.error('Error loading products:', err);
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [user, mode, page, pageSize, hasMore, priceFlexibility, prefetchImages]);
  
  // 初回マウント時に商品データを取得
  useEffect(() => {
    if (isInitialized && user) {
      loadProducts(true);
    }
  }, [isInitialized, user, loadProducts]);
  
  // 追加データ読み込み
  const loadMore = useCallback(async (reset = false) => {
    if (reset) {
      await loadProducts(true);
      return;
    }
    if (isLoading || !hasMore || loadingRef.current) return;
    await loadProducts(false);
  }, [isLoading, hasMore, loadProducts]);
  
  // データリセット
  const resetProducts = useCallback(() => {
    loadProducts(true);
  }, [loadProducts]);
  
  // データ更新
  const refreshProducts = useCallback(async () => {
    await loadProducts(true);
  }, [loadProducts]);
  
  // スワイプハンドラー
  const handleSwipe = useCallback(async (product: Product, direction: 'left' | 'right') => {
    if (!product || !user) return;
    
    // スワイプデータを記録
    const result = direction === 'right' ? 'yes' : 'no';
    recordSwipe(user.id, product.id, result).catch(err => {
      console.error('Error recording swipe:', err);
    });
    
    // スワイプ済みリストに追加
    swipedProductsRef.current.add(product.id);
    
    // 次の商品へ
    setCurrentIndex(prevIndex => {
      const nextIndex = prevIndex + 1;
      
      // 残りの商品が少なくなったら追加ロード
      if (products.length - nextIndex <= 5 && hasMore && !loadingRef.current) {
        InteractionManager.runAfterInteractions(() => {
          loadMore();
        });
      }
      
      return nextIndex;
    });
  }, [products.length, hasMore, loadMore, user]);
  
  return {
    products,
    currentIndex,
    currentProduct,
    isLoading,
    error,
    loadMore,
    resetProducts,
    refreshProducts,
    handleSwipe,
    hasMore,
    totalFetched,
    scoringMode: mode
  };
};