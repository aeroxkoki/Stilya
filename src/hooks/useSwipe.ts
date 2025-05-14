import { useCallback } from 'react';
// import { useSharedValue, withSpring, withTiming } from 'react-native-reanimated';
// Reanimatedのモック
const useSharedValue = (initialValue: any) => ({ value: initialValue });
const withSpring = (toValue: any, config?: any) => toValue;
const withTiming = (toValue: any, config?: any) => toValue;
import { Dimensions } from 'react-native';
import { saveSwipeResult } from '@/services/swipeService';
import { Product } from '@/types';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120; // この値以上スワイプしたらアクションを実行
const CARD_WIDTH = width * 0.9;

interface UseSwipeProps {
  userId: string | undefined;
  onSwipeComplete?: (direction: 'left' | 'right', product: Product) => void;
}

/**
 * スワイプジェスチャーのロジックを扱うカスタムフック
 */
export const useSwipe = ({ userId, onSwipeComplete }: UseSwipeProps) => {
  // Reanimated 2のSharedValue
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);

  // スワイプ左（NO）の処理
  const handleSwipeLeft = useCallback(
    async (product: Product) => {
      // アニメーション
      translateX.value = withSpring(-CARD_WIDTH - 100, { damping: 15 });
      
      // ユーザーIDがあればスワイプ結果を保存
      if (userId) {
        try {
          await saveSwipeResult(userId, product.id, 'no');
        } catch (err) {
          console.error('Error saving NO swipe result:', err);
        }
      }

      // コールバックを実行
      if (onSwipeComplete) {
        onSwipeComplete('left', product);
      }
    },
    [userId, translateX, onSwipeComplete]
  );

  // スワイプ右（YES）の処理
  const handleSwipeRight = useCallback(
    async (product: Product) => {
      // アニメーション
      translateX.value = withSpring(CARD_WIDTH + 100, { damping: 15 });
      
      // ユーザーIDがあればスワイプ結果を保存
      if (userId) {
        try {
          await saveSwipeResult(userId, product.id, 'yes');
        } catch (err) {
          console.error('Error saving YES swipe result:', err);
        }
      }

      // コールバックを実行
      if (onSwipeComplete) {
        onSwipeComplete('right', product);
      }
    },
    [userId, translateX, onSwipeComplete]
  );

  // リセット処理
  const resetPosition = useCallback(() => {
    translateX.value = withSpring(0, { damping: 15 });
    translateY.value = withSpring(0, { damping: 15 });
    rotation.value = withTiming(0, { duration: 200 });
    scale.value = withTiming(1, { duration: 200 });
  }, [translateX, translateY, rotation, scale]);

  // スワイプ開始時の処理
  const handleSwipeStart = useCallback(() => {
    scale.value = withTiming(1.05, { duration: 200 });
  }, [scale]);

  return {
    // Animated値
    translateX,
    translateY,
    scale,
    rotation,
    
    // スワイプアクション
    handleSwipeLeft,
    handleSwipeRight,
    handleSwipeStart,
    resetPosition,
    
    // 定数
    SWIPE_THRESHOLD,
    CARD_WIDTH,
  };
};
