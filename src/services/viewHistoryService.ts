import { supabase } from './supabase';
import { recordView, recordClick as recordClickAction } from './clickService';

/**
 * 商品閲覧履歴を記録する
 * click_logsテーブルにaction='view'として記録
 * @param userId ユーザーID
 * @param productId 商品ID
 */
export const recordProductView = async (
  userId: string,
  productId: string
): Promise<void> => {
  try {
    await recordView(userId, productId);
    console.log(`Product view recorded: user=${userId}, product=${productId}`);
  } catch (error) {
    console.error('Failed to record product view:', error);
    // エラーは外部に伝播させないが、ログに記録
  }
};

/**
 * 商品クリック履歴を記録する（購入ボタンクリック時）
 * click_logsテーブルにaction='click'として記録
 * @param userId ユーザーID
 * @param productId 商品ID
 */
export const recordProductClick = async (
  userId: string,
  productId: string
): Promise<void> => {
  try {
    await recordClickAction(userId, productId);
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
      .from('click_logs')
      .select('product_id, created_at')
      .eq('user_id', userId)
      .eq('action', 'view')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching view history:', error);
      throw error;
    }

    return data.map(item => ({
      productId: item.product_id,
      viewedAt: item.created_at,
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
      .select('product_id, created_at')
      .eq('user_id', userId)
      .eq('action', 'click')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching click history:', error);
      throw error;
    }

    return data.map(item => ({
      productId: item.product_id,
      clickedAt: item.created_at,
    }));
  } catch (error) {
    console.error('Failed to fetch click history:', error);
    return [];
  }
};

/**
 * 商品の閲覧・クリック統計を取得する
 * @param productId 商品ID
 */
export const getProductViewStats = async (
  productId: string
): Promise<{
  totalViews: number;
  totalClicks: number;
  clickThroughRate: number;
  lastViewed?: string;
  lastClicked?: string;
}> => {
  try {
    const { data, error } = await supabase
      .from('click_logs')
      .select('action, created_at')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching product stats:', error);
      throw error;
    }

    const views = data.filter(item => item.action === 'view');
    const clicks = data.filter(item => item.action === 'click');

    const totalViews = views.length;
    const totalClicks = clicks.length;
    const clickThroughRate = totalViews > 0 ? (totalClicks / totalViews) * 100 : 0;

    return {
      totalViews,
      totalClicks,
      clickThroughRate: Math.round(clickThroughRate * 100) / 100,
      lastViewed: views[0]?.created_at,
      lastClicked: clicks[0]?.created_at,
    };
  } catch (error) {
    console.error('Failed to fetch product view stats:', error);
    return {
      totalViews: 0,
      totalClicks: 0,
      clickThroughRate: 0,
    };
  }
};
