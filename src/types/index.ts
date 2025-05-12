// ユーザー関連の型定義
export interface User {
  id: string;
  email?: string;
  createdAt?: string;
  gender?: 'male' | 'female' | 'other';
  stylePreference?: string[];
  ageGroup?: string;
}

// 商品関連の型定義
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

// スワイプ関連の型定義
export interface Swipe {
  id: string;
  userId: string;
  productId: string;
  result: 'yes' | 'no';
  createdAt: string;
}

// お気に入り関連の型定義
export interface Favorite {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
}

// クリックログ関連の型定義
export interface ClickLog {
  id?: string;
  userId: string;
  productId: string;
  createdAt?: string;
}

// 認証関連の型定義
export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
  error: string | null;
}

// ナビゲーション関連の型定義
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
