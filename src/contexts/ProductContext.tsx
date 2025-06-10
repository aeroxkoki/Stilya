import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  fetchProducts,
  fetchProductById,
  fetchProductsByTags
} from '@/services/productService';
import { saveSwipeResult } from '@/services/swipeService';
import { Product } from '@/types';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  
  // 商品データ取得
  loadProducts: () => Promise<void>;
  resetProducts: () => void;
  
  // スワイプ関連
  addSwipe: (userId: string, productId: string, result: 'yes' | 'no') => Promise<void>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

export const useProducts = () => {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
};

export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 商品データを取得
      const result = await fetchProducts(30, 0);
      
      if (result.success && 'data' in result && result.data) {
        setProducts(result.data);
      } else {
        setError(result.error || '商品の読み込みに失敗しました');
        setProducts([]);
      }
    } catch (error: any) {
      console.error('Error loading products:', error);
      setError(error.message || '商品の読み込みに失敗しました');
    } finally {
      setLoading(false);
    }
  };

  const resetProducts = () => {
    setProducts([]);
    setError(null);
  };

  const addSwipe = async (userId: string, productId: string, result: 'yes' | 'no') => {
    try {
      await saveSwipeResult(userId, productId, result);
    } catch (error) {
      console.error('Error saving swipe:', error);
    }
  };

  const value: ProductContextType = {
    products,
    loading,
    error,
    loadProducts,
    resetProducts,
    addSwipe,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};
