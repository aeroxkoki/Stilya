import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import AppNavigator from './src/navigation/AppNavigator';
import { AuthProvider } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { NetworkProvider } from './src/contexts/NetworkContext';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { View, Text } from 'react-native';

// Add runtime dependency check
const checkRuntimeDependencies = () => {
  try {
    // Check if @babel/runtime is available
    require('@babel/runtime/helpers/interopRequireDefault');
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
};

export default function App() {
  const [dependencyError, setDependencyError] = useState<string | null>(null);

  useEffect(() => {
    const check = checkRuntimeDependencies();
    if (!check.success) {
      setDependencyError(check.error || 'Unknown error');
      console.error('Runtime dependency check failed:', check.error);
    }
  }, []);

  // Show error screen if dependencies are missing
  if (dependencyError) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
          Dependency Error
        </Text>
        <Text style={{ textAlign: 'center', marginBottom: 20 }}>
          A required dependency is missing. Please reinstall the app or contact support.
        </Text>
        <Text style={{ fontSize: 12, color: '#888' }}>
          Error: {dependencyError}
        </Text>
      </View>
    );
  }

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
