import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from '@/types';

// ナビゲーター
import SwipeNavigator from './SwipeNavigator';
import RecommendNavigator from './RecommendNavigator';
import ProfileScreen from '@/screens/profile/ProfileScreen';
import DevNavigator from './DevNavigator';

const Tab = createBottomTabNavigator<MainTabParamList>();

const MainNavigator: React.FC = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Swipe') {
            iconName = focused ? 'card' : 'card-outline';
          } else if (route.name === 'Recommend') {
            iconName = focused ? 'star' : 'star-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else if (route.name === 'Dev') {
            iconName = focused ? 'code-working' : 'code-outline';
          } else {
            iconName = 'help-circle';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: 'gray',
        tabBarStyle: { 
          paddingBottom: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      })}
    >
      <Tab.Screen
        name="Swipe"
        component={SwipeNavigator}
        options={{ title: 'スワイプ' }}
      />
      <Tab.Screen
        name="Recommend"
        component={RecommendNavigator}
        options={{ title: 'おすすめ' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: 'マイページ' }}
      />
      <Tab.Screen
        name="Dev"
        component={DevNavigator}
        options={{ 
          title: '開発ツール',
          tabBarStyle: { 
            paddingBottom: 5,
            height: 60,
            display: __DEV__ ? 'flex' : 'none'
          }
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;