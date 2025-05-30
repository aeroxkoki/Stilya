import { supabase } from './supabase';

/**
 * 商品閲覧履歴を記録する
 * @param userId ユーザーID
 * @param productId 商品ID
 */
export const recordProductView = async (
  userId: string,
  productId: string
): Promise<void> => {
  try {
    // 開発モードではモック処理としてログ出力のみ
    if (__DEV__) {
      console.log(`[DEV] Recorded product view: user=${userId}, product=${productId}`);
      return;
    }

    // view_historyテーブルに記録
    const { error } = await supabase
      .from('view_history')
      .insert([
        {
          user_id: userId,
          product_id: productId,
          viewed_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error('Error recording product view:', error);
      throw error;
    }

    console.log(`Product view recorded: user=${userId}, product=${productId}`);
  } catch (error) {
    console.error('Failed to record product view:', error);
    // エラーは外部に伝播させないが、ログに記録
  }
};

/**
 * 商品クリック履歴を記録する（購入ボタンクリック時）
 * @param userId ユーザーID
 * @param productId 商品ID
 */
export const recordProductClick = async (
  userId: string,
  productId: string
): Promise<void> => {
  try {
    // 開発モードではモック処理としてログ出力のみ
    if (__DEV__) {
      console.log(`[DEV] Recorded product click: user=${userId}, product=${productId}`);
      return;
    }

    // click_logsテーブルに記録
    const { error } = await supabase
      .from('click_logs')
      .insert([
        {
          user_id: userId,
          product_id: productId,
          clicked_at: new Date().toISOString(),
        },
      ]);

    if (error) {
      console.error('Error recording product click:', error);
      throw error;
    }

    console.log(`Product click recorded: user=${userId}, product=${productId}`);
  } catch (error) {
    console.error('Failed to record product click:', error);
    // エラーは外部に伝播させないが、ログに記録
  }
};

/**
 * ユーザーの閲覧履歴を取得する
 * @param userId ユーザーID
 * @param limit 取得件数
 */
export const getViewHistory = async (
  userId: string,
  limit: number = 50
): Promise<Array<{ productId: string; viewedAt: string }>> => {
  try {
    // 開発モードではモックデータを返す
    if (__DEV__) {
      console.log(`[DEV] Fetching view history for user: ${userId}`);
      return [];
    }

    const { data, error } = await supabase
      .from('view_history')
      .select('product_id, viewed_at')
      .eq('user_id', userId)
      .order('viewed_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching view history:', error);
      throw error;
    }

    return data.map(item => ({
      productId: item.product_id,
      viewedAt: item.viewed_at,
    }));
  } catch (error) {
    console.error('Failed to fetch view history:', error);
    return [];
  }
};

/**
 * ユーザーのクリック履歴を取得する
 * @param userId ユーザーID
 * @param limit 取得件数
 */
export const getClickHistory = async (
  userId: string,
  limit: number = 50
): Promise<Array<{ productId: string; clickedAt: string }>> => {
  try {
    // 開発モードではモックデータを返す
    if (__DEV__) {
      console.log(`[DEV] Fetching click history for user: ${userId}`);
      return [];
    }

    const { data, error } = await supabase
      .from('click_logs')
      .select('product_id, clicked_at')
      .eq('user_id', userId)
      .order('clicked_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching click history:', error);
      throw error;
    }

    return data.map(item => ({
      productId: item.product_id,
      clickedAt: item.clicked_at,
    }));
  } catch (error) {
    console.error('Failed to fetch click history:', error);
    return [];
  }
};
