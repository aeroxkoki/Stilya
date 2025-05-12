import { useEffect } from 'react';
import { User } from '@/types';
import { useAuthStore } from '@/store/authStore';

interface UseAuthReturn {
  user: User | null;
  session: any | null;
  isLoading: boolean;
  error: string | null;
  
  // 認証関連
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  
  // セッション関連
  isSessionValid: () => Promise<boolean>;
  
  // プロファイル関連
  fetchProfile: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  
  // その他
  clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const {
    user,
    session,
    loading: isLoading,
    error,
    
    login,
    register,
    logout,
    resetUserPassword,
    updateUserPassword,
    checkAndRefreshSession,
    fetchUserProfile,
    updateProfile,
    clearError,
    initialize,
  } = useAuthStore();

  // コンポーネントマウント時に認証状態を初期化
  useEffect(() => {
    initialize();
    
    // セッション有効期限を定期的にチェック (15分ごと)
    const intervalId = setInterval(() => {
      checkAndRefreshSession();
    }, 15 * 60 * 1000);
    
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  // セッションが有効かどうかを確認する関数
  const isSessionValid = async (): Promise<boolean> => {
    return await checkAndRefreshSession();
  };

  return {
    user,
    session,
    isLoading,
    error,
    
    login,
    register,
    logout,
    resetPassword: resetUserPassword,
    updatePassword: updateUserPassword,
    
    isSessionValid,
    
    fetchProfile: fetchUserProfile,
    updateProfile,
    
    clearError,
  };
};
