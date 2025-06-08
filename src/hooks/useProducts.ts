import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchProducts, fetchProductsByTags } from '@/services/productService';
import { Product } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { getSwipeHistory } from '@/services/swipeService';
import { recordSwipe } from '@/services/swipeService'; 
import { useImagePrefetch } from '@/utils/imageUtils';
import { InteractionManager } from 'react-native';

interface ProductsState {
  products: Product[];
  hasMore: boolean;
  totalFetched: number;
}

interface UseProductsReturn {
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
}

/**
 * 商品データとスワイプ管理のためのカスタムフック
 * パフォーマンス最適化済み
 */
export const useProducts = (): UseProductsReturn => {
  const { user, isInitialized } = useAuth();
  const [productsData, setProductsData] = useState<ProductsState>({
    products: [],
    hasMore: true,
    totalFetched: 0
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const pageSize = 10;
  
  // 画像プリフェッチ用
  const { prefetchImages } = useImagePrefetch();
  const loadingRef = useRef(false);
  const swipedProductsRef = useRef<Set<string>>(new Set());
  
  // 現在表示中の商品
  const currentProduct = productsData.products[currentIndex];

  // スワイプ履歴を取得（初回のみ）
  useEffect(() => {
    const fetchSwipeHistory = async () => {
      if (!user) return;
      
      try {
        const swipeHistory = await getSwipeHistory(user.id);
        const swipedIds = new Set(swipeHistory.map(swipe => swipe.productId));
        swipedProductsRef.current = swipedIds;
      } catch (err) {
        console.error('Error fetching initial swipe history:', err);
      }
    };
    
    fetchSwipeHistory();
  }, [user]);

  // 商品データを取得（最適化版）
  const loadProducts = useCallback(async (reset = false) => {
    // 同時に複数の読み込みリクエストが走らないように保護
    if (loadingRef.current && !reset) return;
    loadingRef.current = true;
    
    try {
      if (reset) {
        setIsLoading(true);
        setCurrentIndex(0);
        setPage(0);
        setProductsData({
          products: [],
          hasMore: true,
          totalFetched: 0
        });
        setError(null);
      } else if (!productsData.hasMore) {
        loadingRef.current = false;
        return;
      }

      // ローディング状態を管理
      setIsLoading(prevState => reset ? true : prevState);
      
      // 商品データを取得
      const response = await fetchProducts({
        page: page + 1, // fetchProductsは1-indexedページを期待
        limit: pageSize,
      });
      
      // レスポンスの検証
      const newProducts = response?.products || [];
      
      // スワイプ済みの商品を除外
      const filteredProducts = newProducts.filter(
        product => !swipedProductsRef.current.has(product.id)
      );

      // 結果が十分でない場合の処理
      if (filteredProducts.length === 0 && newProducts.length > 0) {
        // スワイプ済みを除外した結果、商品がない場合は次のページを試みる
        setPage(prevPage => prevPage + 1);
        loadingRef.current = false;
        if (!reset) {
          loadProducts(false);
        }
        return;
      }

      // 商品が取得できなかった場合
      const hasMoreProducts = newProducts.length >= pageSize;

      // 商品データを更新
      setProductsData(prev => {
        const updatedProducts = reset 
          ? filteredProducts 
          : [...prev.products, ...filteredProducts.filter(
              p => !prev.products.some(existing => existing.id === p.id)
            )];

        return {
          products: updatedProducts,
          hasMore: hasMoreProducts,
          totalFetched: prev.totalFetched + filteredProducts.length
        };
      });
      
      // 画像をプリフェッチ（バックグラウンドで、UIブロックなし）
      InteractionManager.runAfterInteractions(() => {
        const imagesToPrefetch = filteredProducts
          .map(p => p.imageUrl || p.image_url)
          .filter(Boolean) as string[];
          
        if (imagesToPrefetch.length > 0) {
          prefetchImages(imagesToPrefetch, reset); // 最初のロードは高優先度
        }
      });
    } catch (err) {
      setError('商品データの読み込みに失敗しました。');
      console.error('Error loading products:', err);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
      loadingRef.current = false;
    }
  }, [user, page, pageSize, productsData.hasMore, prefetchImages]);

  // 初回マウント時に商品データを取得（認証初期化完了後）
  useEffect(() => {
    if (isInitialized) {
      loadProducts(true);
    }
  }, [isInitialized]);

  // 追加データ読み込み
  const loadMore = useCallback(async (reset = false) => {
    if (isLoading && !reset) return;
    if (reset) {
      await loadProducts(true);
      return;
    }
    if (!productsData.hasMore) return;
    setPage(prevPage => prevPage + 1);
    await loadProducts(false);
  }, [isLoading, productsData.hasMore, loadProducts]);

  // データリセット
  const resetProducts = useCallback(() => {
    loadProducts(true);
  }, [loadProducts]);

  // データ更新（引っ張り更新など）
  const refreshProducts = useCallback(async () => {
    setRefreshing(true);
    await loadProducts(true);
  }, [loadProducts]);

  // スワイプハンドラー（最適化版）
  const handleSwipe = useCallback(async (product: Product, direction: 'left' | 'right') => {
    if (!product || !user) return;
    
    // スワイプデータを記録（非同期、待たない）
    const result = direction === 'right' ? 'yes' : 'no';
    recordSwipe(user.id, product.id, result).catch(err => {
      console.error('Error recording swipe:', err);
    });
    
    // スワイプ済みリストに追加（メモリ上のキャッシュ）
    swipedProductsRef.current.add(product.id);
    
    // 次の商品へ
    setCurrentIndex(prevIndex => {
      const nextIndex = prevIndex + 1;
      
      // 残りの商品が少なくなったら追加ロード
      // 非同期で処理（UIをブロックしない）
      if (productsData.products.length - nextIndex <= 5 && productsData.hasMore && !loadingRef.current) {
        InteractionManager.runAfterInteractions(() => {
          loadMore();
        });
      }
      
      return nextIndex;
    });
  }, [productsData.products.length, productsData.hasMore, loadMore, user]);

  return {
    products: productsData.products,
    currentIndex,
    currentProduct,
    isLoading,
    error,
    loadMore,
    resetProducts,
    refreshProducts,
    handleSwipe,
    hasMore: productsData.hasMore,
    totalFetched: productsData.totalFetched
  };
};
