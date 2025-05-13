import { useState, useEffect, useCallback } from 'react';
import { fetchProducts, fetchProductsByTags } from '@/services/productService';
import { Product } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { getSwipeHistory } from '@/services/swipeService';

interface UseProductsReturn {
  products: Product[];
  currentIndex: number;
  currentProduct: Product | undefined;
  isLoading: boolean;
  error: string | null;
  loadMore: () => Promise<void>;
  resetProducts: () => void;
  refreshProducts: () => Promise<void>;
  handleSwipe: (product: Product, direction: 'left' | 'right') => void;
}

/**
 * 商品データとスワイプ管理のためのカスタムフック
 */
export const useProducts = (): UseProductsReturn => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const pageSize = 10;
  
  // 現在表示中の商品
  const currentProduct = products[currentIndex];

  // 商品データを取得
  const loadProducts = useCallback(async (reset = false) => {
    try {
      if (reset) {
        setIsLoading(true);
        setCurrentIndex(0);
        setPage(0);
        setHasMore(true);
        setError(null);
      } else if (!hasMore) {
        return;
      }

      // ローディング状態を管理
      setIsLoading(prevState => reset ? true : prevState);
      
      // すでにスワイプした商品のIDを取得
      let swipedProductIds: string[] = [];
      
      if (user) {
        try {
          const swipeHistory = await getSwipeHistory(user.id);
          swipedProductIds = swipeHistory.map(swipe => swipe.productId);
        } catch (err) {
          console.error('Error fetching swipe history:', err);
          // 続行（エラーでも商品は取得可能）
        }
      }

      // 商品データを取得
      const newProducts = await fetchProducts(pageSize, page * pageSize);
      
      // スワイプ済みの商品を除外
      const filteredProducts = newProducts.filter(
        product => !swipedProductIds.includes(product.id)
      );

      // 結果が十分でない場合の処理
      if (filteredProducts.length === 0 && newProducts.length > 0) {
        // スワイプ済みを除外した結果、商品がない場合は次のページを試みる
        setPage(prevPage => prevPage + 1);
        if (!reset) {
          loadProducts(false);
        }
        return;
      }

      // 商品が取得できなかった場合
      if (newProducts.length === 0) {
        setHasMore(false);
      }

      // 商品データを更新
      setProducts(prevProducts => {
        if (reset) {
          return filteredProducts;
        } else {
          // 重複を排除して結合
          const combinedProducts = [...prevProducts];
          filteredProducts.forEach(product => {
            if (!combinedProducts.some(p => p.id === product.id)) {
              combinedProducts.push(product);
            }
          });
          return combinedProducts;
        }
      });
    } catch (err) {
      setError('商品データの読み込みに失敗しました。');
      console.error('Error loading products:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user, page, pageSize, hasMore]);

  // 初回マウント時に商品データを取得
  useEffect(() => {
    loadProducts(true);
  }, [loadProducts]);

  // 追加データ読み込み
  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;
    setPage(prevPage => prevPage + 1);
    await loadProducts(false);
  }, [isLoading, hasMore, loadProducts]);

  // データリセット
  const resetProducts = useCallback(() => {
    loadProducts(true);
  }, [loadProducts]);

  // データ更新（引っ張り更新など）
  const refreshProducts = useCallback(async () => {
    setRefreshing(true);
    await loadProducts(true);
  }, [loadProducts]);

  // スワイプハンドラー
  const handleSwipe = useCallback((product: Product, direction: 'left' | 'right') => {
    // 次の商品へ
    setCurrentIndex(prevIndex => {
      const nextIndex = prevIndex + 1;
      
      // 残りの商品が少なくなったら追加ロード
      if (products.length - nextIndex <= 5 && hasMore && !isLoading) {
        loadMore();
      }
      
      return nextIndex;
    });
  }, [products.length, hasMore, isLoading, loadMore]);

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
  };
};
