import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProfileStackParamList } from '@/types';
import ProfileScreen from '@/screens/profile/ProfileScreen';
import SettingsScreen from '@/screens/profile/SettingsScreen';
import FavoritesScreen from '@/screens/profile/FavoritesScreen';
import SwipeHistoryScreen from '@/screens/profile/SwipeHistoryScreen';
import { IS_DEV } from '@/utils/env';
import RakutenDebugScreen from '@/screens/debug/RakutenDebugScreen';

const Stack = createStackNavigator<ProfileStackParamList>();

const ProfileNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'white' },
      }}
    >
      <Stack.Screen name="ProfileHome" component={ProfileScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Favorites" component={FavoritesScreen} />
      <Stack.Screen name="SwipeHistory" component={SwipeHistoryScreen} />
      {IS_DEV && (
        <Stack.Screen 
          name="RakutenDebug" 
          component={RakutenDebugScreen} 
          options={{ headerShown: true, title: '楽天APIデバッグ' }}
        />
      )}
    </Stack.Navigator>
  );
};

export default ProfileNavigator;