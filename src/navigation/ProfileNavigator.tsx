import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProfileStackParamList } from '@/types';
import ProfileScreen from '@/screens/profile/ProfileScreen';
import SettingsScreen from '@/screens/profile/SettingsScreen';
import FavoritesScreen from '@/screens/profile/FavoritesScreen';
import SwipeHistoryScreen from '@/screens/profile/SwipeHistoryScreen';
import ProductDetailScreen from '@/screens/detail/ProductDetailScreen';
import { DebugSupabaseScreen } from '@/screens/debug/SupabaseDiagnosticScreen';

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
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
      <Stack.Screen 
        name="SupabaseDiagnostic" 
        component={DebugSupabaseScreen} 
        options={{ 
          headerShown: true,
          title: 'データベース診断' 
        }} 
      />
    </Stack.Navigator>
  );
};

export default ProfileNavigator;