import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { fetchProducts, fetchProductsByTags, fetchScoredProducts, ProductFilterOptions, convertToProductFilters } from '@/services/productService';
import { Product } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { getSwipeHistory } from '@/services/swipeService';
import { recordSwipe } from '@/services/swipeService'; 
import { useImagePrefetch } from '@/utils/imageUtils';
import { InteractionManager } from 'react-native';
import { getInitialProducts } from '@/services/initialProductService';
import { useOnboarding } from '@/contexts/OnboardingContext';
import { FilterOptions } from '@/contexts/FilterContext';
import { STYLE_ID_TO_JP_TAG } from '@/constants/constants';

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
  handleSwipe: (product: Product, direction: 'left' | 'right', metadata?: { swipeTime?: number }) => void;
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
  const { gender, stylePreference, ageGroup, isFirstTimeUser } = useOnboarding();
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
    priceRange: [0, 50000],
    styles: [],
    moods: [],
    categories: [],
    gender: 'all'
  });
  
  const pageSize = 30; // より多くの商品をプリロード
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
      if (!user || !user.id) return;
      
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

  // オンボーディングのスタイル選択を考慮したフィルター取得
  const getEffectiveFilters = useCallback((): FilterOptions => {
    const effectiveFilters = { ...filters };
    
    // オンボーディングで選択されたスタイルがあり、フィルターが空の場合、オンボーディングの選択を反映
    if (stylePreference && stylePreference.length > 0 && filters.styles.length === 0) {
      // 選択されたスタイルを日本語タグに変換して使用
      const jpTags = stylePreference
        .map(style => STYLE_ID_TO_JP_TAG[style])
        .filter(tag => tag !== undefined);
      if (jpTags.length > 0) {
        effectiveFilters.styles = jpTags;
      }
    }
    
    return effectiveFilters;
  }, [filters, stylePreference]);

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
        if (user && user.id) {
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
      
      const effectiveFilters = getEffectiveFilters();
      
      console.log('[useProducts] Loading products - page:', currentPage, 'offset:', currentPage * pageSize);
      console.log('[useProducts] Swipe history size:', swipedProductsRef.current.size);
      console.log('[useProducts] All products seen:', productsData.allProductIds.size);
      console.log('[useProducts] Exclude product IDs:', Array.from(productsData.allProductIds).slice(0, 10)); // 最初の10個を表示
      console.log('[useProducts] Filters:', effectiveFilters);
      
      // 初回ユーザーまたはオンボーディング情報がある場合は特別な商品セットを取得
      if ((isFirstTimeUser || (gender && stylePreference && stylePreference.length > 0)) && currentPage === 0 && reset) {
        console.log('[useProducts] Loading personalized initial products');
        
        // genderの'other'を'all'にマッピング
        const mappedGender = gender === 'other' ? 'all' : gender;
        
        const initialProducts = await getInitialProducts({
          gender: mappedGender as 'male' | 'female' | 'all',
          selectedStyles: stylePreference,
          ageGroup
        }, pageSize * 2);
        
        if (initialProducts.length > 0) {
          setProductsData({
            products: initialProducts,
            hasMore: true,
            totalFetched: initialProducts.length,
            allProductIds: new Set(initialProducts.map(p => p.id))
          });
          
          // 画像をプリフェッチ（より多くプリロード）
          const imagesToPrefetch = initialProducts.slice(0, 10).map(p => p.imageUrl).filter(url => url !== null) as string[];
          // 非同期でプリフェッチ
          prefetchImages(imagesToPrefetch).catch(console.error);
          
          setIsLoading(false);
          loadingRef.current = false;
          setPage(1);
          return;
        }
      }
      
      // フィルターを適用した商品取得
      const productFilters = convertToProductFilters(effectiveFilters);
      
      // fetchProductsにフィルターを渡す
      const result = await fetchProducts(
        pageSize * 2, // 多めに取得してフィルタリング余地を残す
        currentPage * pageSize,
        productFilters
      );
      
      if (!result.success || !result.data) {
        throw new Error(result.error || 'Failed to fetch products');
      }
      
      // 画像URLが有効な商品のみをフィルタリング
      const productsWithValidImages = result.data.filter(product => {
        const hasImageUrl = product.imageUrl && product.imageUrl.trim() !== '';
        if (!hasImageUrl && __DEV__) {
          console.warn('[useProducts] Filtering out product without valid image:', {
            id: product.id,
            title: product.title,
            imageUrl: product.imageUrl
          });
        }
        return hasImageUrl;
      });
      
      console.log('[useProducts] Image filter results:', {
        original: result.data.length,
        afterFilter: productsWithValidImages.length,
        removed: result.data.length - productsWithValidImages.length
      });
      
      // 既に見た商品（スワイプ済み＋現在のセッション）を除外
      const excludeIds = new Set([
        ...Array.from(swipedProductsRef.current),
        ...Array.from(productsData.allProductIds)
      ]);
      
      console.log('[useProducts] Excluding IDs:', excludeIds.size);
      
      // 重複を除去して新しい商品のみを追加
      const newProducts = productsWithValidImages.filter(product => !excludeIds.has(product.id));
      
      console.log('[useProducts] New products after filtering:', newProducts.length);
      
      if (newProducts.length === 0 && result.data.length > 0) {
        // 新しい商品がない場合、リトライまたはリサイクル
        if (retryCountRef.current < maxRetries) {
          retryCountRef.current++;
          console.log('[useProducts] No new products, retrying... (attempt', retryCountRef.current, ')');
          setPage(currentPage + 1);
          loadingRef.current = false;
          await loadProducts(false);
          return;
        } else if (recycleCountRef.current < 2) {
          // 商品を一巡した場合、スワイプ済み商品を再利用（最大2回まで）
          recycleCountRef.current++;
          console.log('[useProducts] Recycling swiped products (cycle', recycleCountRef.current, ')');
          
          // すべての商品IDをクリアして再スタート
          setProductsData(prev => ({
            ...prev,
            allProductIds: new Set()
          }));
          
          // ただし現在のセッションでスワイプした商品は引き続き除外
          const sessionSwipedIds = Array.from(productsData.allProductIds);
          const recycledProducts = result.data.filter(product => 
            !sessionSwipedIds.includes(product.id)
          );
          
          if (recycledProducts.length > 0) {
            const updatedAllProductIds = new Set([
              ...productsData.allProductIds,
              ...recycledProducts.map(p => p.id)
            ]);
            
            setProductsData(prev => ({
              products: reset ? recycledProducts : [...prev.products, ...recycledProducts],
              hasMore: true,
              totalFetched: prev.totalFetched + recycledProducts.length,
              allProductIds: updatedAllProductIds
            }));
            
            // 画像プリフェッチ
            const nextImages = recycledProducts.slice(0, 5).map(p => p.imageUrl).filter(url => url !== null) as string[];
            prefetchImages(nextImages).catch(console.error);
            
            retryCountRef.current = 0;
          }
        } else {
          // すべてのリトライとリサイクルを使い果たした
          console.log('[useProducts] All products exhausted after retries and recycling');
          setProductsData(prev => ({
            ...prev,
            hasMore: false
          }));
        }
      } else {
        // 新しい商品がある場合
        const updatedAllProductIds = new Set([
          ...productsData.allProductIds,
          ...newProducts.map(p => p.id)
        ]);
        
        setProductsData(prev => ({
          products: reset ? newProducts : [...prev.products, ...newProducts],
          hasMore: newProducts.length >= pageSize * 0.5, // 半分以上取得できれば継続
          totalFetched: prev.totalFetched + newProducts.length,
          allProductIds: updatedAllProductIds
        }));
        
        // 次の商品の画像をプリフェッチ（非同期、より多くプリロード）
        InteractionManager.runAfterInteractions(() => {
          const nextImages = newProducts.slice(0, 10).map(p => p.imageUrl).filter(url => url !== null) as string[];
          prefetchImages(nextImages).catch(console.error);
        });
        
        retryCountRef.current = 0; // リトライカウントをリセット
      }
      
      setPage(currentPage + 1);
      
    } catch (error: any) {
      console.error('[useProducts] Error loading products:', error);
      setError(error.message || 'Failed to load products');
      setProductsData(prev => ({
        ...prev,
        hasMore: false
      }));
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [
    page,
    productsData.hasMore,
    productsData.allProductIds,
    user,
    pageSize,
    filters,
    isFirstTimeUser,
    gender,
    stylePreference,
    ageGroup,
    prefetchImages,
    getEffectiveFilters
  ]);

  // 初回ロード
  useEffect(() => {
    if (isInitialized && !loadingRef.current && productsData.products.length === 0) {
      console.log('[useProducts] Initial load triggered');
      loadProducts(true);
    }
  }, [isInitialized]);

  // フィルター変更時の処理を修正
  useEffect(() => {
    filtersRef.current = filters;
    // フィルター変更時は即座にリロード
    console.log('[useProducts] Filters changed, reloading products');
    loadProducts(true);
  }, [filters]); // loadProductsを依存配列から除外

  // スワイプ処理
  const handleSwipe = useCallback(async (product: Product, direction: 'left' | 'right', metadata?: { swipeTime?: number }) => {
    if (!user || !user.id) {
      console.error('[useProducts] Cannot record swipe: No user');
      return;
    }
    
    // スワイプをローカルで記録
    swipedProductsRef.current.add(product.id);
    
    console.log(`[useProducts] Recording swipe: ${direction} for product ${product.id} at index ${currentIndex}`);
    
    // Supabaseに記録（非同期）- エラーハンドリングを改善
    recordSwipe({
      userId: user.id,
      productId: product.id,
      result: direction === 'right' ? 'yes' : 'no',
      swipeTime: metadata?.swipeTime
    }).catch(error => {
      console.error('[useProducts] Failed to record swipe:', error);
      // エラーが発生してもアプリは継続
    });
    
    // インデックスを更新する前に、次の商品が存在することを確認
    const nextIndex = currentIndex + 1;
    
    // 残り10枚になったら追加ロード（非同期）
    if (nextIndex >= productsData.products.length - 10 && productsData.hasMore && !loadingRef.current) {
      console.log('[useProducts] Loading more products (10 cards remaining)');
      // 非同期でロードを開始
      setTimeout(() => loadMore(false), 0);
    }
    
    // 次の商品が存在する場合のみインデックスを更新
    if (nextIndex < productsData.products.length || productsData.hasMore) {
      // 次のフレームで状態を更新（スムーズなアニメーションのため）
      requestAnimationFrame(() => {
        setCurrentIndex(nextIndex);
        console.log(`[useProducts] Updated currentIndex to ${nextIndex}`);
      });
    } else {
      console.log('[useProducts] No more products to show');
    }
  }, [user, currentIndex, productsData.products.length, productsData.hasMore, loadMore]);

  // もっと読み込む
  const loadMore = useCallback(async (reset = false) => {
    if (!loadingRef.current || reset) {
      await loadProducts(reset);
    }
  }, [loadProducts]);

  // リセット
  const resetProducts = useCallback(() => {
    console.log('[useProducts] Resetting products');
    loadProducts(true);
  }, [loadProducts]);

  // リフレッシュ
  const refreshProducts = useCallback(async () => {
    setRefreshing(true);
    await loadProducts(true);
    setRefreshing(false);
  }, [loadProducts]);

  // フィルター設定
  const setFilters = useCallback((newFilters: FilterOptions) => {
    console.log('[useProducts] Setting filters:', newFilters);
    setActiveFilters(newFilters);
  }, []);

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
