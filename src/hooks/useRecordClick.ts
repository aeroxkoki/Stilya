import { supabase } from './supabase';
import { useAuth } from '@/hooks/useAuth';

/**
 * 商品クリックを記録する
 * ユーザーが商品をクリックした時にアクセス解析用のログを保存
 */
export const recordProductClick = async (
  userId: string,
  productId: string,
  source: string = 'detail'
): Promise<void> => {
  try {
    if (__DEV__) {
      // 開発環境ではログのみ出力
      console.log(`[Debug] Recorded click: user=${userId}, product=${productId}, source=${source}`);
      return;
    }

    // Supabaseにログを保存
    const { error } = await supabase.from('click_logs').insert({
      user_id: userId,
      product_id: productId,
      source,
    });

    if (error) {
      console.error('Error recording click:', error);
    }
  } catch (error) {
    console.error('Failed to record click:', error);
    // エラーは上位に伝播させない（UIに影響を与えないため）
  }
};

/**
 * クリック記録用のカスタムフック
 * コンポーネント内で簡単に使用できるよう抽象化
 */
export const useRecordClick = () => {
  const { user } = useAuth();

  const recordClick = async (productId: string, source: string = 'swipe') => {
    if (!user) return;
    
    try {
      await recordProductClick(user.id, productId, source);
    } catch (error) {
      console.error('Error in useRecordClick:', error);
    }
  };

  return recordClick;
};
