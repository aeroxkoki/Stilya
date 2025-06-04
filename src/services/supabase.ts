console.log('[supabase.ts] 1. ファイル読み込み開始');

import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

console.log('[supabase.ts] 2. インポート完了');

// Supabase configuration from environment variables
// 余分なスペースや改行を削除
const supabaseUrl = (process.env.EXPO_PUBLIC_SUPABASE_URL || '').trim();
const supabaseAnonKey = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '').trim();

console.log('[supabase.ts] 3. 環境変数確認');
console.log('SUPABASE_URL:', supabaseUrl ? '設定済み' : '未設定');
console.log('SUPABASE_ANON_KEY:', supabaseAnonKey ? '設定済み' : '未設定');
console.log('Platform:', Platform.OS);
console.log('DEV mode:', __DEV__);

// 環境変数が設定されていない場合の警告
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase環境変数が設定されていません。',
    '\n.envファイルを作成し、EXPO_PUBLIC_SUPABASE_URLとEXPO_PUBLIC_SUPABASE_ANON_KEYを設定してください。',
    '\n参考: .env.example'
  );
}

console.log('[supabase.ts] 4. Supabaseクライアント作成開始');

// Create Supabase client with proper configuration for React Native
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    // 開発環境での設定
    flowType: 'pkce',
    debug: __DEV__, // 開発環境でデバッグログを有効化
  },
  // Realtime機能は一時的に無効化（ネットワークエラーの原因になりやすい）
  realtime: {
    enabled: false,
  },
  // fetchオプションの調整
  global: {
    headers: {
      'X-Client-Info': 'stilya-app/1.0.0',
    },
  },
  // 追加のデバッグ設定
  db: {
    schema: 'public',
  },
  // ネットワークタイムアウトの設定
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
    debug: __DEV__,
  },
});

// デバッグ用: fetchのインターセプト
if (__DEV__) {
  const originalFetch = global.fetch;
  global.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    console.log('[Fetch Debug] Request:', {
      url: typeof input === 'string' ? input : input.toString(),
      method: init?.method || 'GET',
      headers: init?.headers,
    });
    
    try {
      const response = await originalFetch(input, init);
      console.log('[Fetch Debug] Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.url,
      });
      return response;
    } catch (error) {
      console.error('[Fetch Debug] Error:', error);
      throw error;
    }
  };
}

console.log('[supabase.ts] 5. Supabaseクライアント作成完了');

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
  console.error('Supabase error:', error);
  
  // より詳細なエラー情報を提供
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
    console.log('[signIn] Starting login attempt for:', email);
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(), // メールアドレスを正規化
      password,
    });
    
    if (error) {
      console.error('[signIn] Error:', error);
      throw error;
    }
    
    console.log('[signIn] Success:', data?.user?.email);
    return handleSupabaseSuccess(data);
  } catch (error: any) {
    console.error('[signIn] Caught error:', error);
    return handleSupabaseError(error);
  }
};

export const signUp = async (email: string, password: string) => {
  try {
    console.log('[signUp] Starting registration for:', email);
    
    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(), // メールアドレスを正規化
      password,
      options: {
        data: {
          created_at: new Date().toISOString(),
        },
      },
    });
    
    if (error) {
      console.error('[signUp] Error:', error);
      throw error;
    }
    
    console.log('[signUp] Success:', data?.user?.email);
    return handleSupabaseSuccess(data);
  } catch (error: any) {
    console.error('[signUp] Caught error:', error);
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

// ネットワーク接続テスト関数
export const testSupabaseConnection = async () => {
  try {
    console.log('[testSupabaseConnection] Testing connection to Supabase...');
    
    // 簡単なヘルスチェック
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error('[testSupabaseConnection] Error:', error);
      return false;
    }
    
    console.log('[testSupabaseConnection] Success! Connection is working.');
    return true;
  } catch (error) {
    console.error('[testSupabaseConnection] Failed:', error);
    return false;
  }
};

// 初期接続テストを実行
testSupabaseConnection();
