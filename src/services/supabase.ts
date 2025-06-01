import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Supabase configuration from environment variables
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || '';

// 環境変数が設定されていない場合の警告
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '⚠️ Supabase環境変数が設定されていません。',
    '\n.envファイルを作成し、EXPO_PUBLIC_SUPABASE_URLとEXPO_PUBLIC_SUPABASE_ANON_KEYを設定してください。',
    '\n参考: .env.example'
  );
}

// Create Supabase client with AsyncStorage for session persistence
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
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
export const handleSupabaseError = (error: Error | { message: string }) => {
  console.error('Supabase error:', error);
  return {
    success: false,
    error: error.message || 'An unexpected error occurred',
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

// Auth functions
export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
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
      email,
      password,
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
