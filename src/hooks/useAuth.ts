import { useContext } from 'react';
import { AuthContext } from '@/contexts/AuthContext';

/**
 * 認証情報にアクセスするためのカスタムフック
 * @returns AuthContextの値（ユーザー情報、認証メソッドなど）
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
