import { useCallback, useRef } from 'react';
import { Animated, Dimensions } from 'react-native';
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
 * React Native標準のAnimated APIを使用
 */
export const useSwipe = ({ userId, onSwipeComplete }: UseSwipeProps) => {
  // 処理中フラグ（二重実行防止）
  const isProcessing = useRef(false);
  
  // スワイプ左（NO）の処理
  const handleSwipeLeft = useCallback(
    async (product: Product) => {
      // 二重実行防止
      if (isProcessing.current) {
        console.log('[useSwipe] Swipe already processing, ignoring...');
        return;
      }
      
      isProcessing.current = true;
      
      try {
        // ユーザーIDがあればスワイプ結果を保存
        if (userId) {
          await saveSwipeResult(userId, product.id, 'no');
        }

        // コールバックを実行
        if (onSwipeComplete) {
          onSwipeComplete('left', product);
        }
      } catch (err) {
        console.error('Error saving NO swipe result:', err);
      } finally {
        // 少し待ってからフラグをリセット（連続タップ防止）
        setTimeout(() => {
          isProcessing.current = false;
        }, 300);
      }
    },
    [userId, onSwipeComplete]
  );

  // スワイプ右（YES）の処理
  const handleSwipeRight = useCallback(
    async (product: Product) => {
      // 二重実行防止
      if (isProcessing.current) {
        console.log('[useSwipe] Swipe already processing, ignoring...');
        return;
      }
      
      isProcessing.current = true;
      
      try {
        // ユーザーIDがあればスワイプ結果を保存
        if (userId) {
          await saveSwipeResult(userId, product.id, 'yes');
        }

        // コールバックを実行
        if (onSwipeComplete) {
          onSwipeComplete('right', product);
        }
      } catch (err) {
        console.error('Error saving YES swipe result:', err);
      } finally {
        // 少し待ってからフラグをリセット（連続タップ防止）
        setTimeout(() => {
          isProcessing.current = false;
        }, 300);
      }
    },
    [userId, onSwipeComplete]
  );

  return {
    // スワイプアクション
    handleSwipeLeft,
    handleSwipeRight,
    
    // 定数
    SWIPE_THRESHOLD,
    CARD_WIDTH,
  };
};
