// ユーザー情報
export interface User {
  id: string;
  email?: string;
  createdAt?: string;
  gender?: 'male' | 'female' | 'other';
  stylePreference?: string[];
  ageGroup?: string;
}

// 商品情報
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

// スワイプ情報
export interface Swipe {
  id: string;
  userId: string;
  productId: string;
  result: 'yes' | 'no';
  createdAt: string;
}

// お気に入り情報
export interface Favorite {
  id: string;
  userId: string;
  productId: string;
  createdAt: string;
}

// クリックログ
export interface ClickLog {
  id?: string;
  userId: string;
  productId: string;
  createdAt?: string;
}

// ユーザー好み分析情報
export interface UserPreference {
  userId: string;
  tagScores: Record<string, number>;
  topTags: string[];
  lastUpdated: string;
}

// 認証状態
export interface AuthState {
  user: User | null;
  session: any | null;
  loading: boolean;
  error: string | null;
}

// ナビゲーション定義
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