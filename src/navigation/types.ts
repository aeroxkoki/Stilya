import { NavigatorScreenParams } from '@react-navigation/native';
import { StackScreenProps } from '@react-navigation/stack';
import { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import { CompositeScreenProps } from '@react-navigation/native';

// Auth Stack
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

// Onboarding Stack (新しいフロー)
export type OnboardingStackParamList = {
  Welcome: undefined;
  QuickProfile: undefined;
  UnifiedSwipe: undefined;
  StyleReveal: undefined;
  Complete: undefined;
  // Legacy screens (互換性のため残す)
  AppIntro?: undefined;
  Gender?: undefined;
  Style?: undefined;
  StyleQuiz?: undefined;
  StyleSelection?: undefined;
  AgeGroup?: undefined;
};

// Swipe Stack
export type SwipeStackParamList = {
  SwipeHome: undefined;
  ProductDetail: { productId: string; from?: string };
};

// Recommend Stack
export type RecommendStackParamList = {
  RecommendHome: undefined;
  ProductDetail: { productId: string };
};

// Profile Stack  
export type ProfileStackParamList = {
  ProfileHome: undefined;
  Settings: undefined;
  Favorites: undefined;
  SwipeHistory: undefined;
  ProductDetail: { productId: string };
  SupabaseDiagnostic: undefined;
  Admin: undefined;
  ImageDebug?: undefined;
  ImageDiagnosis?: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  Swipe: NavigatorScreenParams<SwipeStackParamList>;
  Recommend: NavigatorScreenParams<RecommendStackParamList>;
  Profile: NavigatorScreenParams<ProfileStackParamList>;
};

// Root Stack
export type RootStackParamList = {
  Auth: NavigatorScreenParams<AuthStackParamList>;
  Main: NavigatorScreenParams<MainTabParamList>;
  Onboarding: NavigatorScreenParams<OnboardingStackParamList>;
};

// Screen Props Types
export type AuthScreenProps<T extends keyof AuthStackParamList> = 
  StackScreenProps<AuthStackParamList, T>;

export type OnboardingScreenProps<T extends keyof OnboardingStackParamList> = 
  StackScreenProps<OnboardingStackParamList, T>;

export type SwipeScreenProps<T extends keyof SwipeStackParamList> = 
  CompositeScreenProps<
    StackScreenProps<SwipeStackParamList, T>,
    CompositeScreenProps<
      BottomTabScreenProps<MainTabParamList, 'Swipe'>,
      StackScreenProps<RootStackParamList>
    >
  >;

export type RecommendScreenProps<T extends keyof RecommendStackParamList> = 
  CompositeScreenProps<
    StackScreenProps<RecommendStackParamList, T>,
    CompositeScreenProps<
      BottomTabScreenProps<MainTabParamList, 'Recommend'>,
      StackScreenProps<RootStackParamList>
    >
  >;

export type ProfileScreenProps<T extends keyof ProfileStackParamList> = 
  CompositeScreenProps<
    StackScreenProps<ProfileStackParamList, T>,
    CompositeScreenProps<
      BottomTabScreenProps<MainTabParamList, 'Profile'>,
      StackScreenProps<RootStackParamList>
    >
  >;

export type RootScreenProps<T extends keyof RootStackParamList> = 
  StackScreenProps<RootStackParamList, T>;
