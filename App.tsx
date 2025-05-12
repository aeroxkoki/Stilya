import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@/store/authStore';
import { View, Text, ActivityIndicator } from 'react-native';

// ナビゲーター
import AuthNavigator from '@/navigation/AuthNavigator';
import MainNavigator from '@/navigation/MainNavigator';
import OnboardingNavigator from '@/navigation/OnboardingNavigator';

// スタックナビゲーター
const Stack = createNativeStackNavigator();

// ローディング画面
const LoadingScreen = () => (
  <View className="flex-1 items-center justify-center bg-white">
    <ActivityIndicator size="large" color="#3B82F6" />
    <Text className="mt-4 text-gray-600">読み込み中...</Text>
  </View>
);

export default function App() {
  const { initialize, loading, user, session } = useAuthStore();

  useEffect(() => {
    // アプリ起動時に認証状態を初期化
    initialize();
  }, [initialize]);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {!session ? (
            // 未ログイン状態
            <Stack.Screen name="Auth" component={AuthNavigator} />
          ) : user?.gender ? (
            // ログイン済み & オンボーディング完了
            <Stack.Screen name="Main" component={MainNavigator} />
          ) : (
            // ログイン済み & オンボーディング未完了
            <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
