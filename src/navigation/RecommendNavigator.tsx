import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import RecommendScreen from '@/screens/recommend/RecommendScreen';
import EnhancedRecommendScreen from '@/screens/recommend/EnhancedRecommendScreen';
import ProductDetailScreen from '@/screens/detail/ProductDetailScreen';
import { RecommendStackParamList } from '@/types';
import { useStyle } from '@/contexts/ThemeContext';

const Stack = createStackNavigator<RecommendStackParamList>();

const RecommendNavigator: React.FC = () => {
  const { theme } = useStyle();
  
  // 拡張版レコメンド画面を使用するかどうか
  // 実際のアプリでは設定やフラグなどで切り替える
  const useEnhancedRecommend = true;

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: theme.colors.background },
      }}
    >
      {useEnhancedRecommend ? (
        <Stack.Screen name="RecommendHome" component={EnhancedRecommendScreen} />
      ) : (
        <Stack.Screen name="RecommendHome" component={RecommendScreen} />
      )}
      <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    </Stack.Navigator>
  );
};

export default RecommendNavigator;