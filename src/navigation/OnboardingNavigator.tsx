import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '@/screens/onboarding/WelcomeScreen';
import QuickProfileScreen from '@/screens/onboarding/QuickProfileScreen';
import UnifiedSwipeScreen from '@/screens/onboarding/UnifiedSwipeScreen';
import StyleRevealScreen from '@/screens/onboarding/StyleRevealScreen';
import CompleteScreen from '@/screens/onboarding/CompleteScreen';
// レガシー画面（必要に応じて）
import AppIntroScreen from '@/screens/onboarding/AppIntroScreen';
import GenderScreen from '@/screens/onboarding/GenderScreen';
import StyleScreen from '@/screens/onboarding/StyleScreen';
import StyleQuizScreen from '@/screens/onboarding/StyleQuizScreen';
import StyleSelectionScreen from '@/screens/onboarding/StyleSelectionScreen';
import AgeGroupScreen from '@/screens/onboarding/AgeGroupScreen';

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
      {/* 新しいフロー */}
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="QuickProfile" component={QuickProfileScreen} />
      <Stack.Screen name="UnifiedSwipe" component={UnifiedSwipeScreen} />
      <Stack.Screen name="StyleReveal" component={StyleRevealScreen} />
      <Stack.Screen name="Complete" component={CompleteScreen} />
      
      {/* レガシー画面（後方互換性のため） */}
      <Stack.Screen name="AppIntro" component={AppIntroScreen} />
      <Stack.Screen name="Gender" component={GenderScreen} />
      <Stack.Screen name="Style" component={StyleScreen} />
      <Stack.Screen name="StyleQuiz" component={StyleQuizScreen} />
      <Stack.Screen name="StyleSelection" component={StyleSelectionScreen} />
      <Stack.Screen name="AgeGroup" component={AgeGroupScreen} />
    </Stack.Navigator>
  );
};

export default OnboardingNavigator;
