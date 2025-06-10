import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, AppState } from 'react-native';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/env';

// URL polyfillの読み込み
import 'react-native-url-polyfill/auto';

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

// Proper AppState listener registration
let appStateSubscription: any;

export const initializeSupabaseListeners = () => {
  // Remove existing listener if any
  if (appStateSubscription) {
    appStateSubscription.remove();
  }
  
  // Register new listener
  appStateSubscription = AppState.addEventListener('change', (state) => {
    if (state === 'active') {
      supabase.auth.startAutoRefresh();
    } else {
      supabase.auth.stopAutoRefresh();
    }
  });
};

// Call this in App.tsx useEffect
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

// Type-safe error handling
interface SupabaseError {
  success: false;
  error: string;
}

interface SupabaseSuccess<T> {
  success: true;
  data: T;
  error: null;
}

type SupabaseResult<T> = SupabaseSuccess<T> | SupabaseError;

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: any): SupabaseError => {
  if (__DEV__) {
    console.error('[Supabase] Error:', error);
  }
  
  let errorMessage = 'エラーが発生しました';
  
  if (error?.message) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }
  
  // ネットワークエラーの場合
  if (errorMessage.includes('Network request failed') || 
      errorMessage.includes('fetch failed')) {
    errorMessage = 'インターネット接続を確認してください';
  }
  
  return {
    success: false,
    error: errorMessage,
  };
};

// Helper function for successful responses
export const handleSupabaseSuccess = <T>(data: T): SupabaseSuccess<T> => {
  return {
    success: true,
    data,
    error: null,
  };
};

// Auth functions
export const signIn = async (email: string, password: string): Promise<SupabaseResult<any>> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    });
    
    if (error) throw error;
    return handleSupabaseSuccess(data);
  } catch (error: any) {
    return handleSupabaseError(error);
  }
};

export const signUp = async (email: string, password: string): Promise<SupabaseResult<any>> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: {
          created_at: new Date().toISOString(),
        },
      },
    });
    
    if (error) throw error;
    return handleSupabaseSuccess(data);
  } catch (error: any) {
    return handleSupabaseError(error);
  }
};

export const signOut = async (): Promise<SupabaseResult<null>> => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return handleSupabaseSuccess(null);
  } catch (error: any) {
    return handleSupabaseError(error);
  }
};

export const resetPassword = async (email: string): Promise<SupabaseResult<any>> => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return handleSupabaseSuccess(data);
  } catch (error: any) {
    return handleSupabaseError(error);
  }
};

export const updatePassword = async (newPassword: string): Promise<SupabaseResult<any>> => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;
    return handleSupabaseSuccess(data);
  } catch (error: any) {
    return handleSupabaseError(error);
  }
};

export const refreshSession = async (): Promise<SupabaseResult<any>> => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return handleSupabaseSuccess(data);
  } catch (error: any) {
    return handleSupabaseError(error);
  }
};

export const isSessionExpired = (session: any): boolean => {
  if (!session) return true;
  
  const expiresAt = session.expires_at;
  if (!expiresAt) return true;
  
  const now = Date.now() / 1000;
  return now > expiresAt;
};

// User profile functions
export const createUserProfile = async (userId: string, profile: any): Promise<SupabaseResult<any>> => {
  try {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .insert([{ id: userId, ...profile }])
      .select()
      .single();
      
    if (error) throw error;
    return handleSupabaseSuccess(data);
  } catch (error: any) {
    return handleSupabaseError(error);
  }
};

export const getUserProfile = async (userId: string): Promise<SupabaseResult<any>> => {
  try {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .select('*')
      .eq('id', userId)
      .maybeSingle();
      
    if (error) throw error;
    return handleSupabaseSuccess(data);
  } catch (error: any) {
    return handleSupabaseError(error);
  }
};

export const updateUserProfile = async (userId: string, updates: any): Promise<SupabaseResult<any>> => {
  try {
    const { data, error } = await supabase
      .from(TABLES.USERS)
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
      
    if (error) throw error;
    return handleSupabaseSuccess(data);
  } catch (error: any) {
    return handleSupabaseError(error);
  }
};

// 接続テスト関数（シンプル化）
export const testSupabaseConnection = async (): Promise<boolean> => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    
    if (__DEV__) {
      console.log('[Supabase] Connection test successful');
    }
    return true;
  } catch (error) {
    if (__DEV__) {
      console.error('[Supabase] Connection test failed:', error);
    }
    return false;
  }
};
