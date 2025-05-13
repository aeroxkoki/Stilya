import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { NetworkProvider } from './src/contexts/NetworkContext';

export default function App() {
  return (
    <NetworkProvider>
      <ThemeProvider>
        <SafeAreaProvider>
          <StatusBar style="auto" />
          <AppNavigator />
        </SafeAreaProvider>
      </ThemeProvider>
    </NetworkProvider>
  );
}
