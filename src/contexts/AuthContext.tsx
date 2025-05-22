import React, { createContext, useState, useContext, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  createdAt: string;
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

  const login = async (email: string, _password?: string) => {
    try {
      setIsLoading(true);
      // TODO: 実際の認証ロジックを実装
      
      // モック認証
      const mockUser: User = {
        id: '1',
        email,
        createdAt: new Date().toISOString(),
      };
      
      setUser(mockUser);
      return { success: true };
    } catch (error) {
      return { success: false, message: 'ログインに失敗しました' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, _password?: string) => {
    try {
      setIsLoading(true);
      // TODO: 実際の登録ロジックを実装
      
      // モック登録
      const mockUser: User = {
        id: '1',
        email,
        createdAt: new Date().toISOString(),
      };
      
      setUser(mockUser);
      return { success: true };
    } catch (error) {
      return { success: false, message: '登録に失敗しました' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      // TODO: 実際のログアウトロジックを実装
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
