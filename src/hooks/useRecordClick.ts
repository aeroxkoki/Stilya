import { useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { recordClick } from '@/services/clickService';

/**
 * 商品クリックログを記録するためのフック
 */
export const useRecordClick = () => {
  const { user } = useAuth();

  const recordProductClick = useCallback(
    (productId: string) => {
      if (!user) return;
      
      try {
        // クリックログを非同期で記録
        recordClick(user.id, productId).catch(error => {
          console.error('Failed to record click:', error);
          // エラーがあっても処理は続行（ユーザー体験への影響なし）
        });
      } catch (error) {
        console.error('Error in recordProductClick:', error);
      }
    },
    [user]
  );

  return recordProductClick;
};
