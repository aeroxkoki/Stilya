console.log('[AppNavigator.tsx] 1. ファイル読み込み開始');

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, Text } from 'react-native';

console.log('[AppNavigator.tsx] 2. 基本インポート完了');

// Context
import { useAuth } from '../hooks/useAuth';

// Navigators
import MainNavigator from './MainNavigator';

// Screens
console.log('[AppNavigator.tsx] 3. スクリーンインポート開始');
import AuthScreen from '../screens/auth/AuthScreen';
import ProductDetailScreen from '../screens/detail/ProductDetailScreen';
import { useStyle } from '@/contexts/ThemeContext';
console.log('[AppNavigator.tsx] 4. スクリーンインポート完了');

// 型定義
type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
  ProductDetail: { productId: string };
};

// スタックナビゲーター
const Stack = createNativeStackNavigator<RootStackParamList>();

// ルートナビゲーター
const AppNavigator = () => {
  const { theme } = useStyle();
  console.log('[AppNavigator.tsx] 5. AppNavigator関数実行');
  
  const { user, loading } = useAuth();
  
  console.log('[AppNavigator.tsx] 6. Auth状態:', {
    user: !!user,
    loading: loading
  });

  // ローディング中はローディング画面を表示
  if (loading) {
    console.log('[AppNavigator.tsx] 7. ローディング画面表示');
    return (
      <View style={{ 
        flex: 1, 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: theme.colors.background
      }}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ marginTop: 16, color: '#6b7280' }}>読み込み中...</Text>
      </View>
    );
  }

  console.log('[AppNavigator.tsx] 8. Navigation構築開始');
  
  return (
    <Stack.Navigator 
      screenOptions={{ 
        headerShown: false,
        contentStyle: {
          backgroundColor: theme.colors.background,
        }
      }}
    >
      {user ? (
        <>
          {console.log('[AppNavigator.tsx] 9. ユーザー認証済み - Main画面表示')}
          <Stack.Screen name="Main" component={MainNavigator} />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        </>
      ) : (
        <>
          {console.log('[AppNavigator.tsx] 10. 未認証 - Auth画面表示')}
          <Stack.Screen name="Auth" component={AuthScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
