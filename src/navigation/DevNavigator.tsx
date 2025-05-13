import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DevNavigatorParamList } from '@/types';
import RecommendationTestScreen from '@/screens/dev/RecommendationTestScreen';

const Stack = createNativeStackNavigator<DevNavigatorParamList>();

/**
 * 開発者向けツール画面のナビゲーター
 */
const DevNavigator: React.FC = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="RecommendationTest" 
        component={RecommendationTestScreen} 
        options={{ 
          title: 'レコメンド機能テスト',
          headerLargeTitle: true
        }} 
      />
    </Stack.Navigator>
  );
};

export default DevNavigator;