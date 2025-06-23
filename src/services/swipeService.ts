import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isOffline } from '@/utils/networkUtils';

// スワイプ結果の型定義
export type SwipeResult = 'yes' | 'no';

// スワイプデータの型定義
export interface SwipeData {
  id: string;
  userId: string;
  productId: string;
  result: SwipeResult;
  createdAt: string; // 必須に変更
}

// オフライン用のスワイプデータストレージキー
const OFFLINE_SWIPE_STORAGE_KEY = 'offline_swipe_data';

/**
 * スワイプ結果を記録する（最適化版）
 * @param userId ユーザーID
 * @param productId 商品ID
 * @param result スワイプ結果 ('yes' or 'no')
 * @returns 保存に成功したかどうか
 */
export const recordSwipe = async (
  userId: string,
  productId: string,
  result: SwipeResult
): Promise<boolean> => {
  if (!userId || !productId) {
    console.warn('Invalid user or product ID for swipe recording');
    return false;
  }
  
  // 既存の処理を再利用（より効率的な実装）
  return saveSwipeResult(userId, productId, result);
};

/**
 * スワイプ結果を保存する
 * @param userId ユーザーID
 * @param productId 商品ID
 * @param result スワイプ結果 ('yes' or 'no')
 * @returns 保存に成功したかどうか
 */
export const saveSwipeResult = async (
  userId: string,
  productId: string,
  result: SwipeResult
): Promise<boolean> => {
  try {
    // ユーザーIDが空の場合は保存しない（ゲストユーザー対応）
    if (!userId || userId === '') {
      console.warn('Cannot save swipe result without valid user ID');
      return false;
    }
    
    const swipeData: SwipeData = {
      userId,
      productId,
      result,
      createdAt: new Date().toISOString(),
      id: `offline_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    };

    // オフラインの場合はローカルに保存
    const networkOffline = await isOffline();
    if (networkOffline) {
      return await saveSwipeOffline(swipeData);
    }

    // オンラインの場合はSupabaseに保存
    const { error } = await supabase
      .from('swipes')
      .insert([
        {
          user_id: userId,
          product_id: productId,
          result,
        },
      ]);

    if (error) throw error;

    // オフラインキャッシュも更新
    await syncOfflineSwipes();
    
    return true;
  } catch (error) {
    console.error('Error saving swipe result:', error);
    // エラー時はオフラインに保存
    const errorSwipeData = {
      userId,
      productId,
      result,
      createdAt: new Date().toISOString(),
      id: `offline_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    };
    return await saveSwipeOffline(errorSwipeData);
  }
};

/**
 * オフラインでのスワイプ結果を保存する
 * @param swipeData スワイプデータ
 * @returns 保存に成功したかどうか
 */
