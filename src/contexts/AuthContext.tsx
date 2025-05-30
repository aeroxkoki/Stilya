import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { AuthService } from '../services/authService';
import { supabase } from '../services/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  createdAt?: string;
  nickname?: string;
  gender?: string;
  ageGroup?: string;
  stylePreferences?: string[];
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  register: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: false,
  login: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  isAuthenticated: false,
});

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Supabaseのユーザーデータをアプリ用のUser型に変換
  const convertSupabaseUser = (supabaseUser: SupabaseUser): User => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      createdAt: supabaseUser.created_at,
    };
  };

  // セッションチェックとユーザー情報の取得
  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true);
        const sessionResult = await AuthService.getSession();
        
        if (sessionResult.success && sessionResult.data?.user) {
          const convertedUser = convertSupabaseUser(sessionResult.data.user);
          
          // ユーザープロファイルを取得（存在する場合）
          const { data: profile } = await supabase
            .from('users')
            .select('*')
            .eq('id', convertedUser.id)
            .single();
          
          if (profile) {
            setUser({
              ...convertedUser,
              nickname: profile.nickname,
              gender: profile.gender,
              ageGroup: profile.age_group,
              stylePreferences: profile.style_preferences,
            });
          } else {
            setUser(convertedUser);
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();

    // 認証状態の変更を監視
    const { data: { subscription } } = AuthService.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const convertedUser = convertSupabaseUser(session.user);
        
        // ユーザープロファイルを取得
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', convertedUser.id)
          .single();
        
        if (profile) {
          setUser({
            ...convertedUser,
            nickname: profile.nickname,
            gender: profile.gender,
            ageGroup: profile.age_group,
            stylePreferences: profile.style_preferences,
          });
        } else {
          setUser(convertedUser);
        }
      } else {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const result = await AuthService.signIn(email, password);
      
      if (result.success && result.data?.user) {
        const convertedUser = convertSupabaseUser(result.data.user);
        
        // ユーザープロファイルを取得
        const { data: profile } = await supabase
          .from('users')
          .select('*')
          .eq('id', convertedUser.id)
          .single();
        
        if (profile) {
          setUser({
            ...convertedUser,
            nickname: profile.nickname,
            gender: profile.gender,
            ageGroup: profile.age_group,
            stylePreferences: profile.style_preferences,
          });
        } else {
          // プロファイルが存在しない場合は作成
          await AuthService.createUserProfile(convertedUser.id, convertedUser.email);
          setUser(convertedUser);
        }
        
        return { success: true };
      }
      
      return { 
        success: false, 
        message: result.error || 'ログインに失敗しました' 
      };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        message: 'ログインに失敗しました' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      
      const result = await AuthService.signUp(email, password);
      
      if (result.success && result.data?.user) {
        const convertedUser = convertSupabaseUser(result.data.user);
        
        // ユーザープロファイルを作成
        await AuthService.createUserProfile(convertedUser.id, convertedUser.email);
        setUser(convertedUser);
        
        return { success: true };
      }
      
      return { 
        success: false, 
        message: result.error || '登録に失敗しました' 
      };
    } catch (error) {
      console.error('Register error:', error);
      return { 
        success: false, 
        message: '登録に失敗しました' 
      };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      const result = await AuthService.signOut();
      
      if (result.success) {
        setUser(null);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const contextValue: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
