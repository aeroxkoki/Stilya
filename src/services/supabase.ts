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
