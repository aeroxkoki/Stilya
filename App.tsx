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
  ]);
}

const App: React.FC = () => {
  const [showDevMenu, setShowDevMenu] = useState(false);

  useEffect(() => {
    // Initialize Supabase listeners
    initializeSupabaseListeners();
    
    // Cleanup offline data on app start
    cleanupOfflineData().catch(error => {
      console.error('[App] Failed to cleanup offline data:', error);
    });
    
    // Clear image cache in development mode
    clearImageCacheInDev().then(cleared => {
      if (cleared) {
        console.log('[App] Image cache cleared successfully');
      }
    }).catch(error => {
      console.error('[App] Failed to clear image cache:', error);
    });
    
    // Cleanup on unmount
    return () => {
      cleanupSupabaseListeners();
    };
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NetworkProvider>
          <StyleProvider>
            <AuthProvider>
              <ProductProvider>
                <FilterProvider>
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
                </FilterProvider>
              </ProductProvider>
            </AuthProvider>
          </StyleProvider>
        </NetworkProvider>
      </SafeAreaProvider>
    </View>
  );
};

export default App;