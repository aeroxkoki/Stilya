import { useState, useEffect, useCallback } from 'react';
import { Product, UserPreference } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { 
  getRecommendations,
  analyzeUserPreferences,
  getPopularProducts
} from '@/services/recommendationService';

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

interface UseRecommendationsReturn {
  recommendations: Product[];
  userPreference: UserPreference | null;
  isLoading: boolean;
  error: string | null;
  refreshRecommendations: () => Promise<void>;
}

export const useRecommendations = (): UseRecommendationsReturn => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [userPreference, setUserPreference] = useState<UserPreference | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refreshRecommendations = useCallback(async () => {
    if (!user?.id) {
      // ログインしていない場合は人気商品を表示
      setIsLoading(true);
      try {
        const result = await getPopularProducts(20) as ApiResponse<Product[]>;
        if (result.success && result.data) {
          setRecommendations(result.data);
          setError(null);
        } else {
          setError(result.error || '商品の取得に失敗しました');
        }
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
      const preferenceResult = await analyzeUserPreferences(user.id) as ApiResponse<UserPreference>;
      if (preferenceResult.success && preferenceResult.data) {
        setUserPreference(preferenceResult.data);
      }

      // 推薦商品取得
      const recommendResult = await getRecommendations(user.id, 20) as ApiResponse<Product[]>;
      
      if (recommendResult.success && recommendResult.data && recommendResult.data.length > 0) {
        setRecommendations(recommendResult.data);
      } else {
        // 推薦商品がない場合は人気商品を取得
        const popularResult = await getPopularProducts(20) as ApiResponse<Product[]>;
        if (popularResult.success && popularResult.data) {
          setRecommendations(popularResult.data);
        }
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('推薦商品の取得に失敗しました');
      
      // エラー時は人気商品を取得
      try {
        const popularResult = await getPopularProducts(20) as ApiResponse<Product[]>;
        if (popularResult.success && popularResult.data) {
          setRecommendations(popularResult.data);
        }
      } catch (fallbackErr) {
        console.error('Error fetching fallback products:', fallbackErr);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    refreshRecommendations();
  }, [refreshRecommendations]);

  return {
    recommendations,
    userPreference,
    isLoading,
    error,
    refreshRecommendations,
  };
};
