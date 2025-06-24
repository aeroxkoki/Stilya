import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import { getFavorites, addFavorite, removeFavorite } from '@/services/favoriteService';

interface UseFavoritesReturn {
  favorites: string[];
  loading: boolean;
  addToFavorites: (productId: string) => Promise<void>;
  removeFromFavorites: (productId: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
  refreshFavorites: () => Promise<void>;
}

/**
 * お気に入り管理用のカスタムフック
 */
export const useFavorites = (): UseFavoritesReturn => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFavorites = useCallback(async () => {
    if (!user) {
      setFavorites([]);
      return;
    }

    try {
      setLoading(true);
      const userFavorites = await getFavorites(user.id);
      setFavorites(userFavorites);
    } catch (error) {
      console.error('[useFavorites] Error loading favorites:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const addToFavorites = useCallback(async (productId: string) => {
    if (!user) return;

    try {
      // 楽観的更新
      setFavorites(prev => {
        if (!prev.includes(productId)) {
          return [...prev, productId];
        }
        return prev;
      });

      // APIコール
      await addFavorite(user.id, productId);
    } catch (error) {
      console.error('[useFavorites] Error adding to favorites:', error);
      // エラー時はロールバック
      await loadFavorites();
    }
  }, [user, loadFavorites]);

  const removeFromFavorites = useCallback(async (productId: string) => {
    if (!user) return;

    try {
      // 楽観的更新
      setFavorites(prev => prev.filter(id => id !== productId));

      // APIコール
      await removeFavorite(user.id, productId);
    } catch (error) {
      console.error('[useFavorites] Error removing from favorites:', error);
      // エラー時はロールバック
      await loadFavorites();
    }
  }, [user, loadFavorites]);

  const isFavorite = useCallback((productId: string): boolean => {
    return favorites.includes(productId);
  }, [favorites]);

  const refreshFavorites = useCallback(async () => {
    await loadFavorites();
  }, [loadFavorites]);

  // 初回ロード
  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user, loadFavorites]);

  return {
    favorites,
    loading,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    refreshFavorites
  };
};
