import { useState, useEffect, useCallback, useRef } from 'react';
import { Product, UserPreference } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { 
  getRecommendedProducts,
  analyzeUserPreferences,
  getRecommendationsByCategory,
  clearRecommendationCaches
} from '@/services/recommendationService';
import { getSwipeHistory } from '@/services/swipeService';
import { FilterOptions } from '@/components/recommend/FilterModal';

interface UseRecommendationsReturn {
  recommendations: Product[];
  categoryRecommendations: Record<string, Product[]>;
  userPreference: UserPreference | null;
  isLoading: boolean;
  error: string | null;
  refreshRecommendations: (skipCache?: boolean) => Promise<void>;
  getFilteredRecommendations: (filters: FilterOptions) => Product[];
  clearCache: () => void;
}

/**
 * レコメンデーション機能用のカスタムフック（最適化版）
 * キャッシュ機能、バッチ処理などのパフォーマンス最適化を追加
 */
export const useRecommendations = (
  limit: number = 20,
  categories: string[] = ['tops', 'bottoms', 'outerwear', 'accessories']
): UseRecommendationsReturn => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [categoryRecommendations, setCategoryRecommendations] = useState<Record<string, Product[]>>({});
  const [userPreference, setUserPreference] = useState<UserPreference | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // ローディング中のフラグ（並行リクエスト防止）
  const isLoadingRef = useRef(false);

  /**
   * ユーザー好みの分析とレコメンデーション取得
   * @param skipCache キャッシュをスキップする場合はtrue
   */
  const loadRecommendations = useCallback(async (skipCache: boolean = false) => {
    if (!user) {
      setError('ユーザー情報が取得できません。ログインしてください。');
      setIsLoading(false);
      return;
    }

    // すでにローディング中なら処理をスキップ（連打防止）
    if (isLoadingRef.current) {
      console.log('Already loading recommendations, request ignored');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      isLoadingRef.current = true;

      // すでにスワイプした商品のIDを取得
      const swipeHistory = await getSwipeHistory(user.id);
      const swipedProductIds = swipeHistory.map(swipe => swipe.productId);

      // 並行して実行（各関数内部でキャッシュ機能を使用）
      const [preferences, recs, catRecs] = await Promise.all([
        // ユーザーの好みを分析
        analyzeUserPreferences(user.id, skipCache),
        
        // 全体のレコメンデーション取得
        getRecommendedProducts(user.id, limit, swipedProductIds, skipCache),
        
        // カテゴリ別レコメンデーション取得
        getRecommendationsByCategory(user.id, categories, 5, skipCache)
      ]);

      // ステート更新
      setUserPreference(preferences);
      setRecommendations(recs);
      setCategoryRecommendations(catRecs);
    } catch (err) {
      console.error('Error loading recommendations:', err);
      setError('おすすめ商品の読み込みに失敗しました。');
    } finally {
      setIsLoading(false);
      isLoadingRef.current = false;
    }
  }, [user, limit, categories]);

  // 初回レンダリング時にレコメンデーションを読み込む
  useEffect(() => {
    if (user) {
      loadRecommendations();
    }
  }, [loadRecommendations, user]);

  // キャッシュをスキップして更新する場合のフラグ付き更新関数
  const refreshRecommendations = useCallback(async (skipCache: boolean = true) => {
    await loadRecommendations(skipCache);
  }, [loadRecommendations]);

  // キャッシュをクリアする関数
  const clearCache = useCallback(() => {
    clearRecommendationCaches();
  }, []);

  /**
   * フィルターを適用してレコメンデーション商品を絞り込む
   * キャッシュなし - 毎回新しく計算（UIの即時反応のため）
   */
  const getFilteredRecommendations = useCallback((filters: FilterOptions): Product[] => {
    // すべての商品を集める（重複排除済み）
    const allProductsMap = new Map<string, Product>();
    
    // メインのレコメンデーション商品を追加
    recommendations.forEach(product => {
      allProductsMap.set(product.id, product);
    });
    
    // カテゴリ別商品も追加
    Object.values(categoryRecommendations).forEach(products => {
      products.forEach(product => {
        if (!allProductsMap.has(product.id)) {
          allProductsMap.set(product.id, product);
        }
      });
    });
    
    // Map から配列へ変換
    const allProducts = Array.from(allProductsMap.values());
    
    // フィルタリング適用
    return allProducts.filter(product => {
      // カテゴリフィルター
      if (filters.categories.length > 0 && product.category) {
        if (!filters.categories.includes(product.category)) {
          return false;
        }
      }
      
      // 価格フィルター
      if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
        return false;
      }
      
      // タグフィルター
      if (filters.selectedTags.length > 0 && product.tags) {
        // いずれかのタグが含まれていればOK
        const hasAnyTag = filters.selectedTags.some(tag => 
          product.tags?.includes(tag)
        );
        if (!hasAnyTag) {
          return false;
        }
      }
      
      return true;
    });
  }, [recommendations, categoryRecommendations]);

  return {
    recommendations,
    categoryRecommendations,
    userPreference,
    isLoading,
    error,
    refreshRecommendations,
    getFilteredRecommendations,
    clearCache
  };
};
