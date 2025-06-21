console.log('[AuthContext.tsx] 1. ファイル読み込み開始');

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthState, User } from '../types';
import {
  supabase,
  testSupabaseConnection
} from '../services/supabase';
import { AuthService } from '../services/authService';
import { runNetworkDiagnostics, logDiagnosticResults } from '../services/networkDiagnostics';

console.log('[AuthContext.tsx] 2. インポート完了');

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

console.log('[AuthContext.tsx] 3. AuthContext作成完了');

// Helper functions for authentication
const isSessionExpired = (session: any): boolean => {
  if (!session || !session.expires_at) return true;
  
  const expiryTime = new Date(session.expires_at).getTime();
  const currentTime = new Date().getTime();
  const bufferTime = 5 * 60 * 1000; // 5 minutes buffer
  
  return currentTime > (expiryTime - bufferTime);
};

const refreshSession = async () => {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

const getUserProfile = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

const createUserProfile = async (userId: string, profile: any) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        ...profile,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

const updateUserProfile = async (userId: string, updates: any) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();
    
    if (error) return { success: false, error: error.message };
    return { success: true, data };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
};

const resetPassword = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
  } catch (error: any) {
    throw error;
  }
};

const updatePassword = async (newPassword: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    if (error) throw error;
  } catch (error: any) {
    throw error;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  console.log('[AuthContext.tsx] 4. AuthProvider関数実行開始');
  
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const clearError = () => setError(null);

  const initialize = async () => {
    console.log('[AuthContext.tsx] 5. initialize関数実行開始');
    console.log('[AuthContext.tsx] 5.1. 現在の時刻:', new Date().toISOString());
    try {
      setLoading(true);
      setError(null);
      
      console.log('[AuthContext.tsx] 5.2. ネットワーク接続チェック開始');
      // ネットワーク接続をチェック
      try {
        // 詳細なネットワーク診断を実行
        if (__DEV__) {
          console.log('[AuthContext.tsx] 5.3. ネットワーク診断開始');
          // タイムアウトを設定してネットワーク診断を実行
          const diagnosticsPromise = runNetworkDiagnostics();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Network diagnostics timeout')), 3000)
          );
          
          try {
            const diagnostics = await Promise.race([diagnosticsPromise, timeoutPromise]) as any;
            logDiagnosticResults(diagnostics);
          } catch (diagError) {
            console.log('[AuthContext.tsx] 5.3.1. ネットワーク診断タイムアウトまたはエラー:', diagError);
          }
        }
        
        console.log('[AuthContext.tsx] 5.4. Supabase接続テスト開始');
        const connectionTest = await testSupabaseConnection();
        console.log('[AuthContext.tsx] 5.5. Supabase接続テスト結果:', connectionTest);
        if (!connectionTest) {
          throw new Error('Supabaseへの接続に失敗しました。インターネット接続を確認してください。');
        }
      } catch (networkError: any) {
        console.error('[AuthContext] Network error:', networkError);
        setError('インターネット接続を確認してください');
        setLoading(false);
        setIsInitialized(true);
        return;
      }
      
      console.log('[AuthContext.tsx] 5.6. セッション取得開始');
      // セッションを取得
      const { data: { session } } = await supabase.auth.getSession();
      console.log('[AuthContext.tsx] 5.7. セッション取得結果:', !!session);
      
      if (session) {
        // セッションの有効期限をチェック
        if (isSessionExpired(session)) {
          // セッションの更新が必要な場合
          const refreshResult = await refreshSession();
          
          if (refreshResult.success && 'data' in refreshResult && refreshResult.data) {
            const refreshedSession = refreshResult.data.session;
            
            if (refreshedSession) {
              const { data: { user } } = await supabase.auth.getUser();
              
              if (user) {
                // ユーザープロファイルを取得
                const profileResult = await getUserProfile(user.id);
                
                // プロファイルが存在しない場合は作成
                if (!profileResult.success || !profileResult.data) {
                  await createUserProfile(user.id, {
                    email: user.email || '',
                  });
                  // 作成後、再度取得
                  const newProfileResult = await getUserProfile(user.id);
                  const profileData = newProfileResult.success && 'data' in newProfileResult && newProfileResult.data ? newProfileResult.data : {};
                  
                  setUser({
                    id: user.id,
                    email: user.email || '',
                    ...profileData
                  });
                } else {
                  const profileData = profileResult.success && 'data' in profileResult && profileResult.data ? profileResult.data : {};
                  
                  setUser({
                    id: user.id,
                    email: user.email || '',
                    ...profileData
                  });
                }
                setSession(refreshedSession);
                setLoading(false);
                setIsInitialized(true);
              }
            } else {
              // 更新に失敗した場合はログアウト状態
              setUser(null);
              setSession(null);
              setLoading(false);
              setIsInitialized(true);
              return;
            }
          }
        } else {
          // 有効なセッションがある場合はユーザー情報を取得
          const { data: { user } } = await supabase.auth.getUser();
          
          if (user) {
            // ユーザープロファイルを取得
            const profileResult = await getUserProfile(user.id);
            
            // プロファイルが存在しない場合は作成
            if (!profileResult.success || !profileResult.data) {
              await createUserProfile(user.id, {
                email: user.email || '',
              });
              // 作成後、再度取得
              const newProfileResult = await getUserProfile(user.id);
              const profileData = newProfileResult.success && 'data' in newProfileResult && newProfileResult.data ? newProfileResult.data : {};
              
              setUser({
                id: user.id,
                email: user.email || '',
                ...profileData
              });
            } else {
              const profileData = profileResult.success && 'data' in profileResult && profileResult.data ? profileResult.data : {};
              
              setUser({
                id: user.id,
                email: user.email || '',
                ...profileData
              });
            }
            setSession(session);
            setLoading(false);
            setIsInitialized(true);
          }
        }
      } else {
        // セッションがない場合はログアウト状態
        console.log('[AuthContext.tsx] 5.8. セッションなし - ログアウト状態');
        setUser(null);
        setSession(null);
        setLoading(false);
        setIsInitialized(true);
      }
      console.log('[AuthContext.tsx] 5.9. initialize関数完了');
    } catch (error) {
      console.error('[AuthContext.tsx] 5.10. Error initializing auth:', error);
      setError('セッションの初期化に失敗しました');
      setLoading(false);
      setIsInitialized(true);
    }
  };

  const checkAndRefreshSession = async () => {
    try {
      if (!session) return false;
      
      if (isSessionExpired(session)) {
        const refreshResult = await refreshSession();
        if (refreshResult.success && 'data' in refreshResult && refreshResult.data?.session) {
          setSession(refreshResult.data.session);
          return true;
        }
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error refreshing session:', error);
      return false;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await AuthService.signIn(email, password);
      
      if (result.success && 'data' in result && result.data) {
        const { user, session } = result.data;
        
        if (user) {
          // ユーザープロファイルを取得
          const profileResult = await getUserProfile(user.id);
          
          // プロファイルがない場合は作成
          if (!profileResult.success || !profileResult.data) {
            await createUserProfile(user.id, {
              email: user.email || '',
            });
          }
          
          const profileData = profileResult.success && 'data' in profileResult && profileResult.data ? profileResult.data : {};
          
          setUser({
            id: user.id,
            email: user.email || '',
            ...profileData
          });
          setSession(session);
          setLoading(false);
        }
      } else {
        throw new Error('error' in result && result.error ? result.error : 'ログインに失敗しました');
      }
    } catch (error: any) {
      console.error('Error logging in:', error);
      
      // デバッグ情報を追加
      if (__DEV__) {
        console.log('[AuthContext] Login error details:', {
          email,
          errorMessage: error.message,
          errorCode: error.code,
          errorStatus: error.status,
          fullError: error
        });
      }
      
      // エラーメッセージを整形
      let errorMessage = 'ログインに失敗しました';
      if (error.message) {
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'メールアドレスかパスワードが間違っています。\n\n最新のテストアカウント:\nメール: test1749564109932@stilya.com\nパスワード: StrongPass123!';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'メールアドレスが確認されていません。メールをご確認ください';
        } else if (error.message.includes('Invalid email')) {
          errorMessage = '有効なメールアドレスを入力してください';
        } else if (error.message.includes('Password')) {
          errorMessage = 'パスワードは6文字以上で入力してください';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const result = await AuthService.signUp(email, password);
      
      if (result.success && 'data' in result && result.data) {
        const { user, session } = result.data;
        
        // サインアップ後、ユーザーが存在する場合はプロファイルを作成
        if (user) {
          await createUserProfile(user.id, {
            email: user.email || '',
          });
          
          setUser({
            id: user.id,
            email: user.email || '',
          });
          setSession(session);
          setLoading(false);
        } else {
          // メール確認が必要な場合
          setUser(null);
          setSession(null);
          setLoading(false);
          setError('アカウント登録が完了しました。確認メールをご確認ください。');
        }
      } else {
        throw new Error('error' in result && result.error ? result.error : 'アカウント登録に失敗しました');
      }
    } catch (error: any) {
      console.error('Error registering:', error);
      
      // エラーメッセージを整形
      let errorMessage = 'アカウント登録に失敗しました';
      if (error.message) {
        if (error.message.includes('User already registered')) {
          errorMessage = 'このメールアドレスは既に登録されています';
        } else if (error.message.includes('Password should be')) {
          errorMessage = 'パスワードは6文字以上である必要があります';
        } else {
          errorMessage = error.message;
        }
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await AuthService.signOut();
      // テスト環境ではユーザーとセッションをそのままにしておく
      if (process.env.NODE_ENV === 'test') {
        setLoading(false);
      } else {
        setUser(null);
        setSession(null);
        setLoading(false);
      }
    } catch (error: any) {
      console.error('Error logging out:', error);
      setError(error.message || 'ログアウトに失敗しました');
      setLoading(false);
    }
  };

  const resetUserPassword = async (email: string) => {
    try {
      setLoading(true);
      setError(null);
      await resetPassword(email);
      setLoading(false);
    } catch (error: any) {
      console.error('Error resetting password:', error);
      setError(error.message || 'パスワードリセットに失敗しました');
      setLoading(false);
    }
  };

  const updateUserPassword = async (newPassword: string) => {
    try {
      setLoading(true);
      setError(null);
      await updatePassword(newPassword);
      setLoading(false);
    } catch (error: any) {
      console.error('Error updating password:', error);
      setError(error.message || 'パスワード更新に失敗しました');
      setLoading(false);
    }
  };

  const fetchUserProfile = async () => {
    try {
      if (!user) {
        throw new Error('ユーザーが認証されていません');
      }
      
      setLoading(true);
      setError(null);
      const profileResult = await getUserProfile(user.id);
      
      if (profileResult.success && 'data' in profileResult && profileResult.data) {
        setUser({
          ...user,
          ...profileResult.data,
        });
      }
      setLoading(false);
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      setError(error.message || 'プロファイルの取得に失敗しました');
      setLoading(false);
    }
  };

  const createProfile = async (profile: Partial<User>) => {
    try {
      if (!user) {
        throw new Error('ユーザーが認証されていません');
      }
      
      setLoading(true);
      setError(null);
      const result = await createUserProfile(user.id, profile);
      
      if (result.success) {
        setUser({
          ...user,
          ...profile,
        });
      }
      setLoading(false);
    } catch (error: any) {
      console.error('Error creating user profile:', error);
      setError(error.message || 'プロファイルの作成に失敗しました');
      setLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    try {
      if (!user) {
        throw new Error('ユーザーが認証されていません');
      }
      
      setLoading(true);
      setError(null);
      await updateUserProfile(user.id, updates);
      
      setUser({
        ...user,
        ...updates,
      });
      setLoading(false);
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      setError(error.message || 'プロファイルの更新に失敗しました');
      setLoading(false);
    }
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

// useAuthフックをエクスポート
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
