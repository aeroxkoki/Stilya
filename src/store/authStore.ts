import { useState, useCallback } from 'react';
import { User } from '@/types';

interface AuthStore {
  user: User | null;
  loading: boolean;
  error: string | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetError: () => void;
}

// グローバルストアの状態を管理するための変数
let globalUser: User | null = null;
let globalLoading = false;
let globalError: string | null = null;
let subscribers: (() => void)[] = [];

// ストアの状態を更新して全てのサブスクライバーに通知
const updateStore = (updates: Partial<{ user: User | null; loading: boolean; error: string | null }>) => {
  if (updates.user !== undefined) globalUser = updates.user;
  if (updates.loading !== undefined) globalLoading = updates.loading;
  if (updates.error !== undefined) globalError = updates.error;
  
  // 全てのサブスクライバーに通知
  subscribers.forEach(callback => callback());
};

// ストアのメソッド
const storeActions = {
  setUser: (user: User | null) => {
    updateStore({ user });
  },

  setLoading: (loading: boolean) => {
    updateStore({ loading });
  },

  setError: (error: string | null) => {
    updateStore({ error });
  },

  resetError: () => {
    updateStore({ error: null });
  }
};

// カスタムフック
export const useAuthStore = (): AuthStore => {
  const [, forceUpdate] = useState({});

  // コンポーネントの再レンダリングをトリガーするためのコールバック
  const rerender = useCallback(() => {
    forceUpdate({});
  }, []);

  // コンポーネントのマウント時にサブスクライバーとして登録
  useState(() => {
    subscribers.push(rerender);
    
    // クリーンアップ関数
    return () => {
      subscribers = subscribers.filter(cb => cb !== rerender);
    };
  });

  return {
    user: globalUser,
    loading: globalLoading,
    error: globalError,
    setUser: storeActions.setUser,
    setLoading: storeActions.setLoading,
    setError: storeActions.setError,
    resetError: storeActions.resetError,
  };
};

// getState関数を追加
useAuthStore.getState = () => ({
  user: globalUser,
  loading: globalLoading,
  error: globalError,
  ...storeActions
});
