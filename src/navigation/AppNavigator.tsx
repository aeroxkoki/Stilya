import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text } from 'react-native';
import { Feather } from '@expo/vector-icons';

// Context
import { useAuth } from '../contexts/AuthContext';

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
const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

// 一時的なスクリーンコンポーネント
const SwipeScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>スワイプ画面</Text>
    <Text style={{ marginTop: 10, color: '#666' }}>スワイプ機能を実装予定</Text>
  </View>
);

const RecommendationsScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>おすすめ画面</Text>
    <Text style={{ marginTop: 10, color: '#666' }}>レコメンド機能を実装予定</Text>
  </View>
);

const ProfileScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>プロフィール画面</Text>
    <Text style={{ marginTop: 10, color: '#666' }}>プロフィール機能を実装予定</Text>
  </View>
);

const AuthScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text style={{ fontSize: 18, fontWeight: 'bold' }}>認証画面</Text>
    <Text style={{ marginTop: 10, color: '#666' }}>ログイン・サインアップ機能を実装予定</Text>
  </View>
);

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
        cardStyle: {
          backgroundColor: '#ffffff',
        }
      }}
    >
      {user ? (
        <Stack.Screen name="Main" component={MainTabNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthScreen} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
