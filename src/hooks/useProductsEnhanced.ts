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
import { enrichProductsWithStyles } from '@/services/tagMappingService';
import { 
  buildUserPreferenceProfile, 
  sortProductsByPersonalization,
  getExplorationProducts,
  UserPreferenceProfile 
} from '@/services/personalizedScoringService';
import { recordSwipeToSession } from '@/services/improvedRecommendationService';

interface ProductsState {
  products: Product[];
  hasMore: boolean;
  totalFetched: number;
  allProductIds: Set<string>; // 全商品IDを追跡
}

interface SwipeHistoryItem {
  result: 'yes' | 'no';
  product: Product;
  timestamp: Date;
  swipeTimeMs?: number;
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
  userProfile?: UserPreferenceProfile;
}

/**
 * 商品データとスワイプ管理のためのカスタムフック（改良版）
 * パーソナライゼーション機能強化
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
  
  // パーソナライゼーション用の状態
  const [swipeHistory, setSwipeHistory] = useState<SwipeHistoryItem[]>([]);
  const [userProfile, setUserProfile] = useState<UserPreferenceProfile | undefined>();
  const [sessionStartTime] = useState<Date>(new Date());
  
  const pageSize = 500; // データベースには2万件以上あるので、より多くの商品をプリロード
  const maxRetries = 10; // 最大リトライ回数を増やす
  
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
        const swipeHistoryData = await getSwipeHistory(user.id);
        const swipedIds = new Set(swipeHistoryData.map(swipe => swipe.productId));
        swipedProductsRef.current = swipedIds;
        console.log('[useProducts] Initial swipe history loaded:', swipedIds.size, 'items');
      } catch (err) {
        console.error('Error fetching initial swipe history:', err);
      }
    };
    
    fetchSwipeHistory();
  }, [user]);

  // ユーザープロファイルを更新
  useEffect(() => {
    if (swipeHistory.length > 0) {
      const profile = buildUserPreferenceProfile(swipeHistory, sessionStartTime);
      setUserProfile(profile);
      console.log('[useProducts] User profile updated:', profile);
    }
  }, [swipeHistory, sessionStartTime]);

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

  // 商品データを取得（最適化版＋パーソナライゼーション対応）
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
          const swipeHistoryData = await getSwipeHistory(user.id);
          const swipedIds = new Set(swipeHistoryData.map(swipe => swipe.productId));
          swipedProductsRef.current = swipedIds;
        }
      } else if (!productsData.hasMore) {
        loadingRef.current = false;
        return;
      }

      // ローディング状態を管理
      setIsLoading(prevState => reset ? true : prevState);
      
      const effectiveFilters = getEffectiveFilters();
      
      // APIから商品データを取得
      const productFilters = convertToProductFilters(effectiveFilters);
      const { products: fetchedProducts, hasMore } = await fetchProducts({
        ...productFilters,
        page: currentPage,
        limit: pageSize
      });

      console.log(`[useProducts] Fetched ${fetchedProducts.length} products from API, page: ${currentPage}`);

      if (fetchedProducts.length === 0) {
        setError('商品が見つかりませんでした。');
        setIsLoading(false);
        loadingRef.current = false;
        return;
      }

      // スタイルタグを強化
      const enrichedProducts = enrichProductsWithStyles(fetchedProducts);
      
      // スワイプ済み商品をフィルタリング
      const unseenProducts = enrichedProducts.filter(p => !swipedProductsRef.current.has(p.id));
      console.log(`[useProducts] Filtered out ${enrichedProducts.length - unseenProducts.length} already swiped products`);

      // パーソナライズソート（ユーザープロファイルがある場合）
      let sortedProducts = unseenProducts;
      if (userProfile && swipeHistory.length >= 5) {
        // 連続No対応：探索モードチェック
        if (userProfile.recentSwipePattern.consecutiveNos >= 3) {
          console.log('[useProducts] Exploration mode activated due to consecutive Nos');
          sortedProducts = getExplorationProducts(unseenProducts, userProfile);
        } else {
          sortedProducts = sortProductsByPersonalization(unseenProducts, userProfile, {
            diversityFactor: 0.4 // 多様性を重視
          });
        }
      }

      // 画像プリフェッチ（最初の10枚）
      const imagesToPrefetch = sortedProducts.slice(0, 10).map(p => p.image_url);
      prefetchImages(imagesToPrefetch);

      // 状態を更新
      setProductsData(prev => {
        const newAllProductIds = new Set(prev.allProductIds);
        sortedProducts.forEach(p => newAllProductIds.add(p.id));
        
        return {
          products: reset ? sortedProducts : [...prev.products, ...sortedProducts],
          hasMore,
          totalFetched: prev.totalFetched + sortedProducts.length,
          allProductIds: newAllProductIds
        };
      });

      setPage(currentPage + 1);
      setError(null);
      
    } catch (err) {
      console.error('[useProducts] Error loading products:', err);
      setError('商品の読み込みに失敗しました。');
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, [page, productsData.hasMore, getEffectiveFilters, user, prefetchImages, userProfile, swipeHistory]);

  // スワイプ処理（改良版）
  const handleSwipe = useCallback((product: Product, direction: 'left' | 'right', metadata?: { swipeTime?: number }) => {
    const result = direction === 'right' ? 'yes' : 'no';
    
    // セッションに記録
    if (user?.id) {
      recordSwipeToSession(user.id, product.id, result, product);
    }
    
    // ローカルのスワイプ履歴に追加
    const swipeItem: SwipeHistoryItem = {
      result,
      product,
      timestamp: new Date(),
      swipeTimeMs: metadata?.swipeTime
    };
    setSwipeHistory(prev => [...prev, swipeItem]);
    
    // スワイプ済みリストに追加
    swipedProductsRef.current.add(product.id);
    
    // データベースに記録
    if (user && user.id) {
      InteractionManager.runAfterInteractions(() => {
        recordSwipe(user.id, product.id, result, metadata?.swipeTime)
          .catch(err => console.error('Failed to record swipe:', err));
      });
    }
    
    // 次の商品へ
    setCurrentIndex(prev => prev + 1);
    
    // 残り商品数が少なくなったら追加読み込み
    if (currentIndex >= productsData.products.length - 10 && productsData.hasMore) {
      loadProducts(false);
    }
    
    console.log(`[useProducts] Swiped ${direction} on:`, product.title, 'Result:', result);
  }, [user, currentIndex, productsData.products.length, productsData.hasMore, loadProducts]);

  // 初回ロード
  useEffect(() => {
    if (isInitialized && !loadingRef.current) {
      console.log('[useProducts] Initial load triggered');
      loadProducts(true);
    }
  }, [isInitialized]);

  // フィルター変更時のリロード
  useEffect(() => {
    if (JSON.stringify(filtersRef.current) !== JSON.stringify(filters)) {
      filtersRef.current = filters;
      console.log('[useProducts] Filters changed, reloading products');
      loadProducts(true);
    }
  }, [filters, loadProducts]);

  // リセット関数
  const resetProducts = useCallback(() => {
    console.log('[useProducts] Resetting products');
    setSwipeHistory([]);
    setUserProfile(undefined);
    loadProducts(true);
  }, [loadProducts]);

  // リフレッシュ関数
  const refreshProducts = useCallback(async () => {
    if (refreshing) return;
    setRefreshing(true);
    console.log('[useProducts] Refreshing products');
    await loadProducts(true);
    setRefreshing(false);
  }, [loadProducts, refreshing]);

  // フィルター設定関数
  const setFilters = useCallback((newFilters: FilterOptions) => {
    setActiveFilters(newFilters);
  }, []);

  return {
    products: productsData.products,
    currentIndex,
    currentProduct,
    isLoading,
    error,
    loadMore: loadProducts,
    resetProducts,
    refreshProducts,
    handleSwipe,
    hasMore: productsData.hasMore,
    totalFetched: productsData.totalFetched,
    setFilters,
    userProfile
  };
};

export default useProducts;
