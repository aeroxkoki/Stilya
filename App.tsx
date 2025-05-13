import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAppLifecycle } from './src/hooks/useAppLifecycle';
import { cleanImageCache, clearMemoryCache } from './src/utils/imageUtils';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { NetworkProvider } from './src/contexts/NetworkContext';
import { ErrorProvider } from './src/contexts/ErrorContext';
import { LogBox, StyleSheet, AppState, Platform } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { Image } from 'expo-image';
import Toast from 'react-native-toast-message';
import toastConfig from './src/components/common/ToastConfig';
import { flushQueue as flushAnalyticsQueue } from './src/services/analyticsService';
import { 
  recordAppStartupTime,
  autoCleanupMemoryIfNeeded
} from './src/utils/performance';
import OfflineNotice from './src/components/common/OfflineNotice';
import TestConnection from './TestConnection';

// イメージキャッシュの設定
Image.prefetchCache({
  cachePolicy: 'memory-disk',
  diskCachePolicy: 'automatic',
  // キャッシュ期限: 7日間
  ttl: 7 * 24 * 60 * 60 * 1000,
  maxDiskCapacity: 300 * 1024 * 1024, // 300MB（ディスクキャッシュ容量の上限）
  maxMemoryCapacity: 60 * 1024 * 1024, // 60MB（メモリキャッシュ容量の上限）
});

// スプラッシュスクリーンを表示
SplashScreen.preventAutoHideAsync().catch(() => {
  // エラーがあっても無視（既に非表示の場合など）
});

// 開発中の警告抑制
if (__DEV__) {
  LogBox.ignoreLogs([
    'ViewPropTypes will be removed',
    'AsyncStorage has been extracted',
    'Require cycle:',
  ]);
}

export default function App() {
  // アプリのライフサイクル管理
  useAppLifecycle();
  
  // 初期化処理
  useEffect(() => {
    const prepare = async () => {
      try {
        // パフォーマンスモニタリング（開発モードのみ）
        if (__DEV__) {
          recordAppStartupTime();
        }
        
        // アナリティクスの未送信キューがあれば送信
        flushAnalyticsQueue().catch(error =>
          console.error('Failed to flush analytics queue:', error)
        );
        
        // スプラッシュスクリーンを非表示
        await SplashScreen.hideAsync();
      } catch (error) {
        console.error('Error during app initialization:', error);
        // エラーがあってもスプラッシュは非表示に
        SplashScreen.hideAsync().catch(() => {});
      }
    };
    
    prepare();
  }, []);

  // アプリの状態変更を監視してメモリ管理を最適化
  useEffect(() => {
    // アプリがバックグラウンドに移動したときにメモリを解放
    const subscription = AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'background') {
        // バックグラウンドに移動した時にメモリの一部を解放
        clearMemoryCache();
      } else if (nextAppState === 'active') {
        // アプリがアクティブになった時にメモリ使用量をチェック
        autoCleanupMemoryIfNeeded();
      }
    });

    // クリーンアップ
    return () => {
      subscription.remove();
    };
  }, []);

  // 定期的なメモリ使用量チェックとクリーンアップ
  useEffect(() => {
    // 古いキャッシュを削除（起動時に1回）
    cleanImageCache().catch(error => 
      console.error('Failed to clean image cache:', error)
    );

    // メモリ使用量を定期的にチェック（本番環境のみ）
    if (!__DEV__) {
      const intervalId = setInterval(() => {
        autoCleanupMemoryIfNeeded();
      }, 60000); // 60秒ごと
      
      return () => clearInterval(intervalId);
    }
  }, []);

  return (
    <GestureHandlerRootView style={styles.container}>
      <NetworkProvider>
        <ErrorProvider>
          <ThemeProvider>
            <SafeAreaProvider>
              <StatusBar style="auto" />
              <AppNavigator />
              <OfflineNotice />
              <Toast config={toastConfig} />
            </SafeAreaProvider>
          </ThemeProvider>
        </ErrorProvider>
      </NetworkProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
