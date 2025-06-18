import { supabase } from './supabase';
import { ClickLog } from '@/types';

/**
 * 商品アクションのログを記録する（汎用メソッド）
 * @param userId ユーザーID
 * @param productId 商品ID
 * @param action アクションタイプ（view, click, purchase）
 */
export const recordAction = async (
  userId: string,
  productId: string,
  action: 'view' | 'click' | 'purchase'
): Promise<ClickLog | null> => {
  try {
    // 開発モードではモック処理としてログ出力のみ
    if (__DEV__) {
      console.log(`[DEV] Recorded ${action}: user=${userId}, product=${productId}`);
      return {
        id: 'mock-id',
        userId,
        productId,
        action,
        createdAt: new Date().toISOString(),
      };
    }

    const { data, error } = await supabase
      .from('click_logs')
      .insert([
        {
          user_id: userId,
          product_id: productId,
          action: action,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error(`Error recording ${action}:`, error);
      return null;
    }

    // Supabaseからの応答をアプリの型に変換
    return {
      id: data.id,
      userId: data.user_id,
      productId: data.product_id,
      action: data.action,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error(`Failed to record ${action}:`, error);
    return null;
  }
};

/**
 * 商品詳細画面の表示を記録する
 * @param userId ユーザーID
 * @param productId 商品ID
 */
export const recordView = async (
  userId: string,
  productId: string
): Promise<ClickLog | null> => {
  return recordAction(userId, productId, 'view');
};

/**
 * 商品クリック（購入ボタン）のログを記録する
 * @param userId ユーザーID
 * @param productId 商品ID
 */
export const recordClick = async (
  userId: string,
  productId: string
): Promise<ClickLog | null> => {
  return recordAction(userId, productId, 'click');
};

/**
 * 購入完了のログを記録する（将来の実装用）
 * @param userId ユーザーID
 * @param productId 商品ID
 */
export const recordPurchase = async (
  userId: string,
  productId: string
): Promise<ClickLog | null> => {
  return recordAction(userId, productId, 'purchase');
};

/**
 * 特定のユーザーのアクションログを取得する
 * @param userId ユーザーID
 * @param action アクションタイプ（指定しない場合は全て）
 * @param limit 取得数の上限
 */
export const getActionHistory = async (
  userId: string,
  action?: 'view' | 'click' | 'purchase',
  limit = 50
): Promise<ClickLog[]> => {
  try {
    let query = supabase
      .from('click_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (action) {
      query = query.eq('action', action);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching action history:', error);
      throw new Error(error.message);
    }

    // Supabaseからの応答をアプリの型に変換
    return data.map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      productId: item.product_id,
      action: item.action,
      createdAt: item.created_at,
    }));
  } catch (error) {
    console.error('Failed to fetch action history:', error);
    return [];
  }
};

/**
 * 特定のユーザーのクリック履歴を取得する（後方互換性のため維持）
 * @param userId ユーザーID
 * @param limit 取得数の上限
 */
export const getClickHistory = async (
  userId: string,
  limit = 50
): Promise<ClickLog[]> => {
  return getActionHistory(userId, 'click', limit);
};

/**
 * 商品のクリック統計を取得する
 * @param productId 商品ID
 */
export const getProductStats = async (
  productId: string
): Promise<{
  views: number;
  clicks: number;
  ctr: number; // Click Through Rate
}> => {
  try {
    const { data, error } = await supabase
      .from('click_logs')
      .select('action')
      .eq('product_id', productId);

    if (error) {
      console.error('Error fetching product stats:', error);
      throw new Error(error.message);
    }

    const views = data.filter(item => item.action === 'view').length;
    const clicks = data.filter(item => item.action === 'click').length;
    const ctr = views > 0 ? (clicks / views) * 100 : 0;

    return {
      views,
      clicks,
      ctr: Math.round(ctr * 100) / 100, // 小数点2桁まで
    };
  } catch (error) {
    console.error('Failed to fetch product stats:', error);
    return { views: 0, clicks: 0, ctr: 0 };
  }
};
