import { useState, useEffect, useCallback } from 'react';
import { Product, UserPreference } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { 
  getRecommendedProducts,
  analyzeUserPreferences,
  getRecommendationsByCategory
} from '@/services/recommendationService';
import { getSwipeHistory } from '@/services/swipeService';
import { FilterOptions } from '@/components/recommend/FilterModal';

interface UseRecommendationsReturn {
  recommendations: Product[];
  categoryRecommendations: Record<string, Product[]>;
  userPreference: UserPreference | null;
  isLoading: boolean;
  error: string | null;
  refreshRecommendations: () => Promise<void>;
  getFilteredRecommendations: (filters: FilterOptions) => Product[];
}

/**
 * レコメンデーション機能用のカスタムフック
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

  /**
   * ユーザー好みの分析とレコメンデーション取得
   */
  const loadRecommendations = useCallback(async () => {
    if (!user) {
      setError('ユーザー情報が取得できません。ログインしてください。');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      // すでにスワイプした商品のIDを取得
      const swipeHistory = await getSwipeHistory(user.id);
      const swipedProductIds = swipeHistory.map(swipe => swipe.productId);

      // 並行して実行
      const [preferences, recs, catRecs] = await Promise.all([
        // ユーザーの好みを分析
        analyzeUserPreferences(user.id),
        
        // 全体のレコメンデーション取得
        getRecommendedProducts(user.id, limit, swipedProductIds),
        
        // カテゴリ別レコメンデーション取得
        getRecommendationsByCategory(user.id, categories, 5)
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
    }
  }, [user, limit, categories]);

  // 初回レンダリング時にレコメンデーションを読み込む
  useEffect(() => {
    loadRecommendations();
  }, [loadRecommendations]);

  // 手動更新用の関数
  const refreshRecommendations = useCallback(async () => {
    await loadRecommendations();
  }, [loadRecommendations]);

  /**
   * フィルターを適用してレコメンデーション商品を絞り込む
   */
  const getFilteredRecommendations = useCallback((filters: FilterOptions): Product[] => {
    // すべての商品を集める（レコメンド商品とカテゴリ別商品）
    let allProducts: Product[] = [...recommendations];
    
    // カテゴリ別商品も追加
    Object.values(categoryRecommendations).forEach(products => {
      allProducts = [...allProducts, ...products];
    });
    
    // 重複排除（IDで重複チェック）
    const uniqueProducts = Array.from(
      new Map(allProducts.map(product => [product.id, product])).values()
    );
    
    // フィルタリング適用
    return uniqueProducts.filter(product => {
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
    getFilteredRecommendations
  };
};
