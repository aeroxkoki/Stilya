import { supabase } from './supabase';
import { ClickLog } from '@/types';

/**
 * 商品クリックのログを記録する
 * @param userId ユーザーID
 * @param productId 商品ID
 */
export const recordClick = async (
  userId: string,
  productId: string
): Promise<ClickLog | null> => {
  try {
    // 開発モードではモック処理としてログ出力のみ
    if (__DEV__) {
      console.log(`[DEV] Recorded click: user=${userId}, product=${productId}`);
      return {
        id: 'mock-id',
        userId,
        productId,
        createdAt: new Date().toISOString(),
      };
    }

    const { data, error } = await supabase
      .from('click_logs')
      .insert([
        {
          user_id: userId,
          product_id: productId,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error recording click:', error);
      return null;
    }

    // Supabaseからの応答をアプリの型に変換
    return {
      id: data.id,
      userId: data.user_id,
      productId: data.product_id,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('Failed to record click:', error);
    return null;
  }
};

/**
 * 特定のユーザーのクリックログを取得する
 * @param userId ユーザーID
 * @param limit 取得数の上限
 */
export const getClickHistory = async (
  userId: string,
  limit = 50
): Promise<ClickLog[]> => {
  try {
    const { data, error } = await supabase
      .from('click_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching click history:', error);
      throw new Error(error.message);
    }

    // Supabaseからの応答をアプリの型に変換
    return data.map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      productId: item.product_id,
      createdAt: item.created_at,
    }));
  } catch (error) {
    console.error('Failed to fetch click history:', error);
    return [];
  }
};
