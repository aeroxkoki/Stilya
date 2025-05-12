import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View } from 'react-native';
import { Feather } from '@expo/vector-icons';

// スクリーンの import
import SwipeScreen from '../screens/SwipeScreen';
import ProductDetailScreen from '../screens/ProductDetailScreen';
import RecommendationsScreen from '../screens/RecommendationsScreen';
import ProfileScreen from '../screens/ProfileScreen';
import AuthScreen from '../screens/AuthScreen';
import OnboardingScreen from '../screens/OnboardingScreen';

// サービスと状態管理
import { supabase } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';

// 型定義
type RootStackParamList = {
  Main: undefined;
  Auth: undefined;
  Onboarding: undefined;
  ProductDetail: { productId: string };
};

type MainTabParamList = {
  Swipe: undefined;
  Recommendations: undefined;
  Profile: undefined;
};

// スタックナビゲーター
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// メインのタブナビゲーション
const MainTabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E7EB',
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
        component={RecommendationsScreen}
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
  const { user, isLoading, fetchProfile, isSessionValid } = useAuth();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);

  // セッションの有効性を定期的にチェック
  useEffect(() => {
    // アプリ起動時にセッションの有効性をチェック
    isSessionValid();

    // 定期的にセッションの有効性をチェック (5分ごと)
    const intervalId = setInterval(() => {
      isSessionValid();
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    // ユーザーがオンボーディングを完了しているか確認するロジック
    const checkOnboardingStatus = async () => {
      if (user) {
        // プロファイルを取得
        await fetchProfile();
        
        // ユーザープロファイルのデータを基にオンボーディング完了かどうかを判定
        const hasCompleted = !!(user.gender && user.stylePreference && user.ageGroup);
        setHasCompletedOnboarding(hasCompleted);
      }
    };

    checkOnboardingStatus();
  }, [user]);

  // ローディング中はスプラッシュスクリーンを表示
  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          hasCompletedOnboarding ? (
            <>
              <Stack.Screen name="Main" component={MainTabNavigator} />
              <Stack.Screen 
                name="ProductDetail" 
                component={ProductDetailScreen}
                options={{
                  headerShown: true,
                  title: '商品詳細',
                  headerBackTitleVisible: false,
                }}
              />
            </>
          ) : (
            <Stack.Screen name="Onboarding" component={OnboardingScreen} />
          )
        ) : (
          <Stack.Screen name="Auth" component={AuthScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;
