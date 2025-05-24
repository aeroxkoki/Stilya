import { supabase } from './supabase';
import { User, Product, ClickLog } from '@/types';

/**
 * ユーザーの閲覧履歴を記録する
 * @param userId ユーザーID
 * @param productId 商品ID
 * @returns 結果
 */
export const recordProductView = async (
  userId: string,
  productId: string
): Promise<boolean> => {
  try {
    // 既存のレコードがあるか確認（重複防止）
    const { data: existingLogs } = await supabase
      .from('view_logs')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', productId)
      .limit(1);

    // 最近の閲覧履歴がある場合は更新せずに終了（同じ商品を短時間に複数回閲覧するケース）
    if (existingLogs && existingLogs.length > 0) {
      const lastViewedTime = new Date(existingLogs[0].created_at);
      const currentTime = new Date();
      const timeDiff = currentTime.getTime() - lastViewedTime.getTime();
      
      // 30分以内の閲覧は記録しない（制限）
      if (timeDiff < 30 * 60 * 1000) {
        return true;
      }
    }

    // 閲覧ログを記録
    const { error } = await supabase
      .from('view_logs')
      .insert({
        user_id: userId,
        product_id: productId,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Failed to record product view:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error recording product view:', err);
    return false;
  }
};

/**
 * ユーザーの閲覧履歴を取得する
 * @param userId ユーザーID
 * @param limit 取得する最大数
 * @returns 閲覧履歴の配列
 */
export const getProductViewHistory = async (
  userId: string,
  limit: number = 50
): Promise<Product[]> => {
  try {
    // 閲覧履歴を最新順に取得
    const { data: viewLogs, error } = await supabase
      .from('view_logs')
      .select('product_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Failed to fetch view history:', error);
      return [];
    }

    if (!viewLogs || viewLogs.length === 0) {
      return [];
    }

    // 閲覧した商品IDを配列に変換
    const productIds = viewLogs.map(log => log.product_id);

    // 商品データを取得
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds);

    if (productsError) {
      console.error('Failed to fetch products for view history:', productsError);
      return [];
    }

    if (!products || products.length === 0) {
      return [];
    }

    // viewLogsの順番を保持して並べ替え（最新の閲覧順）
    const productIdToIndex = new Map();
    viewLogs.forEach((log, index) => {
      productIdToIndex.set(log.product_id, index);
    });

    // データ形式を変換しつつ、閲覧順に並べ替え
    return products
      .map((item: any) => ({
        id: item.id,
        title: item.title,
        brand: item.brand,
        price: item.price,
        imageUrl: item.image_url,
        description: item.description,
        tags: item.tags || [],
        category: item.category,
        affiliateUrl: item.affiliate_url,
        source: item.source,
        createdAt: item.created_at,
      }))
      .sort((a, b) => {
        const indexA = productIdToIndex.get(a.id) || 0;
        const indexB = productIdToIndex.get(b.id) || 0;
        return indexA - indexB;
      });
  } catch (err) {
    console.error('Error getting product view history:', err);
    return [];
  }
};

/**
 * ユーザーのクリックログ記録する
 * @param userId ユーザーID
 * @param productId 商品ID
 * @returns 結果
 */
export const recordProductClick = async (
  userId: string,
  productId: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('click_logs')
      .insert({
        user_id: userId,
        product_id: productId,
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('Failed to record product click:', error);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error recording product click:', err);
    return false;
  }
};
