import { useState, useEffect, useCallback } from 'react';
import { Product, UserPreference } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { 
  getRecommendedProducts,
  analyzeUserPreferences,
  getRecommendationsByCategory
} from '@/services/recommendationService';
import { getSwipeHistory } from '@/services/swipeService';

interface UseRecommendationsReturn {
  recommendations: Product[];
  categoryRecommendations: Record<string, Product[]>;
  userPreference: UserPreference | null;
  isLoading: boolean;
  error: string | null;
  refreshRecommendations: () => Promise<void>;
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

  return {
    recommendations,
    categoryRecommendations,
    userPreference,
    isLoading,
    error,
    refreshRecommendations
  };
};
