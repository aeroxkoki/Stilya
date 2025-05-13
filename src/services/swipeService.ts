import { supabase } from './supabase';
import { Swipe } from '@/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// オフラインスワイプキャッシュ用のキー
const OFFLINE_SWIPES_KEY = 'stilya_offline_swipes';

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

    // ネットワーク状態をチェック
    const netInfo = await NetInfo.fetch();
    
    // スワイプデータの作成
    const swipeData = {
      user_id: userId,
      product_id: productId,
      result,
      created_at: new Date().toISOString(),
    };

    // オフラインの場合はローカルストレージに保存
    if (!netInfo.isConnected) {
      await saveSwipeOffline(userId, productId, result);
      
      // オフラインでの仮のレスポンスを返す
      return {
        id: `offline-${Date.now()}`,
        userId,
        productId,
        result,
        createdAt: new Date().toISOString(),
      };
    }

    // オンラインならSupabaseに保存
    const { data, error } = await supabase
      .from('swipes')
      .insert([swipeData])
      .select()
      .single();

    if (error) {
      console.error('Error saving swipe result:', error);
      // エラー時もオフラインキャッシュに保存
      await saveSwipeOffline(userId, productId, result);
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
 * オフラインスワイプデータをローカルに保存
 */
const saveSwipeOffline = async (
  userId: string,
  productId: string,
  result: 'yes' | 'no'
) => {
  try {
    // 現在のオフラインデータを取得
    const offlineSwipesJSON = await AsyncStorage.getItem(OFFLINE_SWIPES_KEY);
    let offlineSwipes: Array<{
      userId: string;
      productId: string;
      result: 'yes' | 'no';
      timestamp: string;
    }> = [];
    
    if (offlineSwipesJSON) {
      offlineSwipes = JSON.parse(offlineSwipesJSON);
    }
    
    // 新しいスワイプを追加
    offlineSwipes.push({
      userId,
      productId,
      result,
      timestamp: new Date().toISOString(),
    });
    
    // 保存
    await AsyncStorage.setItem(OFFLINE_SWIPES_KEY, JSON.stringify(offlineSwipes));
    
    console.log('Swipe saved offline. Will sync when online.');
  } catch (error) {
    console.error('Error saving swipe offline:', error);
  }
};

/**
 * オフラインスワイプデータを同期する（オンラインに戻った時に呼び出す）
 */
export const syncOfflineSwipes = async () => {
  try {
    // ネットワーク状態をチェック
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      console.log('Still offline. Cannot sync swipes.');
      return false;
    }
    
    // オフラインデータを取得
    const offlineSwipesJSON = await AsyncStorage.getItem(OFFLINE_SWIPES_KEY);
    if (!offlineSwipesJSON) {
      return true; // 同期するデータがない
    }
    
    const offlineSwipes = JSON.parse(offlineSwipesJSON);
    if (offlineSwipes.length === 0) {
      return true; // 同期するデータがない
    }
    
    console.log(`Syncing ${offlineSwipes.length} offline swipes...`);
    
    // Supabaseの一括挿入用の形式に変換
    const swipesForInsert = offlineSwipes.map((swipe: any) => ({
      user_id: swipe.userId,
      product_id: swipe.productId,
      result: swipe.result,
      created_at: swipe.timestamp,
    }));
    
    // Supabaseに一括挿入
    const { error } = await supabase
      .from('swipes')
      .insert(swipesForInsert);
    
    if (error) {
      console.error('Error syncing offline swipes:', error);
      return false;
    }
    
    // 同期に成功したらローカルデータをクリア
    await AsyncStorage.removeItem(OFFLINE_SWIPES_KEY);
    console.log('Offline swipes synced successfully');
    return true;
  } catch (error) {
    console.error('Failed to sync offline swipes:', error);
    return false;
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
    // オフラインの場合はローカルのスワイプデータを使用
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      const offlineSwipes = await getOfflineSwipes(userId, result);
      return offlineSwipes;
    }

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
 * ローカルに保存されたオフラインスワイプを取得
 */
const getOfflineSwipes = async (
  userId: string,
  result?: 'yes' | 'no'
): Promise<Swipe[]> => {
  try {
    const offlineSwipesJSON = await AsyncStorage.getItem(OFFLINE_SWIPES_KEY);
    if (!offlineSwipesJSON) {
      return [];
    }
    
    const offlineSwipes = JSON.parse(offlineSwipesJSON);
    
    // ユーザーIDでフィルタリング
    let filteredSwipes = offlineSwipes.filter(
      (swipe: any) => swipe.userId === userId
    );
    
    // 結果でフィルタリング（オプション）
    if (result) {
      filteredSwipes = filteredSwipes.filter(
        (swipe: any) => swipe.result === result
      );
    }
    
    // Swipe型に変換
    return filteredSwipes.map((swipe: any) => ({
      id: `offline-${swipe.timestamp}`,
      userId: swipe.userId,
      productId: swipe.productId,
      result: swipe.result,
      createdAt: swipe.timestamp,
    }));
  } catch (error) {
    console.error('Error getting offline swipes:', error);
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
    // オフラインの場合はローカルのスワイプデータを確認
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      const offlineSwipes = await getOfflineSwipes(userId);
      const offlineSwipe = offlineSwipes.find(swipe => swipe.productId === productId);
      return offlineSwipe || null;
    }

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
