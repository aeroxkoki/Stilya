import { NavigatorScreenParams } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// Main Stack
export type MainStackParamList = {
  Home: undefined;
  Swipe: undefined;
  Profile: undefined;
  Recommendations: undefined;
  ProductDetail: { productId: string };
};

// Onboarding Stack
export type OnboardingStackParamList = {
  Onboarding: undefined;
};

// Root Stack
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainStackParamList>;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
};

// Screen Props
export type AuthScreenProps<T extends keyof AuthStackParamList> = 
  StackScreenProps<AuthStackParamList, T>;

export type MainScreenProps<T extends keyof MainStackParamList> = 
  StackScreenProps<MainStackParamList, T>;

export type OnboardingScreenProps<T extends keyof OnboardingStackParamList> = 
  StackScreenProps<OnboardingStackParamList, T>;

export type RootScreenProps<T extends keyof RootStackParamList> = 
  StackScreenProps<RootStackParamList, T>;
