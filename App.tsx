import 'expo-dev-client';
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
import { StyleProvider } from './src/contexts/ThemeContext';
import { FilterProvider } from './src/contexts/FilterContext';
import { DevMenu } from './src/components/dev/DevMenu';

// Supabase
import { initializeSupabaseListeners, cleanupSupabaseListeners } from './src/services/supabase';
import { cleanupOfflineData } from './src/utils/offlineDataCleanup';
import { clearImageCacheInDev } from './src/utils/imageCacheUtils';

// 開発環境での診断
if (__DEV__) {
  import('./src/services/appDiagnostics').then(module => {
    console.log('[App.tsx] アプリ診断モジュールをロード');
  }).catch(error => {
    console.error('[App.tsx] アプリ診断モジュールのロードエラー:', error);
  });
}

// LogBoxの警告を無視
if (__DEV__) {
  LogBox.ignoreLogs([
    'Non-serializable values were found in the navigation state',
    'Require cycle',
    'ViewPropTypes will be removed',
    'Possible Unhandled Promise Rejection',
  ]);
}

const App: React.FC = () => {
  const [showDevMenu, setShowDevMenu] = useState(false);

  useEffect(() => {
    console.log('[App.tsx] コンポーネントがマウントされました');
    
    // Initialize Supabase listeners
    initializeSupabaseListeners();
    
    // Cleanup offline data on app start
    cleanupOfflineData().catch(error => {
      console.error('[App.tsx] オフラインデータのクリーンアップ中にエラー:', error);
    });
    
    // Clear image cache in development
    if (__DEV__) {
      clearImageCacheInDev().catch(error => {
        console.error('[App.tsx] 画像キャッシュのクリア中にエラー:', error);
      });
    }
    
    return () => {
      console.log('[App.tsx] コンポーネントがアンマウントされます');
      cleanupSupabaseListeners();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StyleProvider>
        <AuthProvider>
          <NetworkProvider>
            <ProductProvider>
              <OnboardingProvider>
                <FilterProvider>
                  <NavigationContainer>
                    <AppNavigator />
                    <StatusBar style="auto" />
                    
                    {/* Dev Menu Toggle Button */}
                    {__DEV__ && (
                      <TouchableOpacity
                        style={{
                          position: 'absolute',
                          bottom: 100,
                          right: 20,
                          backgroundColor: 'rgba(0,0,0,0.7)',
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                          borderRadius: 20,
                          zIndex: 9999,
                        }}
                        onPress={() => setShowDevMenu(!showDevMenu)}
                      >
                        <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>
                          {showDevMenu ? 'Close' : 'Dev'}
                        </Text>
                      </TouchableOpacity>
                    )}
                    
                    {/* Dev Menu */}
                    {__DEV__ && showDevMenu && (
                      <View
                        style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 0,
                          right: 0,
                          backgroundColor: 'rgba(0,0,0,0.95)',
                          padding: 20,
                          paddingBottom: 40,
                          zIndex: 9998,
                        }}
                      >
                        <DevMenu onClose={() => setShowDevMenu(false)} />
                      </View>
                    )}
                  </NavigationContainer>
                </FilterProvider>
              </OnboardingProvider>
            </ProductProvider>
          </NetworkProvider>
        </AuthProvider>
      </StyleProvider>
    </SafeAreaProvider>
  );
};

export default App;
