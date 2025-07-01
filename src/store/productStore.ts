import { useState, useCallback } from 'react';
import { Product } from '@/types';
import { fetchProducts as fetchProductsService, fetchProductById as fetchProductByIdService, fetchProductsByTags } from '@/services/productService';
import { toggleFavorite, isFavorite as checkIsFavorite, getFavorites as fetchFavorites } from '@/services/favoriteService';
import { getSwipeHistory as fetchSwipeHistory } from '@/services/swipeService';

interface ProductStore {
  products: Product[];
  favorites: Product[];
  swipeHistory: Product[];
  loading: boolean;
  error: string | null;
  loadProducts: () => Promise<void>;
  searchByCategory: (category: string) => Promise<void>;
  searchByTags: (tags: string[]) => Promise<void>;
  fetchProductById: (id: string) => Promise<Product | null>;
  resetError: () => void;
  // お気に入り関連
  getFavorites: (userId: string) => Promise<void>;
  addToFavorites: (userId: string, productId: string) => Promise<void>;
  removeFromFavorites: (userId: string, productId: string) => Promise<void>;
  isFavorite: (userId: string, productId: string) => boolean;
  // スワイプ履歴関連
  getSwipeHistory: (userId: string, result?: 'yes' | 'no') => Promise<void>;
}

// グローバルストアの状態を管理するための変数
let globalProducts: Product[] = [];
let globalFavorites: Product[] = [];
let globalSwipeHistory: Product[] = [];
let globalLoading = false;
let globalError: string | null = null;
let subscribers: (() => void)[] = [];

// ストアの状態を更新して全てのサブスクライバーに通知
const updateStore = (updates: Partial<{ 
  products: Product[]; 
  favorites: Product[];
  swipeHistory: Product[];
  loading: boolean; 
  error: string | null 
}>) => {
  if (updates.products !== undefined) globalProducts = updates.products;
  if (updates.favorites !== undefined) globalFavorites = updates.favorites;
  if (updates.swipeHistory !== undefined) globalSwipeHistory = updates.swipeHistory;
  if (updates.loading !== undefined) globalLoading = updates.loading;
  if (updates.error !== undefined) globalError = updates.error;
  
  // 全てのサブスクライバーに通知
  subscribers.forEach(callback => callback());
};

