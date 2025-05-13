import { Platform, NativeModules, InteractionManager } from 'react-native';
import { Image } from 'expo-image';
import { clearMemoryCache } from '../imageUtils';

// メモリ使用量しきい値（MB）
const MEMORY_WARNING_THRESHOLD = 150; // MB
const LOW_MEMORY_THRESHOLD = 80; // MB

/**
 * アプリのメモリ使用量を取得（iOSのみ完全対応）
 * @returns メモリ使用量（MB）または-1（非対応）
 */
export const getMemoryUsage = async (): Promise<number> => {
  try {
    if (Platform.OS === 'ios') {
      // iOSではNativeModulesを使用
      const { memory } = NativeModules.PerfMonitor || {};
      if (memory?.currentMemoryUsage) {
        return await memory.currentMemoryUsage() / (1024 * 1024); // バイトからMBに変換
      }
    } else if (Platform.OS === 'android') {
      // Androidでは直接のAPIがないため概算値を返す
      // 実際のアプリでは、native moduleを作成して正確な値を取得することをお勧めします
      return -1;
    }
  } catch (e) {
    console.error('Failed to get memory usage:', e);
  }
  return -1;
};

/**
 * メモリ使用量が一定のしきい値を超えたかどうかをチェック
 * @returns 警告レベル
 */
export const checkMemoryWarningLevel = async (): Promise<'normal' | 'warning' | 'critical'> => {
  const memoryUsage = await getMemoryUsage();
  
  if (memoryUsage === -1) return 'normal'; // 測定できない場合
  
  if (memoryUsage > MEMORY_WARNING_THRESHOLD) {
    return 'critical';
  } else if (memoryUsage > LOW_MEMORY_THRESHOLD) {
    return 'warning';
  }
  
  return 'normal';
};

/**
 * メモリ使用量が高い場合に自動的にクリーンアップを行う
 */
export const autoCleanupMemoryIfNeeded = async (): Promise<void> => {
  const warningLevel = await checkMemoryWarningLevel();
  
  if (warningLevel === 'critical') {
    // UIスレッドをブロックしないようにする
    InteractionManager.runAfterInteractions(() => {
      console.log('[MEMORY] Critical memory usage detected, cleaning up...');
      
      // 画像キャッシュをクリア
      clearMemoryCache();
      
      // 明示的にガベージコレクションを促す（ただし強制ではない）
      // 注意: JavaScriptではGCを強制できないので、間接的にヒントを与えるだけ
      global.gc && global.gc();
    });
  } else if (warningLevel === 'warning') {
    console.log('[MEMORY] High memory usage detected');
  }
};

/**
 * キャッシュとリソースをクリアする
 */
export const forceCleanupMemory = (): void => {
  try {
    // 画像キャッシュクリア
    clearMemoryCache();
    
    // その他のクリーンアップ処理
    // 必要に応じて追加のクリーンアップを実装
    
    console.log('[MEMORY] Memory cleanup completed');
  } catch (e) {
    console.error('Failed to cleanup memory:', e);
  }
};

/**
 * メモリ使用量をログに記録する（デバッグ用）
 */
export const logMemoryUsage = async (): Promise<void> => {
  if (!__DEV__) return;
  
  const memoryUsage = await getMemoryUsage();
  if (memoryUsage !== -1) {
    console.log(`[MEMORY] Current memory usage: ${memoryUsage.toFixed(2)} MB`);
  } else {
    console.log('[MEMORY] Unable to measure memory usage on this platform');
  }
};
