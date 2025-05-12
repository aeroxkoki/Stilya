import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import RecommendScreen from '@/screens/recommend/RecommendScreen';
import ProductDetailScreen from '@/screens/detail/ProductDetailScreen';
import { RecommendStackParamList } from '@/types';

const Stack = createStackNavigator<RecommendStackParamList>();

const RecommendNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'white' },
      }}
    >
      <Stack.Screen name="RecommendHome" component={RecommendScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
};

export default RecommendNavigator;