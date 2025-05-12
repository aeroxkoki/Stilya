import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useAuthStore } from '@/store/authStore';
import { View, Text } from 'react-native';

// 今後のナビゲーション実装のためのプレースホルダー
const AuthStack = () => (
  <View className="flex-1 items-center justify-center bg-white">
    <Text className="text-xl font-bold">Auth Screen (Coming Soon)</Text>
  </View>
);

const MainStack = () => (
  <View className="flex-1 items-center justify-center bg-white">
    <Text className="text-xl font-bold">Main Screen (Coming Soon)</Text>
  </View>
);

const OnboardingStack = () => (
  <View className="flex-1 items-center justify-center bg-white">
    <Text className="text-xl font-bold">Onboarding Screen (Coming Soon)</Text>
  </View>
);

const LoadingScreen = () => (
  <View className="flex-1 items-center justify-center bg-white">
    <Text className="text-xl font-bold">Loading...</Text>
  </View>
);

// メインスタックナビゲーター
const Stack = createNativeStackNavigator();

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
            <Stack.Screen name="Auth" component={AuthStack} />
          ) : user?.gender ? (
            // ログイン済み & オンボーディング完了
            <Stack.Screen name="Main" component={MainStack} />
          ) : (
            // ログイン済み & オンボーディング未完了
            <Stack.Screen name="Onboarding" component={OnboardingStack} />
          )}
        </Stack.Navigator>
      </NavigationContainer>
      <StatusBar style="auto" />
    </SafeAreaProvider>
  );
}
