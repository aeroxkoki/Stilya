import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { TouchableOpacity, Text, View, LogBox } from 'react-native';

// Components and Navigation
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { ProductProvider } from './src/contexts/ProductContext';
import { OnboardingProvider } from './src/contexts/OnboardingContext';
import { NetworkProvider } from './src/contexts/NetworkContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { DevMenu } from './src/components/dev/DevMenu';

// Supabase
import { initializeSupabaseListeners, cleanupSupabaseListeners } from './src/services/supabase';

// 開発環境でのテスト（現在は無効化）
// if (__DEV__) {
//   import('./src/tests/authTest').then(module => {
//     console.log('[App.tsx] 認証テストモジュールをロード');
//   }).catch(error => {
//     console.error('[App.tsx] 認証テストモジュールのロードエラー:', error);
//   });
// }

// LogBoxの警告を無視
if (__DEV__) {
  LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
    'Require cycle',
  ]);
}

const App: React.FC = () => {
  const [showDevMenu, setShowDevMenu] = useState(false);

  useEffect(() => {
    // Initialize Supabase listeners
    initializeSupabaseListeners();
    
    // Cleanup on unmount
    return () => {
      cleanupSupabaseListeners();
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
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
                    {__DEV__ && (
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
                  </NavigationContainer>
                </OnboardingProvider>
              </ProductProvider>
            </AuthProvider>
          </ThemeProvider>
        </NetworkProvider>
      </SafeAreaProvider>
    </View>
  );
};

export default App;
