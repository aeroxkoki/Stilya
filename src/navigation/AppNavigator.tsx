console.log('[AppNavigator.tsx] 1. ファイル読み込み開始');

import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

console.log('[AppNavigator.tsx] 2. 基本インポート完了');

// Context
import { useAuth } from '../contexts/AuthContext';

// Screens
console.log('[AppNavigator.tsx] 3. スクリーンインポート開始');
import SwipeScreen from '../screens/swipe/SwipeScreen';
import RecommendScreen from '../screens/recommend/RecommendScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import AuthScreen from '../screens/auth/AuthScreen';
import ProductDetailScreen from '../screens/detail/ProductDetailScreen';
console.log('[AppNavigator.tsx] 4. スクリーンインポート完了');

// 型定義
type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
  ProductDetail: { productId: string };
};

type MainTabParamList = {
  Swipe: undefined;
  Recommendations: undefined;
  Profile: undefined;
};

// スタックナビゲーター
const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// メインのタブナビゲーション
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#6b7280',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          height: 60,
          paddingBottom: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginBottom: 4,
        },
        headerShown: false,
      }}
    >
      <Tab.Screen
        name="Swipe"
        component={SwipeScreen}
        options={{
          tabBarLabel: 'スワイプ',
          tabBarIcon: ({ color, size }) => (
            <Feather name="repeat" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Recommendations"
        component={RecommendScreen}
        options={{
          tabBarLabel: 'おすすめ',
          tabBarIcon: ({ color, size }) => (
            <Feather name="heart" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'マイページ',
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

// ルートナビゲーター
const AppNavigator = () => {
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
        backgroundColor: '#ffffff'
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
          backgroundColor: '#ffffff',
        }
      }}
    >
      {user ? (
        <>
          {console.log('[AppNavigator.tsx] 9. ユーザー認証済み - Main画面表示')}
          <Stack.Screen name="Main" component={MainTabNavigator} />
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
