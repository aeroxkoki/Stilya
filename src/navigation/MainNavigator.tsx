import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { MainTabParamList } from '../types';

// ナビゲーター
import SwipeNavigator from './SwipeNavigator';
import RecommendNavigator from './RecommendNavigator';
import ProfileNavigator from './ProfileNavigator';
import ReportNavigator from './ReportNavigator';

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
          } else if (route.name === 'Report') {
            iconName = focused ? 'bar-chart' : 'bar-chart-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
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
        name="Report"
        component={ReportNavigator}
        options={{ title: 'レポート' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileNavigator}
        options={{ title: 'マイページ' }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;