import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

// Context
import { useAuth } from '../contexts/AuthContext';

// Screens
import SwipeScreen from '../screens/swipe/SwipeScreen';
import RecommendScreen from '../screens/recommend/RecommendScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import AuthScreen from '../screens/auth/AuthScreen';
import ProductDetailScreen from '../screens/detail/ProductDetailScreen';

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
  const { user, isLoading } = useAuth();

  // ローディング中はローディング画面を表示
  if (isLoading) {
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
          <Stack.Screen name="Main" component={MainTabNavigator} />
          <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
        </>
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
