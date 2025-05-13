import { supabase } from './supabase';
import { Swipe } from '@/types';

/**
 * スワイプ結果を保存する
 * @param userId ユーザーID
 * @param productId 商品ID
 * @param result 'yes' または 'no'
 */
export const saveSwipeResult = async (
  userId: string,
  productId: string,
  result: 'yes' | 'no'
): Promise<Swipe | null> => {
  try {
    // 開発モード（__DEV__）ではモック処理としてログ出力のみ行い、
    // 成功したことにする
    if (__DEV__) {
      console.log(`[DEV] Saved swipe result: ${userId} ${result} ${productId}`);
      return {
        id: 'mock-id',
        userId,
        productId,
        result,
        createdAt: new Date().toISOString(),
      };
    }

    const { data, error } = await supabase
      .from('swipes')
      .insert([
        {
          user_id: userId,
          product_id: productId,
          result,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error saving swipe result:', error);
      throw new Error(error.message);
    }

    // Supabaseからの応答をアプリの型に変換
    return {
      id: data.id,
      userId: data.user_id,
      productId: data.product_id,
      result: data.result,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('Failed to save swipe result:', error);
    return null;
  }
};

/**
 * ユーザーのスワイプ履歴を取得する
 * @param userId ユーザーID
 * @param result 結果でフィルタリング（オプション）
 * @param limit 取得数の上限
 */
export const getSwipeHistory = async (
  userId: string,
  result?: 'yes' | 'no',
  limit = 50
): Promise<Swipe[]> => {
  try {
    let query = supabase
      .from('swipes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    // 結果でフィルターする場合
    if (result) {
      query = query.eq('result', result);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching swipe history:', error);
      throw new Error(error.message);
    }

    // Supabaseからの応答をアプリの型に変換
    return data.map((item: any) => ({
      id: item.id,
      userId: item.user_id,
      productId: item.product_id,
      result: item.result,
      createdAt: item.created_at,
    }));
  } catch (error) {
    console.error('Failed to fetch swipe history:', error);
    return [];
  }
};

/**
 * 特定の商品に対するスワイプ結果を取得する
 * @param userId ユーザーID
 * @param productId 商品ID
 */
export const getSwipeForProduct = async (
  userId: string,
  productId: string
): Promise<Swipe | null> => {
  try {
    const { data, error } = await supabase
      .from('swipes')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // レコードが見つからない場合
        return null;
      }
      console.error('Error fetching swipe for product:', error);
      throw new Error(error.message);
    }

    // Supabaseからの応答をアプリの型に変換
    return {
      id: data.id,
      userId: data.user_id,
      productId: data.product_id,
      result: data.result,
      createdAt: data.created_at,
    };
  } catch (error) {
    console.error('Failed to fetch swipe for product:', error);
    return null;
  }
};
