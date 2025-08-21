import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, User } from '../types';
import { supabase } from '@/services/supabase';

// グローバルスコープでのconsole.logを削除（runtime not readyエラーの原因）

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  initialize: () => Promise<void>;
  resetUserPassword: (email: string) => Promise<void>;
  updateUserPassword: (newPassword: string) => Promise<void>;
  checkAndRefreshSession: () => Promise<boolean>;
  setUser: (user: User | null) => void;
  createProfile: (profile: Partial<User>) => Promise<void>;
  fetchUserProfile: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  clearError: () => void;
  isInitialized: boolean;
}

// UUID生成関数（暫定的なもの）
const generateUUID = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const clearError = () => setError(null);

  // 簡略化された初期化（実際のSupabase接続を含む）
  const initialize = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[AuthContext.tsx] 初期化開始');
      
      // Supabaseセッション確認
      try {
        const { data: { session: currentSession } } = await supabase.auth.getSession();
        
        if (currentSession) {
          setSession(currentSession);
          setUser({
            id: currentSession.user.id,
            email: currentSession.user.email || '',
          } as User);
          console.log('[AuthContext.tsx] 既存セッション復元:', currentSession.user.id);
        } else {
          console.log('[AuthContext.tsx] セッションなし - ゲストモード');
        }
      } catch (supabaseError) {
        console.warn('[AuthContext.tsx] Supabase接続エラー（開発中は無視）:', supabaseError);
        // 開発中はゲストユーザーとして続行
      }
      
      setLoading(false);
      setIsInitialized(true);
      console.log('[AuthContext.tsx] 初期化完了');
      
    } catch (error) {
      console.error('[AuthContext.tsx] 初期化エラー:', error);
      setError('初期化に失敗しました');
      setLoading(false);
      setIsInitialized(true);
    }
  };

  // ログイン処理（実際のSupabase認証を含む）
  const login = async (email: string, password: string) => {
    console.log('[AuthContext.tsx] ログイン試行:', email);
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) throw signInError;
      
      if (data.session && data.user) {
        setSession(data.session);
        setUser({
          id: data.user.id,
          email: data.user.email || email,
        } as User);
        console.log('[AuthContext.tsx] ログイン成功:', data.user.id);
      }
    } catch (err: any) {
      console.error('[AuthContext.tsx] ログインエラー:', err);
      // 開発中は仮のUUIDでゲストユーザーを作成
      const guestId = generateUUID();
      setUser({ 
        id: guestId, 
        email,
        isGuest: true 
      } as User);
      console.log('[AuthContext.tsx] ゲストユーザーとしてログイン:', guestId);
    } finally {
      setLoading(false);
    }
  };

  // 登録処理（実際のSupabase認証を含む）
  const register = async (email: string, password: string) => {
    console.log('[AuthContext.tsx] 登録試行:', email);
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });
      
      if (signUpError) throw signUpError;
      
      if (data.user) {
        // 登録成功後、自動的にログイン
        await login(email, password);
      }
    } catch (err: any) {
      console.error('[AuthContext.tsx] 登録エラー:', err);
      // 開発中は仮のUUIDでゲストユーザーを作成
      const guestId = generateUUID();
      setUser({ 
        id: guestId, 
        email,
        isGuest: true 
      } as User);
      console.log('[AuthContext.tsx] ゲストユーザーとして登録:', guestId);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    console.log('[AuthContext.tsx] ログアウト');
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('[AuthContext.tsx] ログアウトエラー:', err);
    }
    setUser(null);
    setSession(null);
    setLoading(false);
  };

  const checkAndRefreshSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setSession(session);
        return true;
      }
    } catch (err) {
      console.error('[AuthContext.tsx] セッション確認エラー:', err);
    }
    return false;
  };

  const resetUserPassword = async (email: string) => {
    console.log('[AuthContext.tsx] パスワードリセット:', email);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (err) {
      console.error('[AuthContext.tsx] パスワードリセットエラー:', err);
      setError('パスワードリセットに失敗しました');
    }
  };

  const updateUserPassword = async (newPassword: string) => {
    console.log('[AuthContext.tsx] パスワード更新');
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
    } catch (err) {
      console.error('[AuthContext.tsx] パスワード更新エラー:', err);
      setError('パスワード更新に失敗しました');
    }
  };

  const fetchUserProfile = async () => {
    console.log('[AuthContext.tsx] プロファイル取得');
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setUser({ ...user, ...data });
      }
    } catch (err) {
      console.error('[AuthContext.tsx] プロファイル取得エラー:', err);
    }
  };

  const createProfile = async (profile: Partial<User>) => {
    console.log('[AuthContext.tsx] プロファイル作成:', profile);
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          ...profile,
        });
      
      if (error) throw error;
      
      setUser({ ...user, ...profile });
    } catch (err) {
      console.error('[AuthContext.tsx] プロファイル作成エラー:', err);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    console.log('[AuthContext.tsx] プロファイル更新:', updates);
    if (!user?.id) return;
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (error) throw error;
      
      setUser({ ...user, ...updates });
    } catch (err) {
      console.error('[AuthContext.tsx] プロファイル更新エラー:', err);
    }
  };

  // Auth状態の監視
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('[AuthContext.tsx] Auth状態変更:', event);
        if (session) {
          setSession(session);
          setUser({
            id: session.user.id,
            email: session.user.email || '',
          } as User);
        } else {
          setSession(null);
          setUser(null);
        }
        setLoading(false);
      }
    );

    // 初期化
    initialize();

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const value: AuthContextType = {
    user,
    session,
    loading,
    error,
    setUser,
    clearError,
    initialize,
    checkAndRefreshSession,
    login,
    register,
    logout,
    resetUserPassword,
    updateUserPassword,
    fetchUserProfile,
    createProfile,
    updateProfile,
    isInitialized,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
