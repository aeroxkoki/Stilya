import { useCallback, useRef } from 'react';
import { Animated, Dimensions } from 'react-native';
import { saveSwipeResult } from '@/services/swipeService';
import { ImprovedRecommendationService } from '@/services/improvedRecommendationService';
import { Product } from '@/types';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120; // この値以上スワイプしたらアクションを実行
const CARD_WIDTH = width * 0.9;

interface UseSwipeProps {
  userId: string | undefined;
  onSwipeComplete?: (direction: 'left' | 'right', product: Product) => void;
  onSuggestBreak?: () => void; // 休憩提案用のコールバック
}

/**
 * スワイプジェスチャーのロジックを扱うカスタムフック
 * React Native標準のAnimated APIを使用
 * 改善版：セッション記録と連続No対応を追加
 */
export const useSwipe = ({ userId, onSwipeComplete, onSuggestBreak }: UseSwipeProps) => {
  // 処理中フラグ（二重実行防止）
  const isProcessing = useRef(false);
  // 連続Noカウンター
  const consecutiveNoCount = useRef(0);
  
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
          
          // セッションに記録（改善版推薦サービス）
          ImprovedRecommendationService.recordSwipeToSession(
            userId,
            product.id,
            'no',
            product
          );
          
          // 連続Noカウントを増やす
          consecutiveNoCount.current++;
          
          // 5連続Noで休憩提案
          if (consecutiveNoCount.current >= 5 && onSuggestBreak) {
            onSuggestBreak();
          }
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
    [userId, onSwipeComplete, onSuggestBreak]
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
          
          // セッションに記録（改善版推薦サービス）
          ImprovedRecommendationService.recordSwipeToSession(
            userId,
            product.id,
            'yes',
            product
          );
          
          // Yesの場合は連続Noカウントをリセット
          consecutiveNoCount.current = 0;
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
