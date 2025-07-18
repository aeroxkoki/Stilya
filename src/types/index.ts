import { FASHION_STYLES } from '@/constants/constants';

// Fashion styles (for onboarding) - constantsから生成
export type FashionStyle = typeof FASHION_STYLES[number]['id'];

// App theme styles 
export type StyleType = 'minimal' | 'natural' | 'bold';

// Style to theme mapping
export const fashionStyleToTheme: Record<FashionStyle, StyleType> = {
  'casual': 'natural',
  'street': 'bold',
  'mode': 'minimal',
  'natural': 'natural',
  'classic': 'minimal',
  'feminine': 'natural',
};

// ユーザー情報
export interface User {
  id: string;
  email?: string;
  createdAt?: string;
  gender?: 'male' | 'female' | 'other';
  stylePreference?: string[];
  ageGroup?: string;
  nickname?: string; // SettingsScreenのエラー修正用に追加
  onboardingCompleted?: boolean; // オンボーディング完了フラグ
  uiStyle?: StyleType; // UIスタイル設定
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
  action: 'view' | 'click' | 'purchase';
  createdAt?: string;
}

// ユーザー好み分析情報
export interface UserPreference {
  userId: string;
  likedTags: string[];
  dislikedTags: string[];
  preferredCategories: string[];
  dislikedCategories?: string[]; // 嫌いなカテゴリ（新規追加）
  avgPriceRange: { min: number; max: number };
  brands?: string[]; // 推薦サービスで使用
  dislikedBrands?: string[]; // 嫌いなブランド（新規追加）
  price_range?: { min: number; max: number }; // レガシー対応
  // 拡張分析プロパティ
  tagScores?: Record<string, number>;
  topTags?: string[];
  styleProfile?: {
    casual: number;
    formal: number;
    trendy: number;
    classic: number;
  };
}

// 認証状態
export interface AuthState {
  user: User | null;
  session: Record<string, unknown> | null;
  loading: boolean;
  error: string | null;
}

// 認証フック戻り値
export interface UseAuthReturn {
  user: User | null;
  session: Record<string, unknown> | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

// Enhanced User Preference Types
export interface EnhancedUserPreference extends UserPreference {
  stylePatterns?: Record<string, number>;
  colorPreferences?: Record<string, number>;
  priceSensitivity?: {
    preferredRange: { min: number; max: number };
    sensitivity: number;
  };
  brandLoyalty?: {
    loyaltyScore: number;
    topBrands: string[];
  };
  totalSwipes?: number;
  avgResponseTime?: number;
}

// Session Learning Types
export interface SessionSwipe {
  productId: string;
  result: 'yes' | 'no';
  timestamp: Date;
  responseTime: number;
}

export interface SessionData {
  recentSwipes: SessionSwipe[];
  sessionStartTime: Date;
}

// ナビゲーション関連の型をエクスポート
export * from '../navigation/types';
