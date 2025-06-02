// ========== デバッグログ開始 ==========
try {
  console.log('[App.tsx] 1. ファイル読み込み開始');
} catch (e) {
  // console自体が利用できない場合のフォールバック
}

// Polyfills must be imported first
try {
  console.log('[App.tsx] 2. Polyfills インポート開始');
} catch (e) {}

import './src/lib/polyfills';

try {
  console.log('[App.tsx] 3. Polyfills インポート完了');
} catch (e) {}

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TouchableOpacity, Text, View, LogBox } from 'react-native';

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
  
  // グローバルエラーハンドラーの設定（利用可能な場合）
  // @ts-ignore
  if (global.ErrorUtils && typeof global.ErrorUtils.setGlobalHandler === 'function') {
    // @ts-ignore
    global.ErrorUtils.setGlobalHandler((error: Error, isFatal: boolean) => {
      console.error('[GlobalError]', error.message);
      console.error('[GlobalError Stack]', error.stack);
      console.error('[GlobalError Fatal]', isFatal);
    });
    console.log('[App.tsx] グローバルエラーハンドラー設定完了');
  }

  // LogBoxの警告を無視
  LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
    'Require cycle',
  ]);
  console.log('[App.tsx] 8. LogBox設定完了');
}

console.log('[App.tsx] 9. トップレベル設定完了');

const App: React.FC = () => {
  console.log('[App.tsx] 10. App関数コンポーネント開始');
  
  const [showDevMenu, setShowDevMenu] = useState(false);
  const [testMode] = useState(false); // MVPではテストモードは無効

  useEffect(() => {
    console.log('[App.tsx] 11. App useEffect実行');
    
    // 開発モードでのみテスト実行（現在は無効）
    if (__DEV__ && testMode) {
      console.log('=== ローカルテスト実行開始 ===');
      runLocalTests().then(() => {
        console.log('=== ローカルテスト完了 ===');
      }).catch((error) => {
        console.error('=== ローカルテストエラー ===', error);
      });
    }
  }, [testMode]);

  try {
    console.log('[App.tsx] 12. レンダリング開始');
    
    return (
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <NetworkProvider>
            <ThemeProvider>
              <AuthProvider>
                <ProductProvider>
                  <OnboardingProvider>
                    <NavigationContainer>
                      <StatusBar style="auto" />
                      <AppNavigator />
                      
                      {/* 開発メニュー */}
                      {__DEV__ && !testMode && (
                        <>
                          <TouchableOpacity
                            style={{
                              position: 'absolute',
                              bottom: 100,
                              right: 20,
                              backgroundColor: 'rgba(0,0,0,0.7)',
                              padding: 10,
                              borderRadius: 25,
                              zIndex: 999,
                            }}
                            onPress={() => setShowDevMenu(!showDevMenu)}
                          >
                            <Text style={{ color: 'white', fontSize: 20 }}>🛠</Text>
                          </TouchableOpacity>
                          {showDevMenu && (
                            <DevMenu onClose={() => setShowDevMenu(false)} />
                          )}
                        </>
                      )}
                      
                      <Toast />
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
    console.error('[App.tsx] レンダリングエラー:', error);
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>エラーが発生しました</Text>
        <Text>{String(error)}</Text>
      </View>
    );
  }
};

console.log('[App.tsx] 13. App関数定義完了');

// ========== デバッグログ終了 ==========
console.log('[App.tsx] ファイル読み込み完了');

export default App;
