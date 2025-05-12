import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SwipeScreen from '@/screens/swipe/SwipeScreen';
import ProductDetailScreen from '@/screens/detail/ProductDetailScreen';
import { SwipeStackParamList } from '@/types';

const Stack = createStackNavigator<SwipeStackParamList>();

const SwipeNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: 'white' },
      }}
    >
      <Stack.Screen name="SwipeHome" component={SwipeScreen} />
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
};

export default SwipeNavigator;