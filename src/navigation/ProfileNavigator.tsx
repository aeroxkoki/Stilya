import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProfileStackParamList } from '@/types';
import ProfileScreen from '@/screens/profile/ProfileScreen';
import SettingsScreen from '@/screens/profile/SettingsScreen';
import FavoritesScreen from '@/screens/profile/FavoritesScreen';
import SwipeHistoryScreen from '@/screens/profile/SwipeHistoryScreen';

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
    </Stack.Navigator>
  );
};

export default ProfileNavigator;