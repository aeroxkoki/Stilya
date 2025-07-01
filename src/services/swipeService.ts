import { supabase } from './supabase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isOffline } from '@/utils/networkUtils';
import { UserPreferenceService } from './userPreferenceService';

// スワイプ結果の型定義
export type SwipeResult = 'yes' | 'no';

// スワイプデータの型定義（拡張版）
export interface SwipeData {
  id: string;
  userId: string;
  productId: string;
  result: SwipeResult;
  createdAt: string; // 必須に変更
  swipeTime?: number; // スワイプにかかった時間（ミリ秒）
}

// スワイプの興味レベル
export type InterestLevel = 'strong' | 'normal' | 'weak';

// オフライン用のスワイプデータストレージキー
const OFFLINE_SWIPE_STORAGE_KEY = 'offline_swipe_data';

/**
 * スワイプ時間から興味レベルを判定
 */
export const getInterestLevel = (swipeTime: number, result: SwipeResult): InterestLevel => {
  if (result === 'yes') {
    // 1秒以内の即決Yes = 強い興味
    if (swipeTime < 1000) return 'strong';
    // 3秒以内のYes = 通常の興味
    if (swipeTime < 3000) return 'normal';
    // それ以上は弱い興味
    return 'weak';
  } else {
    // 0.5秒以内の即No = 強い拒否
    if (swipeTime < 500) return 'strong';
    // 2秒以内のNo = 通常の拒否
    if (swipeTime < 2000) return 'normal';
    // それ以上は弱い拒否（迷った）
    return 'weak';
  }
};

/**
 * スワイプ結果を記録する（最適化版）
 * @param userId ユーザーID
 * @param productId 商品ID
 * @param result スワイプ結果 ('yes' or 'no')
 * @param metadata オプションのメタデータ（スワイプ時間など）
 * @returns 保存に成功したかどうか
 */
export const recordSwipe = async (
  userId: string,
  productId: string,
  result: SwipeResult,
  metadata?: { swipeTime?: number }
): Promise<boolean> => {
  if (!userId || !productId) {
    console.warn('Invalid user or product ID for swipe recording');
    return false;
  }
  
  // 既存の処理を再利用（より効率的な実装）
  return saveSwipeResult(userId, productId, result, metadata);
};

/**
 * スワイプ結果を保存する
 * @param userId ユーザーID
 * @param productId 商品ID
 * @param result スワイプ結果 ('yes' or 'no')
 * @param metadata オプションのメタデータ（スワイプ時間など）
 * @returns 保存に成功したかどうか
 */
