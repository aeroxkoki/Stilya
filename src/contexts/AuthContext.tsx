import React, { createContext, useState, useContext, ReactNode } from 'react';
import { DEMO_MODE, demoService, mockUser } from '../services/demoService';

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
  const [isLoading, setIsLoading] = useState(false);

  const login = async (email: string, password?: string) => {
    try {
      setIsLoading(true);
      
      if (DEMO_MODE) {
        // デモモードの認証
        const result = await demoService.signIn(email, password || '');
        if (result.data?.user) {
          setUser(result.data.user);
          return { success: true };
        }
        return { success: false, message: 'ログインに失敗しました' };
      } else {
        // TODO: Supabaseの実際の認証ロジックを実装
        
        // 一時的なモック認証
        const tempUser: User = {
          id: '1',
          email,
          createdAt: new Date().toISOString(),
        };
        
        setUser(tempUser);
        return { success: true };
      }
    } catch (error) {
      return { success: false, message: 'ログインに失敗しました' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password?: string) => {
    try {
      setIsLoading(true);
      
      if (DEMO_MODE) {
        // デモモードの登録
        const result = await demoService.signUp(email, password || '');
        if (result.data?.user) {
          setUser(result.data.user);
          return { success: true };
        }
        return { success: false, message: '登録に失敗しました' };
      } else {
        // TODO: Supabaseの実際の登録ロジックを実装
        
        // 一時的なモック登録
        const tempUser: User = {
          id: '1',
          email,
          createdAt: new Date().toISOString(),
        };
        
        setUser(tempUser);
        return { success: true };
      }
    } catch (error) {
      return { success: false, message: '登録に失敗しました' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      
      if (DEMO_MODE) {
        // デモモードのログアウト
        await demoService.signOut();
      } else {
        // TODO: Supabaseの実際のログアウトロジックを実装
      }
      
      setUser(null);
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
