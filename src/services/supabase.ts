import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/env';

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

// Create Supabase client with proper configuration for React Native
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
    debug: false, // 本番環境ではfalse、必要に応じて__DEV__に変更
  },
  realtime: {
    enabled: false, // MVP段階ではRealtimeを無効化
  },
  global: {
    headers: {
      'X-Client-Info': 'stilya-app/1.0.0',
    },
  },
  db: {
    schema: 'public',
  },
});

// Database table definitions for type safety
export const TABLES = {
  USERS: 'users',
  PRODUCTS: 'products',
  SWIPES: 'swipes',
  FAVORITES: 'favorites',
  CLICK_LOGS: 'click_logs',
} as const;

// Helper function to handle Supabase errors
export const handleSupabaseError = (error: Error | { message: string } | any) => {
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
  if (errorMessage.includes('Network request failed')) {
    errorMessage = 'ネットワーク接続エラーが発生しました。インターネット接続を確認してください。';
  }
  
  return {
    success: false,
    error: errorMessage,
  };
};

// Helper function for successful responses
export const handleSupabaseSuccess = <T>(data: T) => {
  return {
    success: true,
    data,
    error: null,
  };
};

// Auth functions with better error handling
export const signIn = async (email: string, password: string) => {
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

export const signUp = async (email: string, password: string) => {
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

export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return handleSupabaseSuccess(null);
  } catch (error: any) {
    return handleSupabaseError(error);
  }
};

export const resetPassword = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return handleSupabaseSuccess(data);
  } catch (error: any) {
    return handleSupabaseError(error);
  }
};

export const updatePassword = async (newPassword: string) => {
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

export const refreshSession = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return handleSupabaseSuccess(data);
  } catch (error: any) {
    return handleSupabaseError(error);
  }
};

export const isSessionExpired = (session: any) => {
  if (!session) return true;
  
  const expiresAt = session.expires_at;
  if (!expiresAt) return true;
  
  const now = Date.now() / 1000;
  return now > expiresAt;
};

// User profile functions
export const createUserProfile = async (userId: string, profile: any) => {
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

export const getUserProfile = async (userId: string) => {
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

export const updateUserProfile = async (userId: string, updates: any) => {
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
export const testSupabaseConnection = async () => {
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
