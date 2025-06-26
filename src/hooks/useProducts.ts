import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { fetchProducts, fetchProductsByTags, fetchScoredProducts, FilterOptions, fetchMixedProducts } from '@/services/productService';
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
  allProductIds: Set<string>; // 全商品IDを追跡
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
  setFilters: (filters: FilterOptions) => void;
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
    totalFetched: 0,
    allProductIds: new Set()
  });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setActiveFilters] = useState<FilterOptions>({
    categories: [],
    priceRange: [0, Infinity],
    selectedTags: [],
    includeUsed: false // デフォルトは新品のみ
  });
  
  const pageSize = 20;
  const maxRetries = 5; // 最大リトライ回数
  
  // 画像プリフェッチ用
  const { prefetchImages } = useImagePrefetch();
  const loadingRef = useRef(false);
  const swipedProductsRef = useRef<Set<string>>(new Set());
  const filtersRef = useRef(filters);
  const retryCountRef = useRef(0);
  const recycleCountRef = useRef(0); // リサイクル回数をトラック
  
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
        console.log('[useProducts] Initial swipe history loaded:', swipedIds.size, 'items');
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
      let currentPage = page;
      
      if (reset) {
        setIsLoading(true);
        setCurrentIndex(0);
        currentPage = 0;
        setPage(0);
        retryCountRef.current = 0;
        recycleCountRef.current = 0;
        setProductsData({
          products: [],
          hasMore: true,
          totalFetched: 0,
          allProductIds: new Set()
        });
        setError(null);
        // リセット時はスワイプ履歴を再取得
        if (user) {
          const swipeHistory = await getSwipeHistory(user.id);
          const swipedIds = new Set(swipeHistory.map(swipe => swipe.productId));
          swipedProductsRef.current = swipedIds;
        }
      } else if (!productsData.hasMore) {
        loadingRef.current = false;
        return;
      }

      // ローディング状態を管理
      setIsLoading(prevState => reset ? true : prevState);
      
      console.log('[useProducts] Loading products - page:', currentPage, 'offset:', currentPage * pageSize);
      console.log('[useProducts] Swipe history size:', swipedProductsRef.current.size);
      console.log('[useProducts] All products seen:', productsData.allProductIds.size);
      console.log('[useProducts] Exclude product IDs:', Array.from(productsData.allProductIds).slice(0, 10)); // 最初の10個を表示
      console.log('[useProducts] Filters:', filtersRef.current);
      
      // ミックス商品取得機能を使用（ランダム性と推薦のバランス）
      const response = await fetchMixedProducts(
        user?.id || null,
        pageSize * 2, // 多めに取得
        currentPage * pageSize,
        filtersRef.current,
        Array.from(productsData.allProductIds) // 既に表示された商品IDを渡す
      );
      
      // レスポンスの検証
      if (!response) {
        console.error('[useProducts] No response from fetchMixedProducts');
        setError('商品データの取得に失敗しました');
        loadingRef.current = false;
        return;
      }
      
      if (!response.success) {
        console.error('[useProducts] fetchMixedProducts failed:', response.error);
        setError(response.error || '商品データの取得に失敗しました');
        loadingRef.current = false;
        return;
      }
      
      const newProducts = response.data || [];
      console.log('[useProducts] Fetched products:', newProducts.length);
      console.log('[useProducts] First 5 product IDs from fetchMixedProducts:', newProducts.slice(0, 5).map(p => p.id));
      
      // fetchMixedProductsが既に除外処理を行っているので、ここでは追加のフィルタリングのみ行う
      let filteredProducts = newProducts;
      if (recycleCountRef.current === 0) {
        // スワイプ済みの商品のみ除外（allProductIdsは既にfetchMixedProductsで除外済み）
        const beforeFilterCount = filteredProducts.length;
        filteredProducts = newProducts.filter(
          product => !swipedProductsRef.current.has(product.id)
        );
        console.log('[useProducts] Filtered out swiped products:', beforeFilterCount - filteredProducts.length);
      }
      // リサイクルモードでは追加のフィルタリングは行わない
      
      console.log('[useProducts] After filtering:', filteredProducts.length);
      console.log('[useProducts] Current page:', currentPage, 'Offset:', currentPage * pageSize);
      console.log('[useProducts] Total products loaded so far:', productsData.products.length);
      console.log('[useProducts] Recycle mode:', recycleCountRef.current > 0 ? 'ON' : 'OFF');

      // 商品が取得できなかった場合の判定
      const hasMoreProducts = newProducts.length >= pageSize;

      // 結果が十分でない場合の処理
      if (filteredProducts.length === 0 && hasMoreProducts && retryCountRef.current < maxRetries && recycleCountRef.current === 0) {
        console.log('[useProducts] No new products after filtering, retrying...');
        retryCountRef.current++;
        
        if (!reset) {
          setPage(prevPage => prevPage + 1);
          loadingRef.current = false;
          // 再帰的に次のページを読み込む
          setTimeout(() => loadProducts(false), 100);
          return;
        }
      }
      
      // リトライ上限に達した場合、リサイクルモードに切り替え
      if (filteredProducts.length === 0 && retryCountRef.current >= maxRetries && recycleCountRef.current === 0) {
        console.log('[useProducts] Max retries reached, switching to recycle mode...');
        
        // リサイクルモードを有効化
        recycleCountRef.current = 1;
        
        // スワイプ履歴をクリア（リサイクルのため）
        console.log('[useProducts] Clearing swipe history for recycling...');
        swipedProductsRef.current.clear();
        
        // 全商品IDもクリア
        setProductsData(prev => ({
          ...prev,
          allProductIds: new Set()
        }));
        
        // リトライカウントをリセット
        retryCountRef.current = 0;
        
        // ページをリセットして最初から再取得
        setPage(0);
        
        // 再度商品を取得
        loadingRef.current = false;
        setTimeout(() => loadProducts(false), 100);
        return;
      }

      // 商品データを更新
      setProductsData(prev => {
        const newAllProductIds = new Set(prev.allProductIds);
        
        // 新しい商品のIDを追加する前に、重複チェック
        const duplicateIds = filteredProducts.filter(p => prev.allProductIds.has(p.id));
        if (duplicateIds.length > 0) {
          console.error('[useProducts] 🚨 重複する商品IDが検出されました:', duplicateIds.map(p => ({ id: p.id, title: p.title })));
        }
        
        filteredProducts.forEach(p => newAllProductIds.add(p.id));
        
        const updatedProducts = reset 
          ? filteredProducts 
          : [...prev.products, ...filteredProducts.filter(
              p => !prev.products.some(existing => existing.id === p.id)
            )];

        // 商品配列内の重複チェック
        const productIds = updatedProducts.map(p => p.id);
        const duplicateProductIds = productIds.filter((id, index) => productIds.indexOf(id) !== index);
        if (duplicateProductIds.length > 0) {
          console.error('[useProducts] 🚨 商品配列内に重複IDが存在:', duplicateProductIds);
        }

        console.log('[useProducts] Total products after update:', updatedProducts.length);
        console.log('[useProducts] All product IDs count:', newAllProductIds.size);

        return {
          products: updatedProducts,
          hasMore: hasMoreProducts || retryCountRef.current < maxRetries || recycleCountRef.current > 0,
          totalFetched: prev.totalFetched + filteredProducts.length,
          allProductIds: newAllProductIds
        };
      });
      
      // ページを進める（resetでない場合のみ）
      if (!reset && filteredProducts.length > 0) {
        setPage(prevPage => prevPage + 1);
        retryCountRef.current = 0; // 成功したらリトライカウントをリセット
      }
      
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
  }, [page, pageSize, productsData.hasMore, productsData.allProductIds, prefetchImages, user]);

  // 初回マウント時に商品データを取得（認証初期化完了後）
  useEffect(() => {
    console.log('[useProducts] Init effect - isInitialized:', isInitialized, 'loadingRef:', loadingRef.current);
    
    // 初期化が完了していない場合でも、商品を取得する
    // ユーザー認証は商品表示には不要
    if (!loadingRef.current && productsData.products.length === 0) {
      console.log('[useProducts] Starting initial load (auth not required for products)...');
      loadProducts(true);
    }
  }, []); // 依存関係を空にして、マウント時に一度だけ実行

  // 追加データ読み込み
  const loadMore = useCallback(async (reset = false) => {
    if (reset) {
      await loadProducts(true);
      return;
    }
    if (isLoading || !productsData.hasMore || loadingRef.current) return;
    
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
    
    console.log('[useProducts] handleSwipe called - currentIndex:', currentIndex, 'productsLength:', productsData.products.length);
    
    // スワイプデータを記録（非同期、待たない）
    const result = direction === 'right' ? 'yes' : 'no';
    recordSwipe(user.id, product.id, result).catch(err => {
      console.error('Error recording swipe:', err);
    });
    
    // リサイクルモードでなければ、スワイプ済みリストに追加
    if (recycleCountRef.current === 0) {
      swipedProductsRef.current.add(product.id);
    }
    
    // 次の商品へ
    setCurrentIndex(prevIndex => {
      const nextIndex = prevIndex + 1;
      console.log('[useProducts] Next index:', nextIndex, 'hasMore:', productsData.hasMore);
      
      // 残りの商品が少なくなったら追加ロード
      // 非同期で処理（UIをブロックしない）
      if (productsData.products.length - nextIndex <= 5 && productsData.hasMore && !loadingRef.current) {
        console.log('[useProducts] Triggering loadMore - remaining products:', productsData.products.length - nextIndex);
        InteractionManager.runAfterInteractions(() => {
          loadMore();
        });
      }
      
      return nextIndex;
    });
  }, [currentIndex, productsData.products.length, productsData.hasMore, loadMore, user]);

  // フィルターをセットして商品を再読み込み
  const setFilters = useCallback((newFilters: FilterOptions) => {
    // フィルターが実際に変更された場合のみ更新
    const hasChanged = 
      JSON.stringify(newFilters.categories) !== JSON.stringify(filters.categories) ||
      JSON.stringify(newFilters.priceRange) !== JSON.stringify(filters.priceRange) ||
      JSON.stringify(newFilters.selectedTags) !== JSON.stringify(filters.selectedTags) ||
      newFilters.includeUsed !== filters.includeUsed;
    
    if (hasChanged) {
      // filtersRefを即座に更新（loadProductsが正しいフィルターを使用するため）
      filtersRef.current = newFilters;
      setActiveFilters(newFilters);
      
      // フィルター変更時は明示的にリセット
      setPage(0);
      setProductsData({
        products: [],
        hasMore: true,
        totalFetched: 0,
        allProductIds: new Set()
      });
      setCurrentIndex(0);
      recycleCountRef.current = 0; // リサイクルモードをリセット
      retryCountRef.current = 0; // リトライカウントもリセット
      
      // スワイプ履歴は保持するが、新しい商品取得のために一時的にクリア
      const tempSwipedProducts = new Set(swipedProductsRef.current);
      
      // 新しいフィルターで再読み込み
      loadProducts(true).then(() => {
        // 読み込み完了後にスワイプ履歴を復元
        swipedProductsRef.current = tempSwipedProducts;
      });
    }
  }, [filters, loadProducts]);

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
    totalFetched: productsData.totalFetched,
    setFilters
  };
};
