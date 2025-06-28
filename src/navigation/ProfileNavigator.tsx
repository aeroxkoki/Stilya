import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProfileStackParamList } from '@/types';
import ProfileScreen from '@/screens/profile/ProfileScreen';
import SettingsScreen from '@/screens/profile/SettingsScreen';
import FavoritesScreen from '@/screens/profile/FavoritesScreen';
import SwipeHistoryScreen from '@/screens/profile/SwipeHistoryScreen';
import ProductDetailScreen from '@/screens/detail/ProductDetailScreen';
import { DebugSupabaseScreen } from '@/screens/debug/SupabaseDiagnosticScreen';
import { ImageDebugScreen } from '@/screens/debug/ImageDebugScreen';
import ImageDiagnosisScreen from '@/screens/debug/ImageDiagnosisScreen';
import ImageTestScreen from '@/screens/dev/ImageTestScreen';
import AdminScreen from '@/screens/settings/AdminScreen';
import { useStyle } from '@/contexts/ThemeContext';

const Stack = createStackNavigator<ProfileStackParamList>();

const ProfileNavigator: React.FC = () => {
  const { theme } = useStyle();
  
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: theme.colors.background },
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
      <Stack.Screen 
        name="ImageDebug" 
        component={ImageDebugScreen} 
        options={{ 
          headerShown: true,
          title: '画像デバッグ' 
        }} 
      />
      <Stack.Screen 
        name="ImageDiagnosis" 
        component={ImageDiagnosisScreen} 
        options={{ 
          headerShown: true,
          title: '画像URL診断' 
        }} 
      />
      <Stack.Screen 
        name="ImageTest" 
        component={ImageTestScreen} 
        options={{ 
          headerShown: true,
          title: '画像読み込みテスト' 
        }} 
      />
      <Stack.Screen 
        name="Admin" 
        component={AdminScreen} 
        options={{ 
          headerShown: true,
          title: '管理画面' 
        }} 
      />
    </Stack.Navigator>
  );
};

export default ProfileNavigator;