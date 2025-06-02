// Polyfills must be imported first
import './src/lib/polyfills';

import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { TouchableOpacity, Text, View } from 'react-native';

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

export default function App() {
  const [showDevMenu, setShowDevMenu] = useState(false);
  const isDev = __DEV__ && process.env.EXPO_PUBLIC_DEBUG_MODE === 'true';
  
  // テスト実行フラグ（開発時のみ）
  const runTests = false; // true に変更してテストを実行

  useEffect(() => {
    // アプリ初期化
    console.log('🚀 Stilya MVP App initialized');
    console.log('📱 開発モード:', isDev ? 'ON' : 'OFF');
    
    // 開発時のテスト実行
    if (isDev && runTests) {
      console.log('🧪 ローカルテストを実行中...');
      runLocalTests().catch(console.error);
    }
  }, []);

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
}
