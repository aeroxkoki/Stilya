import { Platform, NativeModules, InteractionManager } from 'react-native';
import { Image } from 'expo-image';
import { clearMemoryCache } from '../imageUtils';

// メモリ使用量しきい値（MB）
const MEMORY_WARNING_THRESHOLD = 150; // MB
const LOW_MEMORY_THRESHOLD = 80; // MB

/**
 * アプリのメモリ使用量を取得（クロスプラットフォーム対応）
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
      // Androidでは利用可能なメモリ情報を概算取得
      const { PerformanceMonitor } = NativeModules;
      if (PerformanceMonitor?.getAvailableMemory) {
        // 総メモリと利用可能メモリを取得（ネイティブモジュール経由）
        const memoryInfo = await PerformanceMonitor.getAvailableMemory();
        if (memoryInfo) {
          const { totalMem, availableMem } = memoryInfo;
          const usedMem = totalMem - availableMem;
          return usedMem / (1024 * 1024); // バイトからMBに変換
        }
      }
      
      // ネイティブモジュールが利用できない場合は-1を返す
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
  
  if (memoryUsage === -1) {
    // メモリ測定不可の場合はモバイル環境(ios/android)で実行されていない可能性があり、
    // そのような場合は常に'normal'を返す
    return 'normal';
  }
  
  if (memoryUsage > MEMORY_WARNING_THRESHOLD) {
    return 'critical';
  } else if (memoryUsage > LOW_MEMORY_THRESHOLD) {
    return 'warning';
  }
  
  return 'normal';
};

/**
 * デバイスがローエンドかどうかを判定
 * パフォーマンス最適化の判断に使用
 */
export const isLowEndDevice = async (): Promise<boolean> => {
  // Androidの場合
  if (Platform.OS === 'android') {
    try {
      const { PerformanceMonitor } = NativeModules;
      if (PerformanceMonitor?.getDeviceInfo) {
        const deviceInfo = await PerformanceMonitor.getDeviceInfo();
        // プロセッサコア数・総メモリ量からローエンドデバイスを判定
        if (deviceInfo) {
          const { processorCount, totalMemory } = deviceInfo;
          // 4GB未満のメモリ、または4コア以下のCPUをローエンドとみなす
          return (
            processorCount <= 4 || 
            (totalMemory / (1024 * 1024 * 1024)) < 4
          );
        }
      }
    } catch (e) {
      console.error('Failed to determine device capability:', e);
    }
  }
  
  // iOSの場合（実機ではモデル名から判定可能だが、シミュレータでは不可能）
  // メモリ使用量から間接的に判定
  const memoryUsage = await getMemoryUsage();
  if (memoryUsage === -1) return false; // 判定不能
  
  // メモリ使用量が少ないデバイスはローエンドとみなす
  return memoryUsage < 50; // 50MB未満はおそらく古いデバイス
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
      
      // 明示的なガベージコレクションを促す
      if (global.gc) {
        try {
          global.gc();
        } catch (e) {
          console.error('Failed to force garbage collection:', e);
        }
      }
    });
  } else if (warningLevel === 'warning') {
    console.log('[MEMORY] High memory usage detected');
    
    // 警告レベルでは非表示の画像のみキャッシュをクリア
    if (Image.clearDiskCache) {
      try {
        await Image.clearDiskCache();
      } catch (e) {
        console.error('Failed to clear disk cache:', e);
      }
    }
  }
};

/**
 * キャッシュとリソースをクリアする
 */
export const forceCleanupMemory = (): void => {
  try {
    // メモリキャッシュクリア
    clearMemoryCache();
    
    // ディスクキャッシュのクリア
    if (Image.clearDiskCache) {
      Image.clearDiskCache().catch(e => 
        console.error('Failed to clear disk cache:', e)
      );
    }
    
    // タイムアウト後に追加クリーンアップ
    setTimeout(() => {
      try {
        // ガベージコレクションを促進
        if (global.gc) {
          global.gc();
        }
        
        console.log('[MEMORY] Memory cleanup completed');
      } catch (e) {
        console.error('Failed to complete cleanup:', e);
      }
    }, 500);
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

/**
 * メモリ警告イベントのリスナーを設定
 */
export const setupMemoryWarningListener = (): (() => void) => {
  if (Platform.OS === 'ios' && NativeModules.PerfMonitor?.startObservingMemoryWarnings) {
    try {
      // iOSのメモリ警告イベントを監視
      NativeModules.PerfMonitor.startObservingMemoryWarnings();
      
      // クリーンアップ関数を返す
      return () => {
        if (NativeModules.PerfMonitor?.stopObservingMemoryWarnings) {
          NativeModules.PerfMonitor.stopObservingMemoryWarnings();
        }
      };
    } catch (e) {
      console.error('Failed to setup memory warning listener:', e);
    }
  }
  
  // 空のクリーンアップ関数を返す
  return () => {};
};
