import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { View, Text } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

// Polyfills for React Native
import 'react-native-url-polyfill/auto';

// NativeWind setup
import './src/styles/global.css';

// Components and Navigation
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
// import { ErrorProvider } from './src/contexts/ErrorContext';
import { NetworkProvider } from './src/contexts/NetworkContext';
// import { ThemeProvider } from './src/contexts/ThemeContext';

// Services
// import { initializeSupabase } from './src/services/supabase';
import { DEMO_MODE, showDemoModeMessage } from './src/services/demoService';

// Utils
// import { registerForPushNotificationsAsync } from './src/utils/notifications';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App Error Boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white', padding: 16 }}>
          <Text style={{ fontSize: 18, fontWeight: '600', color: '#dc2626', marginBottom: 8 }}>
            アプリでエラーが発生しました
          </Text>
          <Text style={{ fontSize: 14, color: '#4b5563', textAlign: 'center', marginBottom: 16 }}>
            アプリを再起動してください。問題が続く場合は、お問い合わせください。
          </Text>
          <Text style={{ fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>
            Error: {this.state.error?.message}
          </Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default function App() {
  useEffect(() => {
    // アプリ初期化
    const initializeApp = async () => {
      try {
        // デモモードのチェック
        if (DEMO_MODE) {
          showDemoModeMessage();
          Toast.show({
            type: 'info',
            text1: 'デモモード',
            text2: 'モックデータで動作しています',
            position: 'top',
            visibilityTime: 4000,
          });
        } else {
          // Supabaseクライアントの初期化
          // await initializeSupabase();
        }
        
        // プッシュ通知の初期化（本番環境のみ）
        // if (__DEV__ === false) {
        //   await registerForPushNotificationsAsync();
        // }
        
        console.log('🚀 Stilya App initialized successfully');
      } catch (error) {
        console.error('❌ App initialization error:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <SafeAreaProvider>
          <NetworkProvider>
            <AuthProvider>
              <NavigationContainer>
                <StatusBar style="auto" />
                <AppNavigator />
                <Toast />
              </NavigationContainer>
            </AuthProvider>
          </NetworkProvider>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}
