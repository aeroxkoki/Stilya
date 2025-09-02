import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import OptimizedRecommendScreen from '@/screens/recommend/OptimizedRecommendScreen';
import ProductDetailScreen from '@/screens/detail/ProductDetailScreen';
import { RecommendStackParamList } from '@/types';
import { useStyle } from '@/contexts/ThemeContext';

const Stack = createStackNavigator<RecommendStackParamList>();

const RecommendNavigator: React.FC = () => {
  const { theme } = useStyle();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen name="RecommendHome" component={OptimizedRecommendScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
};

export default RecommendNavigator;