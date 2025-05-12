// æü¶ü¢#n‹š©
export interface User {
  id: string;
  email?: string;
  createdAt?: string;
  gender?: 'male' | 'female' | 'other';
  stylePreference?: string[];
  ageGroup?: string;
}

// FÁ¢#n‹š©
export interface Product {
  id: string;
  title: string;
  imageUrl: string;
  brand?: string;
  price: number;
  tags?: string[];
  category?: string;
  affiliateUrl: string;
  source?: string;
  createdAt?: string;
}

// ¹ï¤×¢#n‹š©
export interface Swipe {
  id: string;
  userId: string;
  productId: string;
  result: 'yes' | 'no';
  createdAt: string;
}

// JkeŠ¢#n‹š©
export interface Favorite {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
}

// ¯êÃ¯í°¢#n‹š©
export interface ClickLog {
  id?: string;
  userId: string;
  productId: string;
  createdAt?: string;
}

// <¢#n‹š©
export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
  error: string | null;
}

// ÊÓ²ü·çó¢#n‹š©
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Onboarding: undefined;
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Swipe: undefined;
  Recommend: undefined;
  Profile: undefined;
};

export type OnboardingStackParamList = {
  Welcome: undefined;
  AppIntro: undefined;
  Gender: undefined;
  Style: undefined;
  AgeGroup: undefined;
  Complete: undefined;
};

export type SwipeStackParamList = {
  SwipeHome: undefined;
  ProductDetail: { productId: string };
};

export type RecommendStackParamList = {
  RecommendHome: undefined;
  ProductDetail: { productId: string };
};

export type ProfileStackParamList = {
  ProfileHome: undefined;
  Settings: undefined;
  Favorites: undefined;
  SwipeHistory: undefined;
};