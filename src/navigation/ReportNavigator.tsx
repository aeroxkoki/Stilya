import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import ReportScreen from '../screens/report/ReportScreen';

export type ReportStackParamList = {
  ReportMain: undefined;
  // 必要に応じて詳細画面などを追加
};

const Stack = createNativeStackNavigator<ReportStackParamList>();

const ReportNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="ReportMain" component={ReportScreen} />
      {/* 必要に応じて詳細画面などを追加 */}
    </Stack.Navigator>
  );
};

export default ReportNavigator;
