import { clearOfflineSwipes, syncOfflineSwipes } from '@/services/swipeService';
import { isOffline } from '@/utils/networkUtils';

/**
 * アプリ起動時にオフラインデータをクリーンアップ
 * 無効なスワイプデータを同期または削除
 */
export const cleanupOfflineData = async (): Promise<void> => {
  try {
    console.log('[cleanupOfflineData] Starting offline data cleanup...');
    
    // ネットワーク状態を確認
    const networkOffline = await isOffline();
    
    if (networkOffline) {
      console.log('[cleanupOfflineData] Network is offline, skipping cleanup');
      return;
    }
    
    // オンラインの場合、オフラインスワイプを同期
    console.log('[cleanupOfflineData] Attempting to sync offline swipes...');
    const syncResult = await syncOfflineSwipes();
    
    if (syncResult) {
      console.log('[cleanupOfflineData] Successfully synced offline swipes');
    } else {
      console.log('[cleanupOfflineData] Failed to sync offline swipes, data preserved for later');
    }
    
  } catch (error) {
    console.error('[cleanupOfflineData] Error during cleanup:', error);
  }
};

/**
 * 開発環境用：すべてのオフラインデータを強制削除
 */
export const forceCleanupOfflineData = async (): Promise<void> => {
  try {
    console.log('[forceCleanupOfflineData] Force clearing all offline data...');
    await clearOfflineSwipes();
    console.log('[forceCleanupOfflineData] All offline data cleared');
  } catch (error) {
    console.error('[forceCleanupOfflineData] Error during force cleanup:', error);
  }
};
