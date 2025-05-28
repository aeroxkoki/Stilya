import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import './src/styles/global.css'; // NativeWindのグローバルスタイル

// Navigation
import AppNavigator from './src/navigation/AppNavigator';

// Hooks
import { AuthProvider } from './src/hooks/useAuth';

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <StatusBar style="auto" />
        <AppNavigator />
        <Toast />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
