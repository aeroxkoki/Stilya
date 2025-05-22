import { useState, useEffect, useCallback } from 'react';
import { Product, UserPreference } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { 
  getRecommendations,
  analyzeUserPreferences,
  getPopularProducts
} from '@/services/recommendationService';

interface UseRecommendationsReturn {
  recommendations: Product[];
  categoryRecommendations: { [key: string]: Product[] };
  userPreference: UserPreference | null;
  isLoading: boolean;
  error: string | null;
  refreshRecommendations: (skipCache?: boolean) => Promise<void>;
  clearCache: () => void;
}

export const useRecommendations = (limit?: number): UseRecommendationsReturn => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [categoryRecommendations, setCategoryRecommendations] = useState<{ [key: string]: Product[] }>({});
  const [userPreference, setUserPreference] = useState<UserPreference | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cache, setCache] = useState<{ [key: string]: any }>({});

  const clearCache = useCallback(() => {
    setCache({});
  }, []);

  const refreshRecommendations = useCallback(async (skipCache: boolean = false) => {
    const requestLimit = limit || 20;
    
    if (!user?.id) {
      // ログインしていない場合は人気商品を表示
      setIsLoading(true);
      try {
        const popularProducts = await getPopularProducts(requestLimit);
        setRecommendations(popularProducts);
        setError(null);
      } catch (err) {
        console.error('Error fetching popular products:', err);
        setError('商品の取得に失敗しました');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // ユーザーの好み分析
      const preference = await analyzeUserPreferences(user.id);
      setUserPreference(preference);

      // 推薦商品取得
      const recommendedProducts = await getRecommendations(user.id, requestLimit);
      
      if (recommendedProducts.length === 0) {
        // 推薦商品がない場合は人気商品を取得
        const popularProducts = await getPopularProducts(requestLimit);
        setRecommendations(popularProducts);
      } else {
        setRecommendations(recommendedProducts);
      }

      // カテゴリ別の商品を分類
      const categorized: { [key: string]: Product[] } = {};
      recommendedProducts.forEach(product => {
        const category = product.category || 'その他';
        if (!categorized[category]) {
          categorized[category] = [];
        }
        categorized[category].push(product);
      });
      setCategoryRecommendations(categorized);
      
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('推薦商品の取得に失敗しました');
      
      // エラー時は人気商品を取得
      try {
        const popularProducts = await getPopularProducts(requestLimit);
        setRecommendations(popularProducts);
      } catch (fallbackErr) {
        console.error('Error fetching fallback products:', fallbackErr);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, limit]);

  useEffect(() => {
    refreshRecommendations();
  }, [refreshRecommendations]);

  return {
    recommendations,
    categoryRecommendations,
    userPreference,
    isLoading,
    error,
    refreshRecommendations,
    clearCache,
  };
};