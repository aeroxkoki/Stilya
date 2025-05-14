// ユーザー情報
export interface User {
  id: string;
  email?: string;
  createdAt?: string;
  gender?: 'male' | 'female' | 'other';
  stylePreference?: string[];
  ageGroup?: string;
  nickname?: string; // SettingsScreenのエラー修正用に追加
}

// 商品情報 - product.tsを参照
export * from './product';

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

// 認証フック戻り値
export interface UseAuthReturn {
  user: User | null;
  session: any | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// ナビゲーション定義
export type RootStackParamList = {
  Auth: undefined;
  Main: undefined;
  Onboarding: undefined;
  ProductDetail: { productId: string };
};

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainTabParamList = {
  Swipe: undefined;
  Recommend: undefined;
  Report: undefined;
  Profile: undefined;
  Dev: undefined;
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

export type DevNavigatorParamList = {
  RecommendationTest: undefined;
  AnimationTest: undefined;
};

export type ReportStackParamList = {
  Report: undefined;
};