const saveSwipeOffline = async (swipeData: SwipeData): Promise<boolean> => {
  try {
    // 既存のオフラインデータを取得
    const storedData = await AsyncStorage.getItem(OFFLINE_SWIPE_STORAGE_KEY);
    let offlineSwipes: SwipeData[] = storedData ? JSON.parse(storedData) : [];

    // IDを生成して新しいデータを追加
    const newSwipeData = {
      ...swipeData,
      id: `offline_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    };

    // 既存のスワイプをチェック（同じ商品に対して）
    const existingIndex = offlineSwipes.findIndex(
      (item) => item.userId === swipeData.userId && item.productId === swipeData.productId
    );

    if (existingIndex >= 0) {
      // 既存のデータを更新
      offlineSwipes[existingIndex] = newSwipeData;
    } else {
      // 新しいデータを追加
      offlineSwipes.push(newSwipeData);
    }

    // 更新されたデータを保存
    await AsyncStorage.setItem(OFFLINE_SWIPE_STORAGE_KEY, JSON.stringify(offlineSwipes));
    return true;
  } catch (error) {
    console.error('Error saving offline swipe:', error);
    return false;
  }
};

/**
 * オフラインのスワイプデータをサーバーと同期する
 * @returns 同期に成功したかどうか
 */
export const syncOfflineSwipes = async (): Promise<boolean> => {
  try {
    // ネットワーク接続を確認
    const networkOffline = await isOffline();
    if (networkOffline) {
      return false; // オフラインなので同期不可
    }

    // オフラインデータを取得
    const storedData = await AsyncStorage.getItem(OFFLINE_SWIPE_STORAGE_KEY);
    if (!storedData) return true; // 同期するデータなし

    const offlineSwipes: SwipeData[] = JSON.parse(storedData);
    if (offlineSwipes.length === 0) return true; // 同期するデータなし

    // 同期前に存在する商品IDを確認
    const productIds = [...new Set(offlineSwipes.map(swipe => swipe.productId))];
    console.log('[syncOfflineSwipes] Checking product IDs:', productIds);
    
    // external_productsテーブルから存在する商品IDを取得
    const { data: existingProducts, error: checkError } = await supabase
      .from('external_products')
      .select('id')
      .in('id', productIds);
    
    if (checkError) {
      console.error('[syncOfflineSwipes] Error checking products:', checkError);
      throw checkError;
    }
    
    const existingProductIds = new Set(existingProducts?.map(p => p.id) || []);
    console.log('[syncOfflineSwipes] Existing product IDs:', Array.from(existingProductIds));
    
    // 存在する商品のスワイプのみフィルタリング
    const validSwipes = offlineSwipes.filter(swipe => 
      existingProductIds.has(swipe.productId)
    );
    
    console.log(`[syncOfflineSwipes] Valid swipes: ${validSwipes.length}/${offlineSwipes.length}`);
    
    if (validSwipes.length === 0) {
      console.log('[syncOfflineSwipes] No valid swipes to sync');
      // 無効なデータはクリア
      await AsyncStorage.removeItem(OFFLINE_SWIPE_STORAGE_KEY);
      return true;
    }

    // バッチで同期（有効なスワイプのみ）
    const { error } = await supabase.from('swipes').insert(
      validSwipes.map((swipe) => ({
        user_id: swipe.userId,
        product_id: swipe.productId,
        result: swipe.result,
        created_at: swipe.createdAt || new Date().toISOString(),
      }))
    );

    if (error) throw error;

    // 同期完了後、オフラインデータをクリア
    await AsyncStorage.removeItem(OFFLINE_SWIPE_STORAGE_KEY);
    console.log('[syncOfflineSwipes] Successfully synced swipes');
    return true;
  } catch (error) {
    console.error('Error syncing offline swipes:', error);
    return false;
  }
};

/**
 * ユーザーのスワイプ履歴を取得する
 * @param userId ユーザーID
 * @param result オプションの結果フィルタ ('yes' or 'no')
 * @returns スワイプデータの配列
 */
export const getSwipeHistory = async (userId: string, result?: SwipeResult): Promise<SwipeData[]> => {
  try {
    // オンラインデータ取得
    const networkOffline = await isOffline();
    if (!networkOffline) {
      // APIクエリを構築
      let query = supabase
        .from('swipes')
        .select('*')
        .eq('user_id', userId);
      
      // 結果でフィルタリング（オプション）
      if (result) {
        query = query.eq('result', result);
      }
      
      // 順序付けして取得
      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) throw error;

      const onlineSwipes = data.map((item) => ({
        id: item.id,
        userId: item.user_id,
        productId: item.product_id,
        result: item.result as SwipeResult,
        createdAt: item.created_at,
      }));

      // オフラインデータとマージ
      const offlineSwipes = await getOfflineSwipes(userId, result);
      
      // 重複を排除してマージ
      const allSwipes = [...onlineSwipes];
      offlineSwipes.forEach(offlineSwipe => {
        if (!allSwipes.some(s => s.productId === offlineSwipe.productId)) {
          allSwipes.push(offlineSwipe);
        }
      });
      
      return allSwipes;
    } else {
      // オフラインならローカルデータのみ
      return await getOfflineSwipes(userId, result);
    }
  } catch (error) {
    console.error('Error getting swipe history:', error);
    // エラー時はローカルデータから取得
    return await getOfflineSwipes(userId, result);
  }
};

/**
 * ローカルに保存されたスワイプデータを取得する
 * @param userId ユーザーID
 * @param result オプションの結果フィルタ ('yes' or 'no')
 * @returns スワイプデータの配列
 */
const getOfflineSwipes = async (userId: string, result?: SwipeResult): Promise<SwipeData[]> => {
  try {
    const storedData = await AsyncStorage.getItem(OFFLINE_SWIPE_STORAGE_KEY);
    if (!storedData) return [];

    const offlineSwipes: SwipeData[] = JSON.parse(storedData);
    let filteredSwipes = offlineSwipes.filter((swipe) => swipe.userId === userId);
    
    // 結果でフィルタリング（オプション）
    if (result) {
      filteredSwipes = filteredSwipes.filter((swipe) => swipe.result === result);
    }
    
    return filteredSwipes;
  } catch (error) {
    console.error('Error getting offline swipes:', error);
    return [];
  }
};

/**
 * ユーザーが特定の結果でスワイプした商品IDのリストを取得する
 * @param userId ユーザーID
 * @param result スワイプ結果 ('yes' or 'no')
 * @returns 商品IDの配列
 */
export const getSwipedProductIds = async (
  userId: string,
  result?: SwipeResult
): Promise<string[]> => {
  try {
    const swipeHistory = await getSwipeHistory(userId, result);
    
    if (result) {
      // 既にフィルタリング済みの結果から抽出
      return swipeHistory.map((swipe) => swipe.productId);
    } else {
      // すべてのスワイプを含む
      return swipeHistory.map((swipe) => swipe.productId);
    }
  } catch (error) {
    console.error('Error getting swiped product IDs:', error);
    return [];
  }
};

/**
 * オフラインスワイプデータをクリアする（デバッグ用）
 */
export const clearOfflineSwipes = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(OFFLINE_SWIPE_STORAGE_KEY);
    console.log('[clearOfflineSwipes] Offline swipe data cleared');
  } catch (error) {
    console.error('Error clearing offline swipes:', error);
  }
};