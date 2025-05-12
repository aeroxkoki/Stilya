import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '@/screens/onboarding/WelcomeScreen';
import GenderScreen from '@/screens/onboarding/GenderScreen';
import StyleScreen from '@/screens/onboarding/StyleScreen';
import AgeGroupScreen from '@/screens/onboarding/AgeGroupScreen';
import CompleteScreen from '@/screens/onboarding/CompleteScreen';
import { OnboardingStackParamList } from '@/types';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

const OnboardingNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      initialRouteName="Welcome"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: { backgroundColor: 'white' },
      }}
    >
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="Gender" component={GenderScreen} />
      <Stack.Screen name="Style" component={StyleScreen} />
      <Stack.Screen name="AgeGroup" component={AgeGroupScreen} />
      <Stack.Screen name="Complete" component={CompleteScreen} />
    </Stack.Navigator>
  );
};

export default OnboardingNavigator;
