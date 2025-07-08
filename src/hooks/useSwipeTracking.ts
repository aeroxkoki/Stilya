import { useCallback, useRef } from 'react';
import { updateSessionLearning } from '@/services/enhancedRecommendationService';
import { useAuth } from './useAuth';

export const useSwipeTracking = () => {
  const { user } = useAuth();
  const swipeStartTime = useRef<number>(0);

  const startSwipeTracking = useCallback(() => {
    swipeStartTime.current = Date.now();
  }, []);

  const trackSwipe = useCallback(async (
    productId: string,
    result: 'yes' | 'no'
  ) => {
    if (!user?.id) return;

    const responseTime = Date.now() - swipeStartTime.current;
    
    // セッション学習を更新
    updateSessionLearning(user.id, {
      productId,
      result,
      responseTime,
    });

    // 通常のスワイプ記録も継続
    // ... 既存のスワイプ記録処理
  }, [user?.id]);

  return {
    startSwipeTracking,
    trackSwipe,
  };
};
