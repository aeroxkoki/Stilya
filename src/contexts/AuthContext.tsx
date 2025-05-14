import React, { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { supabase, signIn, signUp, signOut, getSession, refreshSession, isSessionExpired, getUserProfile } from '@/services/supabase';
import { User } from '@/types';
// import * as SecureStore from 'expo-secure-store';
import { syncOfflineSwipes } from '@/services/swipeService';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';

// SecureStore のモック
const SecureStore = {
  setItemAsync: async (key: string, value: string): Promise<void> => {
    await AsyncStorage.setItem(`secure_${key}`, value);
  },
  getItemAsync: async (key: string): Promise<string | null> => {
    return await AsyncStorage.getItem(`secure_${key}`);
  },
  deleteItemAsync: async (key: string): Promise<void> => {
    await AsyncStorage.removeItem(`secure_${key}`);
  }
};

// ユーザーセッションストレージキー
const SESSION_KEY = 'stilya_user_session';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  isSessionValid: () => Promise<boolean>;
  profile: User | null;
  fetchProfile: () => Promise<User | null>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  isSessionValid: async () => false,
  profile: null,
  fetchProfile: async () => null,
  updateProfile: async () => false,
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // ユーザー認証状態の監視
  useEffect(() => {
    let mounted = true;

    const checkAuthStatus = async () => {
      try {
        // 保存されたセッション情報があるか確認
        const sessionStr = await SecureStore.getItemAsync(SESSION_KEY);
        if (sessionStr) {
          const session = JSON.parse(sessionStr);
          if (session && session.user) {
            // セッションからユーザー情報を復元
            setUser(session.user);
            
            // プロファイル情報の取得を試みる
            if (mounted) {
              fetchProfile();
            }
          }
        }
      } catch (error) {
        console.error('Error checking auth status:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    // Supabaseの認証状態変更イベントをリッスン
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event);
        
        if (event === 'SIGNED_IN' && session) {
          // ログイン完了
          // Supabaseから返されたユーザー情報を保存
          const currentUser: User = {
            id: session.user.id,
            email: session.user.email || '',
            createdAt: new Date().toISOString(),
          };
          
          setUser(currentUser);
          
          // SecureStoreにセッション情報を保存
          await SecureStore.setItemAsync(
            SESSION_KEY,
            JSON.stringify({ user: currentUser, session })
          );
          
          // オフラインスワイプの同期を試みる
          const netInfo = await NetInfo.fetch();
          if (netInfo.isConnected) {
            syncOfflineSwipes();
          }

          setIsLoading(false);
        } else if (event === 'SIGNED_OUT') {
          // ログアウトまたはユーザー削除時
          setUser(null);
          setProfile(null);
          await SecureStore.deleteItemAsync(SESSION_KEY);
          setIsLoading(false);
        }
      }
    );

    checkAuthStatus();

    return () => {
      mounted = false;
      authListener?.subscription.unsubscribe();
    };
  }, []);

  // ログイン処理
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { user: authUser, session } = await signIn(email, password);
      
      if (!authUser) {
        return { success: false, message: 'メールアドレスまたはパスワードが正しくありません' };
      }
      
      // ログイン成功
      return { success: true };
    } catch (error: any) {
      console.error('Login error:', error.message);
      return { 
        success: false, 
        message: error.message === 'Invalid login credentials' 
          ? 'メールアドレスまたはパスワードが正しくありません'
          : '認証エラーが発生しました。再度お試しください。'
      };
    } finally {
      setIsLoading(false);
    }
  };

  // 新規ユーザー登録
  const register = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { user: authUser, session } = await signUp(email, password);
      
      if (!authUser) {
        return { success: false, message: 'ユーザー登録に失敗しました' };
      }
      
      return { success: true };
    } catch (error: any) {
      console.error('Register error:', error.message);
      return { 
        success: false, 
        message: error.message.includes('email') 
          ? 'このメールアドレスは既に使用されています'
          : 'ユーザー登録に失敗しました。再度お試しください。'
      };
    } finally {
      setIsLoading(false);
    }
  };

  // ログアウト処理
  const logout = async () => {
    try {
      setIsLoading(true);
      await signOut();
      setUser(null);
      setProfile(null);
      await SecureStore.deleteItemAsync(SESSION_KEY);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // セッションの有効性確認
  const isSessionValid = async () => {
    try {
      const session = await getSession();
      
      if (!session) {
        console.log('No session found');
        await logout();
        return false;
      }
      
      if (isSessionExpired(session)) {
        console.log('Session expired, refreshing...');
        const refreshResult = await refreshSession();
        
        if (!refreshResult || !refreshResult.session) {
          console.log('Session refresh failed');
          await logout();
          return false;
        }
        
        // セッション更新成功
        return true;
      }
      
      return true;
    } catch (error) {
      console.error('Session validation error:', error);
      return false;
    }
  };

  // ユーザープロファイルの取得
  const fetchProfile = async () => {
    try {
      if (!user) return null;
      
      const userProfile = await getUserProfile(user.id);
      
      if (userProfile) {
        setProfile(userProfile);
      }
      
      return userProfile;
    } catch (error) {
      console.error('Fetch profile error:', error);
      return null;
    }
  };

  // プロファイル更新
  const updateProfile = async (data: Partial<User>) => {
    try {
      if (!user) return false;
      
      // プロファイルとユーザー情報を更新
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      setProfile(updatedUser);
      
      // SecureStoreのセッション情報も更新
      const sessionStr = await SecureStore.getItemAsync(SESSION_KEY);
      if (sessionStr) {
        const session = JSON.parse(sessionStr);
        session.user = updatedUser;
        await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
      }
      
      return true;
    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    }
  };

  const contextValue = {
    user,
    isLoading,
    login,
    register,
    logout,
    isSessionValid,
    profile,
    fetchProfile,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// useAuth フックを作成
export const useAuth = () => useContext(AuthContext);
