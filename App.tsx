import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { NetworkProvider } from './src/contexts/NetworkContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NetworkProvider>
          <ThemeProvider>
            <AuthProvider>
              <StatusBar style="auto" />
              <AppNavigator />
              <Toast />
            </AuthProvider>
          </ThemeProvider>
        </NetworkProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}