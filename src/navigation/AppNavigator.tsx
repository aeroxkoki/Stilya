import React, { useEffect, useState } from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
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
import { useTheme } from '../contexts/ThemeContext';

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
  const { theme, isDarkMode } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.text.secondary,
        tabBarStyle: {
          backgroundColor: theme.colors.background.main,
          borderTopWidth: 1,
          borderTopColor: theme.colors.border.light,
          elevation: 0, // Android用シャドウ除去
          shadowOpacity: 0, // iOS用シャドウ除去
          height: 60, // タブバーの高さ調整
          paddingBottom: 8, // 下部のパディング
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

// カスタムナビゲーションテーマ
const getNavigationTheme = (appTheme: any, isDark: boolean) => {
  const baseTheme = isDark ? DarkTheme : DefaultTheme;
  
  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: appTheme.colors.primary,
      background: appTheme.colors.background.main,
      card: appTheme.colors.background.card,
      text: appTheme.colors.text.primary,
      border: appTheme.colors.border.light,
      notification: appTheme.colors.status.error,
    },
  };
};

// ルートナビゲーター
const AppNavigator = () => {
  const { user, isLoading, fetchProfile, isSessionValid } = useAuth();
  const { theme, isDarkMode } = useTheme();
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  
  // カスタムナビゲーションテーマを取得
  const navigationTheme = getNavigationTheme(theme, isDarkMode);

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

  // ローディング中はローディング画面を表示
  if (isLoading) {
    return (
      <View 
        style={{ 
          flex: 1, 
          justifyContent: 'center', 
          alignItems: 'center',
          backgroundColor: theme.colors.background.main 
        }}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          headerStyle: {
            backgroundColor: theme.colors.background.main,
            elevation: 0,
            shadowOpacity: 0,
          },
          headerTintColor: theme.colors.text.primary,
          headerTitleStyle: {
            fontWeight: '600',
          },
          cardStyle: {
            backgroundColor: theme.colors.background.main,
          }
        }}
      >
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