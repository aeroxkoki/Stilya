import { useState, useEffect, useCallback, useRef } from 'react';
import { Product, UserPreference } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/services/supabase';
import { 
  getRecommendations,
  analyzeUserPreferences
} from '@/services/recommendationService';
import {
  getEnhancedRecommendations,
  analyzeEnhancedPreferences
} from '@/services/enhancedRecommendationService';
import { ImprovedRecommendationService } from '@/services/improvedRecommendationService';
import { fetchProducts } from '@/services/productService';

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
  isEnhancedMode: boolean;
  isImprovedMode: boolean; // 改善版モードフラグ
  shouldSuggestBreak?: boolean; // 休憩提案フラグ
}

export const useRecommendations = (): UseRecommendationsReturn => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [userPreference, setUserPreference] = useState<UserPreference | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEnhancedMode, setIsEnhancedMode] = useState(false);
  const [isImprovedMode, setIsImprovedMode] = useState(true); // デフォルトで改善版を使用
  const [shouldSuggestBreak, setShouldSuggestBreak] = useState(false);
  const abTestChecked = useRef(false);

  // A/Bテストの割り当てを確認（将来的に使用）
  const checkABTestVariant = useCallback(async () => {
    if (!user?.id || abTestChecked.current) return;
    
    try {
      // 現在は全ユーザーに改善版を適用
      setIsImprovedMode(true);
      console.log('[useRecommendations] Using improved recommendation algorithm');
      
      abTestChecked.current = true;
    } catch (error) {
      console.error('[useRecommendations] Error checking AB test:', error);
    }
  }, [user?.id]);

  const refreshRecommendations = useCallback(async () => {
    if (!user?.id) {
      // ログインしていない場合は人気商品を表示
      setIsLoading(true);
      try {
        const result = await fetchProducts(20, 0);
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
      // A/Bテストの割り当てを確認
      await checkABTestVariant();

      // ユーザーの好み分析（enhanced版またはオリジナル版）
      if (isEnhancedMode) {
        const preferenceResult = await analyzeEnhancedPreferences(user.id) as ApiResponse<any>;
        if (preferenceResult.success && preferenceResult.data) {
          // Enhanced版は詳細な分析結果を持つが、UserPreferenceインターフェースに合わせる
          setUserPreference({
            userId: user.id,
            likedTags: preferenceResult.data.likedTags || [],
            dislikedTags: preferenceResult.data.dislikedTags || [],
            preferredCategories: preferenceResult.data.preferredCategories || [],
            avgPriceRange: preferenceResult.data.avgPriceRange || { min: 0, max: 100000 },
            brands: preferenceResult.data.brand_loyalty?.topBrands || [],
            topTags: (preferenceResult.data.likedTags || []).slice(0, 5),
            price_range: preferenceResult.data.avgPriceRange || { min: 0, max: 100000 }
          });
        }
      } else {
        const preferenceResult = await analyzeUserPreferences(user.id) as ApiResponse<UserPreference>;
        if (preferenceResult.success && preferenceResult.data) {
          setUserPreference(preferenceResult.data);
        }
      }

      // 推薦商品取得（改善版、enhanced版、オリジナル版）
      let recommendResult: ApiResponse<Product[]> & { suggestBreak?: boolean };
      
      if (isImprovedMode) {
        console.log('[useRecommendations] Using improved recommendation algorithm');
        recommendResult = await ImprovedRecommendationService.getImprovedRecommendations(user.id, 20) as ApiResponse<Product[]> & { suggestBreak?: boolean };
        
        // 休憩提案フラグをチェック
        if (recommendResult.suggestBreak) {
          setShouldSuggestBreak(true);
        }
      } else if (isEnhancedMode) {
        console.log('[useRecommendations] Using enhanced recommendation algorithm');
        recommendResult = await getEnhancedRecommendations(user.id, 20) as ApiResponse<Product[]>;
      } else {
        recommendResult = await getRecommendations(user.id, 20) as ApiResponse<Product[]>;
      }
      
      if (recommendResult.success && recommendResult.data && recommendResult.data.length > 0) {
        setRecommendations(recommendResult.data);
      } else {
        // 推薦商品がない場合は人気商品を取得
        const popularResult = await fetchProducts(20, 0);
        if (popularResult.success && popularResult.data) {
          setRecommendations(popularResult.data);
        }
      }
    } catch (err) {
      console.error('Error fetching recommendations:', err);
      setError('推薦商品の取得に失敗しました');
      
      // エラー時は人気商品を取得
      try {
        const popularResult = await fetchProducts(20, 0);
        if (popularResult.success && popularResult.data) {
          setRecommendations(popularResult.data);
        }
      } catch (fallbackErr) {
        console.error('Error fetching fallback products:', fallbackErr);
      }
    } finally {
      setIsLoading(false);
    }
  }, [user?.id, isEnhancedMode, isImprovedMode, checkABTestVariant]);

  useEffect(() => {
    refreshRecommendations();
  }, [refreshRecommendations]);

  return {
    recommendations,
    userPreference,
    isLoading,
    error,
    refreshRecommendations,
    isEnhancedMode,
    isImprovedMode,
    shouldSuggestBreak,
  };
};
