import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, User } from '../types';

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

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const clearError = () => setError(null);

  // 簡略化された初期化
  const initialize = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // useEffectの中で実行されるため、ランタイムの準備ができている
      console.log('[AuthContext.tsx] 初期化開始');
      
      // 仮の初期化処理（実際のSupabase接続は一時的にスキップ）
      setTimeout(() => {
        setLoading(false);
        setIsInitialized(true);
        console.log('[AuthContext.tsx] 初期化完了');
      }, 1000);
      
    } catch (error) {
      console.error('[AuthContext.tsx] 初期化エラー:', error);
      setError('初期化に失敗しました');
      setLoading(false);
      setIsInitialized(true);
    }
  };

  // 簡略化されたメソッド（プレースホルダー）
  const login = async (email: string, password: string) => {
    console.log('[AuthContext.tsx] ログイン試行:', email);
    setLoading(true);
    setError(null);
    
    // プレースホルダー処理
    setTimeout(() => {
      setUser({ id: '1', email } as User);
      setLoading(false);
    }, 500);
  };

  const register = async (email: string, password: string) => {
    console.log('[AuthContext.tsx] 登録試行:', email);
    setLoading(true);
    setError(null);
    
    setTimeout(() => {
      setUser({ id: '1', email } as User);
      setLoading(false);
    }, 500);
  };

  const logout = async () => {
    console.log('[AuthContext.tsx] ログアウト');
    setUser(null);
    setSession(null);
    setLoading(false);
  };

  const checkAndRefreshSession = async () => {
    return true;
  };

  const resetUserPassword = async (email: string) => {
    console.log('[AuthContext.tsx] パスワードリセット:', email);
  };

  const updateUserPassword = async (newPassword: string) => {
    console.log('[AuthContext.tsx] パスワード更新');
  };

  const fetchUserProfile = async () => {
    console.log('[AuthContext.tsx] プロファイル取得');
  };

  const createProfile = async (profile: Partial<User>) => {
    console.log('[AuthContext.tsx] プロファイル作成:', profile);
  };

  const updateProfile = async (updates: Partial<User>) => {
    console.log('[AuthContext.tsx] プロファイル更新:', updates);
  };

  useEffect(() => {
    initialize();
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
