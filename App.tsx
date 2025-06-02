// ========== デバッグログ開始 ==========
console.log('[App.tsx] 1. ファイル読み込み開始');

// Polyfills must be imported first
console.log('[App.tsx] 2. Polyfills インポート開始');
import './src/lib/polyfills';
console.log('[App.tsx] 3. Polyfills インポート完了');

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TouchableOpacity, Text, View, LogBox } from 'react-native';

// グローバルエラーハンドラー設定
import * as ErrorUtils from 'react-native/Libraries/Core/ErrorUtils';

console.log('[App.tsx] 4. 基本インポート完了');

// Components and Navigation
console.log('[App.tsx] 5. コンポーネントインポート開始');
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { ProductProvider } from './src/contexts/ProductContext';
import { OnboardingProvider } from './src/contexts/OnboardingContext';
import { NetworkProvider } from './src/contexts/NetworkContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { DevMenu } from './src/components/dev/DevMenu';
console.log('[App.tsx] 6. コンポーネントインポート完了');

// テスト実行用インポート（開発時のみ）
import { runLocalTests } from './src/tests/localTests';

// グローバルエラーハンドラー
if (__DEV__) {
  console.log('[App.tsx] 7. 開発モード - エラーハンドラー設定開始');
  
  ErrorUtils.setGlobalHandler((error: Error, isFatal?: boolean) => {
    console.log('==================== グローバルエラー発生 ====================');
    console.log('エラー名:', error.name);
    console.log('エラーメッセージ:', error.message);
    console.log('スタックトレース:', error.stack);
    console.log('Fatal:', isFatal);
    console.log('=============================================================');
  });

  // 未処理のPromiseエラーをキャッチ
  const originalReject = Promise.reject;
  Promise.reject = function(...args) {
    console.log('==================== Promise Rejection ====================');
    console.log('引数:', args);
    console.log('=========================================================');
    return originalReject.apply(Promise, args);
  };
  
  console.log('[App.tsx] 8. エラーハンドラー設定完了');
}

export default function App() {
  console.log('[App.tsx] 9. App関数開始');
  
  const [showDevMenu, setShowDevMenu] = useState(false);
  const isDev = __DEV__ && process.env.EXPO_PUBLIC_DEBUG_MODE === 'true';
  
  // テスト実行フラグ（開発時のみ）
  const runTests = false; // true に変更してテストを実行

  useEffect(() => {
    console.log('[App.tsx] 10. useEffect実行開始');
    
    // アプリ初期化
    console.log('🚀 Stilya MVP App initialized');
    console.log('📱 開発モード:', isDev ? 'ON' : 'OFF');
    console.log('📱 環境変数 EXPO_PUBLIC_DEBUG_MODE:', process.env.EXPO_PUBLIC_DEBUG_MODE);
    
    // 開発時のテスト実行
    if (isDev && runTests) {
      console.log('🧪 ローカルテストを実行中...');
      runLocalTests().catch((error) => {
        console.error('[App.tsx] テスト実行エラー:', error);
      });
    }
    
    console.log('[App.tsx] 11. useEffect実行完了');
  }, []);

  console.log('[App.tsx] 12. レンダリング開始');
  
  try {
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        {console.log('[App.tsx] 13. GestureHandlerRootView レンダリング')}
        <SafeAreaProvider>
          {console.log('[App.tsx] 14. SafeAreaProvider レンダリング')}
          <NetworkProvider>
            {console.log('[App.tsx] 15. NetworkProvider レンダリング')}
            <ThemeProvider>
              {console.log('[App.tsx] 16. ThemeProvider レンダリング')}
              <AuthProvider>
                {console.log('[App.tsx] 17. AuthProvider レンダリング')}
                <ProductProvider>
                  {console.log('[App.tsx] 18. ProductProvider レンダリング')}
                  <OnboardingProvider>
                    {console.log('[App.tsx] 19. OnboardingProvider レンダリング')}
                    <NavigationContainer>
                      {console.log('[App.tsx] 20. NavigationContainer レンダリング')}
                      <StatusBar style="auto" />
                      <AppNavigator />
                      {console.log('[App.tsx] 21. AppNavigator レンダリング完了')}
                      <Toast />
                      
                      {/* 開発モードボタン */}
                      {isDev && (
                        <TouchableOpacity
                          style={{
                            position: 'absolute',
                            bottom: 30,
                            right: 20,
                            backgroundColor: '#FF6B6B',
                            width: 60,
                            height: 60,
                            borderRadius: 30,
                            justifyContent: 'center',
                            alignItems: 'center',
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.25,
                            shadowRadius: 3.84,
                            elevation: 5,
                          }}
                          onPress={() => setShowDevMenu(true)}
                        >
                          <Text style={{ fontSize: 24 }}>🛠️</Text>
                        </TouchableOpacity>
                      )}
                      
                      {/* 開発メニュー */}
                      {showDevMenu && (
                        <DevMenu onClose={() => setShowDevMenu(false)} />
                      )}
                    </NavigationContainer>
                  </OnboardingProvider>
                </ProductProvider>
              </AuthProvider>
            </ThemeProvider>
          </NetworkProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    );
  } catch (error) {
    console.error('[App.tsx] =========== レンダリングエラー ===========');
    console.error('エラー:', error);
    console.error('スタック:', error.stack);
    console.error('==========================================');
    throw error;
  }
}