// ストアのメソッド
const storeActions = {
  loadProducts: async () => {
    updateStore({ loading: true, error: null });
    
    try {
      const result = await fetchProductsService(50, 0); // 初期ロードで50件取得
      
      if (result.success && 'data' in result && result.data) {
        updateStore({ products: result.data, loading: false });
      } else {
        updateStore({ error: '商品の読み込みに失敗しました', loading: false });
      }
    } catch (error) {
      updateStore({ error: '商品の読み込み中にエラーが発生しました', loading: false });
    }
  },

  searchByCategory: async (category: string) => {
    updateStore({ loading: true, error: null });
    
    try {
      // TODO: カテゴリベースの商品検索機能を実装する必要がある
      const result = await fetchProductsService(20, 0);
      
      if (result.success && 'data' in result && result.data) {
        // 一時的にカテゴリでフィルタリング（本来はDB側で行うべき）
        const filteredProducts = result.data.filter(p => p.category === category);
        updateStore({ products: filteredProducts, loading: false });
      } else {
        updateStore({ error: 'カテゴリ検索に失敗しました', loading: false });
      }
    } catch (error) {
      updateStore({ error: 'カテゴリ検索中にエラーが発生しました', loading: false });
    }
  },

  searchByTags: async (tags: string[]) => {
    updateStore({ loading: true, error: null });
    
    try {
      // fetchProductsByTags を使用（フィルターオプションを渡す）
      const result = await fetchProductsByTags(tags, 20, { includeUsed: false });
      
      if (result.success && 'data' in result && result.data) {
        updateStore({ products: result.data, loading: false });
      } else {
        updateStore({ error: 'タグ検索に失敗しました', loading: false });
      }
    } catch (error) {
      updateStore({ error: 'タグ検索中にエラーが発生しました', loading: false });
    }
  },

  fetchProductById: async (id: string): Promise<Product | null> => {
    // IDが存在しない場合の早期リターン
    if (!id) {
      console.error('[productStore] fetchProductById: ID is undefined or empty');
      return null;
    }
    
    try {
      const result = await fetchProductByIdService(id);
      if (result.success && 'data' in result && result.data) {
        return result.data;
      }
      return null;
    } catch (error) {
      console.error('[productStore] 商品取得中にエラーが発生しました:', error);
      return null;
    }
  },

  // お気に入り関連
  // 注意: 現在、お気に入り機能は useFavorites フックを使用することが推奨されています。
  // このストアのお気に入り機能は、将来的な互換性のために残されていますが、
  // 新しい実装では useFavorites フックを使用してください。
  getFavorites: async (userId: string) => {
    updateStore({ loading: true, error: null });
    
    try {
      const favoriteIds = await fetchFavorites(userId);
      
      if (favoriteIds && favoriteIds.length > 0) {
        // お気に入りの商品データを取得（存在しない商品はスキップ）
        const favoriteProducts: Product[] = [];
        
        // バッチで処理（パフォーマンスを考慮）
        const batchSize = 10;
        for (let i = 0; i < favoriteIds.length; i += batchSize) {
          const batch = favoriteIds.slice(i, i + batchSize);
          const batchPromises = batch.map(async (id) => {
            try {
              const product = await storeActions.fetchProductById(id);
              if (product) {
                return product;
              }
              // 商品が見つからない場合はnullを返す（後でフィルタリング）
              return null;
            } catch (error) {
              console.warn(`[productStore] Failed to fetch product ${id}:`, error);
              return null;
            }
          });
          
          const batchResults = await Promise.all(batchPromises);
          // nullでない商品のみを追加
          favoriteProducts.push(...batchResults.filter((p): p is Product => p !== null));
        }
        
        updateStore({ favorites: favoriteProducts, loading: false });
      } else {
        updateStore({ favorites: [], loading: false });
      }
    } catch (error) {
      console.error('お気に入りの取得に失敗しました:', error);
      updateStore({ error: 'お気に入りの取得に失敗しました', loading: false });
    }
  },

  addToFavorites: async (userId: string, productId: string) => {
    try {
      const isAdded = await toggleFavorite(userId, productId);
      
      if (isAdded) {
        // 商品データを取得してお気に入りに追加
        const product = await storeActions.fetchProductById(productId);
        if (product) {
          updateStore({ favorites: [...globalFavorites, product] });
        }
      }
    } catch (error) {
      console.error('お気に入りへの追加に失敗しました:', error);
      updateStore({ error: 'お気に入りへの追加に失敗しました' });
    }
  },

  removeFromFavorites: async (userId: string, productId: string) => {
    try {
      await toggleFavorite(userId, productId);
      
      // お気に入りから削除
      updateStore({ 
        favorites: globalFavorites.filter(p => p.id !== productId) 
      });
    } catch (error) {
      console.error('お気に入りからの削除に失敗しました:', error);
      updateStore({ error: 'お気に入りからの削除に失敗しました' });
    }
  },

  isFavorite: (userId: string, productId: string): boolean => {
    return globalFavorites.some(p => p.id === productId);
  },

  // スワイプ履歴関連
  getSwipeHistory: async (userId: string, result?: 'yes' | 'no') => {
    updateStore({ loading: true, error: null });
    
    try {
      const swipes = await fetchSwipeHistory(userId, result);
      
      if (swipes && swipes.length > 0) {
        // スワイプした商品データを取得（存在しない商品はスキップ）
        const swipeProducts: Product[] = [];
        
        // バッチで処理（パフォーマンスを考慮）
        const batchSize = 10;
        for (let i = 0; i < swipes.length; i += batchSize) {
          const batch = swipes.slice(i, i + batchSize);
          const batchPromises = batch.map(async (swipe) => {
            try {
              const product = await storeActions.fetchProductById(swipe.productId);
              if (product) {
                return product;
              }
              return null;
            } catch (error) {
              console.warn(`[productStore] Failed to fetch product ${swipe.productId}:`, error);
              return null;
            }
          });
          
          const batchResults = await Promise.all(batchPromises);
          // nullでない商品のみを追加
          swipeProducts.push(...batchResults.filter((p): p is Product => p !== null));
        }
        
        updateStore({ swipeHistory: swipeProducts, loading: false });
      } else {
        updateStore({ swipeHistory: [], loading: false });
      }
    } catch (error) {
      console.error('スワイプ履歴の取得に失敗しました:', error);
      updateStore({ error: 'スワイプ履歴の取得に失敗しました', loading: false });
    }
  },

  resetError: () => {
    updateStore({ error: null });
  }
};

// カスタムフック
export const useProductStore = (): ProductStore => {
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
    products: globalProducts,
    favorites: globalFavorites,
    swipeHistory: globalSwipeHistory,
    loading: globalLoading,
    error: globalError,
    loadProducts: storeActions.loadProducts,
    searchByCategory: storeActions.searchByCategory,
    searchByTags: storeActions.searchByTags,
    fetchProductById: storeActions.fetchProductById,
    resetError: storeActions.resetError,
    // お気に入り関連
    getFavorites: storeActions.getFavorites,
    addToFavorites: storeActions.addToFavorites,
    removeFromFavorites: storeActions.removeFromFavorites,
    isFavorite: storeActions.isFavorite,
    // スワイプ履歴関連
    getSwipeHistory: storeActions.getSwipeHistory,
  };
};

// getState関数を追加（ProductDetailScreenで使用）
useProductStore.getState = () => ({
  products: globalProducts,
  favorites: globalFavorites,
  swipeHistory: globalSwipeHistory,
  loading: globalLoading,
  error: globalError,
  ...storeActions
});