export const saveSwipeResult = async (
  userId: string,
  productId: string,
  result: SwipeResult,
  metadata?: { swipeTime?: number }
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
      id: `offline_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      swipeTime: metadata?.swipeTime
    };

    // オフラインの場合はローカルに保存
    const networkOffline = await isOffline();
    if (networkOffline) {
      return await saveSwipeOffline(swipeData);
    }

    // 即座の判断かどうかを判定
    const isInstantDecision = metadata?.swipeTime ? metadata.swipeTime < 1000 : false;

    // オンラインの場合はSupabaseに保存（UPSERT処理で重複を防ぐ）
    const { error } = await supabase
      .from('swipes')
      .upsert(
        {
          user_id: userId,
          product_id: productId,
          result,
          swipe_time_ms: metadata?.swipeTime || null,
          is_instant_decision: isInstantDecision,
        },
        { 
          onConflict: 'user_id,product_id',
          ignoreDuplicates: false 
        }
      )
      .select('id');

    if (error) throw error;

    // リアルタイム学習を追加
    await UserPreferenceService.updatePreferenceFromSwipe(
      userId,
      productId,
      result,
      metadata?.swipeTime
    );

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

    // バッチで同期（有効なスワイプのみ） - UPSERTを使用して重複を防ぐ
    const { error } = await supabase.from('swipes').upsert(
      validSwipes.map((swipe) => ({
        user_id: swipe.userId,
        product_id: swipe.productId,
        result: swipe.result,
        created_at: swipe.createdAt || new Date().toISOString(),
        swipe_time_ms: swipe.swipeTime || null,
      })),
      { 
        onConflict: 'user_id,product_id',
        ignoreDuplicates: false // 既存のレコードを更新
      }
    );

    if (error) throw error;

    // 同期完了後、オフラインデータをクリア
    await AsyncStorage.removeItem(OFFLINE_SWIPE_STORAGE_KEY);
    console.log('[syncOfflineSwipes] Successfully synced swipes');
    return true;
  } catch (error: any) {
    // より詳細なエラーログ
    if (error?.code === '23505') {
      console.log('[syncOfflineSwipes] Duplicate key error - this is normal if user swiped same product multiple times offline');
      // 重複エラーの場合も、オフラインデータをクリア（既にサーバーに存在するため）
      await AsyncStorage.removeItem(OFFLINE_SWIPE_STORAGE_KEY);
      return true; // 重複は正常な動作として扱う
    }
    
    console.error('[syncOfflineSwipes] Error syncing offline swipes:', error);
    console.error('[syncOfflineSwipes] Error details:', {
      code: error?.code,
      message: error?.message,
      details: error?.details,
    });
    return false;
  }
};

/**
 * 有効なスワイプデータかどうかを検証
 */
const isValidSwipeData = (item: any): boolean => {
  // 基本的な必須フィールドの存在確認
  if (!item || !item.id || !item.product_id || !item.user_id) {
    return false;
  }
  
  // IDの形式チェック（Supabaseの内部メタデータを除外）
  const idStr = item.id.toString();
  const productIdStr = item.product_id.toString();
  
  // 不正なパターンをチェック
  const invalidPatterns = [
    'undo-row',
    'undo_row',
    'UNDO',
    'replica',
    'REPLICA',
    'tmp_',
    'temp_',
    '__'
  ];
  
  for (const pattern of invalidPatterns) {
    if (idStr.includes(pattern) || productIdStr.includes(pattern)) {
      return false;
    }
  }
  
  // UUIDまたは既知の形式であることを確認（コロンも許可）
  const validIdPattern = /^[a-zA-Z0-9\-_:]+$/;
  if (!validIdPattern.test(idStr) || !validIdPattern.test(productIdStr)) {
    return false;
  }
  
  return true;
};

/**
 * ユーザーのスワイプ履歴を取得する
 * @param userId ユーザーID
 * @param result オプションの結果フィルタ ('yes' or 'no')
 * @returns スワイプデータの配列
 */
export const getSwipeHistory = async (userId: string | undefined | null, result?: SwipeResult): Promise<SwipeData[]> => {
  try {
    // userIdの検証
    if (!userId || userId === 'undefined' || userId === 'null') {
      console.warn('[getSwipeHistory] Invalid userId:', userId);
      return [];
    }
    
    // オンラインデータ取得
    const networkOffline = await isOffline();
    if (!networkOffline) {
      // APIクエリを構築（必要なフィールドのみ選択）
      let query = supabase
        .from('swipes')
        .select('id, user_id, product_id, result, created_at')
        .eq('user_id', userId);
      
      // 結果でフィルタリング（オプション）
      if (result) {
        query = query.eq('result', result);
      }
      
      // 順序付けして取得（最新100件まで）
      const { data, error } = await query
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // デバッグ: 生データを確認
      if (__DEV__ && data && data.length > 0) {
        console.log('[getSwipeHistory] Raw data sample:', JSON.stringify(data[0], null, 2));
        console.log('[getSwipeHistory] Total items:', data.length);
        
        // 不正なIDをチェック
        const invalidItems = data.filter(item => !isValidSwipeData(item));
        
        if (invalidItems.length > 0) {
          console.warn('[getSwipeHistory] Found invalid items:', invalidItems.length);
          console.warn('[getSwipeHistory] Invalid sample:', invalidItems[0]);
        }
      }

      // 有効なデータのみをフィルタリングしてマッピング
      const onlineSwipes = data
        .filter(isValidSwipeData)
        .map((item) => ({
          id: item.id.toString(),
          userId: item.user_id,
          productId: item.product_id,
          result: item.result as SwipeResult,
          createdAt: item.created_at,
        }));

      // オフラインデータとマージ
      const offlineSwipes = await getOfflineSwipes(userId, result);
      
      // 重複を排除してマージ（商品IDベース）
      const swipeMap = new Map<string, SwipeData>();
      
      // オンラインデータを先に追加（優先）
      onlineSwipes.forEach(swipe => {
        swipeMap.set(swipe.productId, swipe);
      });
      
      // オフラインデータを追加（重複しないもののみ）
      offlineSwipes.forEach(swipe => {
        if (!swipeMap.has(swipe.productId)) {
          swipeMap.set(swipe.productId, swipe);
        }
      });
      
      // Mapから配列に変換して返す
      return Array.from(swipeMap.values());
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
const getOfflineSwipes = async (userId: string | undefined | null, result?: SwipeResult): Promise<SwipeData[]> => {
  try {
    // userIdの検証
    if (!userId || userId === 'undefined' || userId === 'null') {
      console.warn('[getOfflineSwipes] Invalid userId:', userId);
      return [];
    }
    
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
  userId: string | undefined | null,
  result?: SwipeResult
): Promise<string[]> => {
  try {
    if (!userId || userId === 'undefined' || userId === 'null') {
      console.warn('[getSwipedProductIds] Invalid userId:', userId);
      return [];
    }
    
    const swipeHistory = await getSwipeHistory(userId, result);
    
    // 重複を除去して商品IDのみを返す
    return [...new Set(swipeHistory.map((swipe) => swipe.productId))];
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

/**
 * 重複したスワイプをクリーンアップ（管理者用）
 */
export const cleanupDuplicateSwipes = async (userId: string): Promise<boolean> => {
  try {
    // まず全てのスワイプを取得
    const { data, error } = await supabase
      .from('swipes')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // 商品IDごとに最新のスワイプのみを保持
    const latestSwipesByProduct = new Map<string, any>();
    const duplicateIds: string[] = [];
    
    data.forEach(swipe => {
      if (isValidSwipeData(swipe)) {
        const existing = latestSwipesByProduct.get(swipe.product_id);
        if (!existing) {
          latestSwipesByProduct.set(swipe.product_id, swipe);
        } else {
          // 重複したレコードのIDを記録
          duplicateIds.push(swipe.id);
        }
      } else {
        // 無効なデータも削除対象
        duplicateIds.push(swipe.id);
      }
    });
    
    // 重複したレコードを削除
    if (duplicateIds.length > 0) {
      const { error: deleteError } = await supabase
        .from('swipes')
        .delete()
        .in('id', duplicateIds);
      
      if (deleteError) {
        console.error('[cleanupDuplicateSwipes] Delete error:', deleteError);
        return false;
      }
      
      console.log(`[cleanupDuplicateSwipes] Deleted ${duplicateIds.length} duplicate/invalid swipes`);
    }
    
    return true;
  } catch (error) {
    console.error('[cleanupDuplicateSwipes] Error:', error);
    return false;
  }
};