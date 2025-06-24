import React, { createContext, useContext, useState, ReactNode } from 'react';
import { 
  fetchProducts,
  fetchProductById,
  fetchProductsByTags,
  FilterOptions
} from '@/services/productService';
import { saveSwipeResult, getSwipeHistory as getSwipeHistoryService, SwipeData } from '@/services/swipeService';
import { Product } from '@/types';

interface ProductContextType {
  products: Product[];
  loading: boolean;
  error: string | null;
  swipeHistory: Product[];
  favorites: string[]; // お気に入り商品IDのリスト
  
  // 商品データ取得
  loadProducts: (filters?: FilterOptions) => Promise<void>;
  resetProducts: () => void;
  
  // スワイプ関連
  addSwipe: (userId: string, productId: string, result: 'yes' | 'no') => Promise<void>;
  getSwipeHistory: (userId: string, result?: 'yes' | 'no' | 'all') => Promise<void>;
  
  // お気に入り関連
  addToFavorites: (userId: string, productId: string) => Promise<void>;
  removeFromFavorites: (userId: string, productId: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
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
  const [swipeHistory, setSwipeHistory] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);

  const loadProducts = async (filters?: FilterOptions) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('[ProductContext] Loading products...');
      
      // 商品データを取得
      const result = await fetchProducts(30, 0, filters);
      
      console.log('[ProductContext] Fetch result:', {
        success: result.success,
        dataLength: result.data?.length || 0,
        error: result.error
      });
      
      if (result.success && 'data' in result && result.data) {
        setProducts(result.data);
        console.log(`[ProductContext] Set ${result.data.length} products`);
      } else {
        const errorMessage = result.error || '商品の読み込みに失敗しました';
        console.error('[ProductContext] Load failed:', errorMessage);
        setError(errorMessage);
        setProducts([]);
      }
    } catch (error: any) {
      console.error('[ProductContext] Unexpected error:', error);
      const errorMessage = error.message || '商品の読み込みに失敗しました';
      setError(errorMessage);
      // エラー時でも空配列をセット（UIの一貫性のため）
      setProducts([]);
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

  const getSwipeHistory = async (userId: string, result?: 'yes' | 'no' | 'all') => {
    try {
      setLoading(true);
      setError(null);

      // 'all'の場合はundefinedとして扱う（全履歴取得）
      const filterResult = result === 'all' ? undefined : result;
      
      // スワイプ履歴を取得
      const swipeData = await getSwipeHistoryService(userId, filterResult);
      
      if (swipeData && swipeData.length > 0) {
        // 商品IDのリストを抽出（重複を除去）
        const uniqueProductIds = [...new Set(swipeData.map(swipe => swipe.productId))];
        
        console.log(`[ProductContext] Fetching ${uniqueProductIds.length} unique products from ${swipeData.length} swipes`);
        
        // 商品詳細を取得（バッチ処理）
        const batchSize = 10; // 一度に取得する商品数
        const validProducts: Product[] = [];
        const seenIds = new Set<string>();
        
        for (let i = 0; i < uniqueProductIds.length; i += batchSize) {
          const batch = uniqueProductIds.slice(i, i + batchSize);
          const productPromises = batch.map(id => fetchProductById(id));
          
          try {
            const productResults = await Promise.all(productPromises);
            
            productResults.forEach(result => {
              if (result.success && 'data' in result && result.data) {
                const product = (result as any).data;
                // IDが正しい形式で、重複していないことを確認
                if (product.id && !seenIds.has(product.id)) {
                  seenIds.add(product.id);
                  validProducts.push(product);
                }
              }
            });
          } catch (batchError) {
            console.error(`[ProductContext] Error fetching batch ${i / batchSize}:`, batchError);
          }
        }
        
        console.log(`[ProductContext] Successfully loaded ${validProducts.length} products`);
        setSwipeHistory(validProducts);
      } else {
        setSwipeHistory([]);
      }
    } catch (error: any) {
      console.error('Error getting swipe history:', error);
      setError(error.message || 'スワイプ履歴の取得に失敗しました');
      setSwipeHistory([]);
    } finally {
      setLoading(false);
    }
  };

  const addToFavorites = async (userId: string, productId: string) => {
    try {
      // MVPではローカルstateで管理（後でSupabaseに保存する実装を追加可能）
      setFavorites(prev => {
        if (!prev.includes(productId)) {
          return [...prev, productId];
        }
        return prev;
      });
    } catch (error) {
      console.error('Error adding to favorites:', error);
    }
  };

  const removeFromFavorites = async (userId: string, productId: string) => {
    try {
      // MVPではローカルstateで管理
      setFavorites(prev => prev.filter(id => id !== productId));
    } catch (error) {
      console.error('Error removing from favorites:', error);
    }
  };

  const isFavorite = (productId: string): boolean => {
    return favorites.includes(productId);
  };

  const value: ProductContextType = {
    products,
    loading,
    error,
    swipeHistory,
    favorites,
    loadProducts,
    resetProducts,
    addSwipe,
    getSwipeHistory,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
  };

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  );
};
