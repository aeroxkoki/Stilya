// Polyfills must be imported first
import './src/lib/polyfills';

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TouchableOpacity, Text, View, LogBox } from 'react-native';

// Components and Navigation
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { ProductProvider } from './src/contexts/ProductContext';
import { OnboardingProvider } from './src/contexts/OnboardingContext';
import { NetworkProvider } from './src/contexts/NetworkContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { DevMenu } from './src/components/dev/DevMenu';

// テスト実行用インポート（開発時のみ）
import { runLocalTests } from './src/tests/localTests';

// LogBoxの警告を無視
if (__DEV__) {
  LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
    'Require cycle',
  ]);
}

const App: React.FC = () => {
  const [showDevMenu, setShowDevMenu] = useState(false);
  const [testMode] = useState(false); // MVPではテストモードは無効

  useEffect(() => {
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
};

export default App;
