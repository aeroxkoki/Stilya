import { useState, useCallback } from 'react';
import { Product } from '@/types';
import { ProductService, fetchProducts as fetchProductsService } from '@/services/productService';

interface ProductStore {
  products: Product[];
  loading: boolean;
  error: string | null;
  loadProducts: () => Promise<void>;
  searchByCategory: (category: string) => Promise<void>;
  searchByTags: (tags: string[]) => Promise<void>;
  fetchProductById: (id: string) => Promise<Product | null>;
  resetError: () => void;
}

// グローバルストアの状態を管理するための変数
let globalProducts: Product[] = [];
let globalLoading = false;
let globalError: string | null = null;
let subscribers: (() => void)[] = [];

// ストアの状態を更新して全てのサブスクライバーに通知
const updateStore = (updates: Partial<{ products: Product[]; loading: boolean; error: string | null }>) => {
  if (updates.products !== undefined) globalProducts = updates.products;
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
      
      if (result.success && result.data) {
        updateStore({ products: result.data, loading: false });
      } else {
        updateStore({ error: result.error || '商品の読み込みに失敗しました', loading: false });
      }
    } catch (error) {
      updateStore({ error: '商品の読み込み中にエラーが発生しました', loading: false });
    }
  },

  searchByCategory: async (category: string) => {
    updateStore({ loading: true, error: null });
    
    try {
      const result = await ProductService.searchProductsByCategory(category, 20);
      
      if (result.success && result.data) {
        updateStore({ products: result.data, loading: false });
      } else {
        updateStore({ error: result.error || 'カテゴリ検索に失敗しました', loading: false });
      }
    } catch (error) {
      updateStore({ error: 'カテゴリ検索中にエラーが発生しました', loading: false });
    }
  },

  searchByTags: async (tags: string[]) => {
    updateStore({ loading: true, error: null });
    
    try {
      const result = await ProductService.searchProductsByTags(tags, 20);
      
      if (result.success && result.data) {
        updateStore({ products: result.data, loading: false });
      } else {
        updateStore({ error: result.error || 'タグ検索に失敗しました', loading: false });
      }
    } catch (error) {
      updateStore({ error: 'タグ検索中にエラーが発生しました', loading: false });
    }
  },

  fetchProductById: async (id: string): Promise<Product | null> => {
    try {
      const result = await ProductService.fetchProductById(id);
      
      if (result.success && result.data) {
        return result.data;
      } else {
        console.error('商品の取得に失敗しました:', result.error);
        return null;
      }
    } catch (error) {
      console.error('商品取得中にエラーが発生しました:', error);
      return null;
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
    loading: globalLoading,
    error: globalError,
    loadProducts: storeActions.loadProducts,
    searchByCategory: storeActions.searchByCategory,
    searchByTags: storeActions.searchByTags,
    fetchProductById: storeActions.fetchProductById,
    resetError: storeActions.resetError,
  };
};

// getState関数を追加（ProductDetailScreenで使用）
useProductStore.getState = () => ({
  products: globalProducts,
  loading: globalLoading,
  error: globalError,
  ...storeActions
});
