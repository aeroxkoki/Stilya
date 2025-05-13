import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../utils/env';
import { User } from '../types';

// JSONデータの安全な保存・取得ヘルパー
const saveToSecureStore = async (key: string, value: string): Promise<void> => {
  await SecureStore.setItemAsync(key, value);
};

const getFromSecureStore = async (key: string): Promise<string | null> => {
  return await SecureStore.getItemAsync(key);
};

// セキュアストレージアダプター
const secureStorageAdapter = {
  getItem: getFromSecureStore,
  setItem: saveToSecureStore,
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

// 通常のストレージアダプター（認証以外のデータ用）
const normalStorageAdapter = {
  getItem: (key: string) => {
    return AsyncStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    AsyncStorage.setItem(key, value);
    return Promise.resolve();
  },
  removeItem: (key: string) => {
    AsyncStorage.removeItem(key);
    return Promise.resolve();
  },
};

// Supabaseクライアントの作成
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: secureStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
  global: {
    // 非認証データ用のストレージ
    localStorage: normalStorageAdapter,
  },
});

// ユーザーセッションの取得
export const getSession = async () => {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
};

// セッションの更新
export const refreshSession = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error refreshing session:', error);
    throw error;
  }
};

// セッション有効期限をチェック
export const isSessionExpired = (session: any): boolean => {
  if (!session || !session.expires_at) return true;
  
  // expires_at はUNIXタイムスタンプ（秒）
  const expiresAt = session.expires_at * 1000; // ミリ秒に変換
  const now = Date.now();
  
  // 有効期限が1時間以内の場合も期限切れと見なして更新する
  const oneHour = 60 * 60 * 1000;
  return now >= (expiresAt - oneHour);
};

// サインアップ
export const signUp = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error signing up:', error);
    throw error;
  }
};

// サインイン
export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error signing in:', error);
    throw error;
  }
};

// パスワードリセット用のメール送信
export const resetPassword = async (email: string) => {
  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'stilya://reset-password', // ディープリンクURL
    });
    if (error) throw error;
    return { data, success: true };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw error;
  }
};

// パスワード更新
export const updatePassword = async (newPassword: string) => {
  try {
    const { data, error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
    return { data, success: true };
  } catch (error) {
    console.error('Error updating password:', error);
    throw error;
  }
};

// サインアウト
export const signOut = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

// ユーザープロフィールの取得
export const getUserProfile = async (userId: string): Promise<User | null> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) throw error;
    return data as User;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
};

// ユーザープロフィールの更新
export const updateUserProfile = async (userId: string, updates: Partial<User>) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
};

// ユーザープロフィールの作成
export const createUserProfile = async (profile: Partial<User>) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert([profile])
      .select();
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating user profile:', error);
    throw error;
  }
};
