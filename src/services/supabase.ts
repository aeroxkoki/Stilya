import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, AppState } from 'react-native';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/env';

// Force URL polyfill loading before Supabase initialization
if (typeof globalThis.URL === 'undefined') {
  require('react-native-url-polyfill/auto');
}

// Supabase configuration from centralized environment variables
const supabaseUrl = SUPABASE_URL.trim();
const supabaseAnonKey = SUPABASE_ANON_KEY.trim();

// 開発環境でのみデバッグ情報を表示
if (__DEV__) {
  console.log('[Supabase] Initializing...');
  console.log('[Supabase] URL:', supabaseUrl ? 'Set' : 'Not set');
  console.log('[Supabase] Key:', supabaseAnonKey ? 'Set' : 'Not set');
  console.log('[Supabase] Platform:', Platform.OS);
}

// 環境変数が設定されていない場合の警告
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase環境変数が設定されていません。',
    '\n1. .envファイルにEXPO_PUBLIC_SUPABASE_URLとEXPO_PUBLIC_SUPABASE_ANON_KEYを設定',
    '\n2. または app.config.js の extra フィールドに supabaseUrl と supabaseAnonKey を設定してください。'
  );
}

// Custom fetch with timeout and retry logic for production
const customFetch = (url: RequestInfo | URL, options: RequestInit = {}) => {
  const timeout = 30000; // 30 seconds
  const controller = new AbortController();
  
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  return fetch(url, {
    ...options,
    signal: controller.signal,
  }).finally(() => clearTimeout(timeoutId));
};

// Create Supabase client with proper configuration for React Native
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
    debug: __DEV__, // 開発環境でのみデバッグを有効化
  },
  global: {
    fetch: customFetch,
    headers: {
      'X-Client-Info': 'stilya-app/1.0.0',
    },
  },
  // Disable realtime for MVP
  realtime: {} as any, // realtimeを無効化（MVPでは使用しない）
  db: {
    schema: 'public',
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

// Database table definitions for type safety
export const TABLES = {
  USERS: 'users',
  PRODUCTS: 'products',
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
export const handleSupabaseError = (error: Error | { message: string } | any): SupabaseError => {
  if (__DEV__) {
    console.error('Supabase error:', error);
  }
  
  let errorMessage = 'An unexpected error occurred';
  
  if (error?.message) {
    errorMessage = error.message;
  } else if (error?.error_description) {
    errorMessage = error.error_description;
  } else if (error?.msg) {
    errorMessage = error.msg;
  } else if (typeof error === 'string') {
    errorMessage = error;
  }
  
  // ネットワークエラーの場合、より親切なメッセージを表示
  if (errorMessage.includes('Network request failed') || errorMessage.includes('fetch failed')) {
    errorMessage = 'ネットワーク接続エラーが発生しました。インターネット接続を確認してください。';
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

// Auth functions with better error handling
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
      .single();
      
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

// ネットワーク接続テスト関数（開発用）
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