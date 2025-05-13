import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAppLifecycle } from './src/hooks/useAppLifecycle';
import { cleanImageCache } from './src/utils/imageUtils';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { NetworkProvider } from './src/contexts/NetworkContext';
import { LogBox, StyleSheet } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import { Image } from 'expo-image';

// イメージキャッシュの設定
Image.prefetchCache({
  cachePolicy: 'memory-disk',
  diskCachePolicy: 'automatic',
  // キャッシュ期限: 7日間
  ttl: 7 * 24 * 60 * 60 * 1000,
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
  useAppLifecycle({
    onForeground: () => {
      // フォアグラウンドに戻った時の処理
      console.log('App returned to foreground');
    },
    onBackground: () => {
      // バックグラウンドに移行した時の処理
      console.log('App went to background');
      
      // バックグラウンド移行時には不要なキャッシュをクリア
      cleanImageCache().catch(error => 
        console.error('Failed to clean image cache:', error)
      );
    },
    onNetworkChange: (isConnected) => {
      // ネットワーク状態が変化した時の処理
      console.log('Network status changed:', isConnected ? 'online' : 'offline');
    },
  });
  
  // 初期化処理
  useEffect(() => {
    const prepare = async () => {
      try {
        // 必要な初期化処理
        
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

  return (
    <GestureHandlerRootView style={styles.container}>
      <NetworkProvider>
        <ThemeProvider>
          <SafeAreaProvider>
            <StatusBar style="auto" />
            <AppNavigator />
          </SafeAreaProvider>
        </ThemeProvider>
      </NetworkProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
