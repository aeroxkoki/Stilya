import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState, AppStateStatus } from 'react-native';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/env';

// Supabase configuration
const supabaseUrl = SUPABASE_URL.trim();
const supabaseAnonKey = SUPABASE_ANON_KEY.trim();

// 開発環境でのみデバッグ情報を表示
if (__DEV__) {
  console.log('[Supabase] Initializing with URL:', supabaseUrl);
}

// 環境変数チェック
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Supabase環境変数が設定されていません。.envファイルを確認してください。'
  );
}

// Create Supabase client - シンプルな設定
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// AppState listener
let appStateSubscription: any;

export const initializeSupabaseListeners = () => {
  // Remove existing listener if any
  if (appStateSubscription) {
    appStateSubscription.remove();
  }
  
  // Register new listener
  appStateSubscription = AppState.addEventListener('change', (state: AppStateStatus) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
};

export const cleanupSupabaseListeners = () => {
  if (appStateSubscription) {
    appStateSubscription.remove();
  }
};

// Database table definitions
export const TABLES = {
  USERS: 'users',
  PRODUCTS: 'external_products',
  EXTERNAL_PRODUCTS: 'external_products',
  SWIPES: 'swipes',
  FAVORITES: 'favorites',
  CLICK_LOGS: 'click_logs',
} as const;

// 接続テスト関数（シンプル版）
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('[Supabase] Connection test error:', error.message);
      return false;
    }
    console.log('[Supabase] Connection test successful');
    return true;
  } catch (error: any) {
    console.error('[Supabase] Connection test failed:', error.message);
    return false;
  }
};

// エラーハンドリングヘルパー関数
export const handleSupabaseError = (error: Error | { message: string }) => {
  const errorMessage = 'message' in error ? error.message : error.toString();
  console.error('[Supabase Error]:', errorMessage);
  
  // エラーの詳細情報をログに出力
  if (error && typeof error === 'object' && 'details' in error) {
    console.error('[Supabase Error Details]:', error);
  }
  
  return {
    success: false,
    error: errorMessage,
  };
};

// 成功レスポンスヘルパー関数
export const handleSupabaseSuccess = <T>(data: T) => {
  return {
    success: true,
    data,
  };
};
