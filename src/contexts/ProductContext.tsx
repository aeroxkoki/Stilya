import React, { createContext, useContext, useState, ReactNode } from 'react';
import { supabase } from '@/services/supabase';
import { 
  fetchProducts,
  fetchProductById,
  fetchProductsByTags
} from '@/services/productService';
import { saveSwipeResult, getSwipeHistory } from '@/services/swipeService';
import { Product } from '@/types';

interface ProductContextType {
  products: Product[];
  filteredProducts: Product[];
  favorites: Product[];
  swipeHistory: Product[];
  recommendedProducts: Product[];
  loading: boolean;
  error: string | null;
  hasMoreProducts: boolean;
  totalFetched: number;
  
  // 商品データ取得
  loadProducts: () => Promise<void>;
  loadMoreProducts: () => Promise<void>;
  resetProducts: () => void;
  
  // スワイプ関連
  addSwipe: (userId: string, productId: string, result: 'yes' | 'no') => Promise<void>;
  getSwipeHistory: (userId: string, result?: 'yes' | 'no') => Promise<Product[]>;
  
  // お気に入り関連
  addToFavorites: (userId: string, productId: string) => Promise<void>;
  removeFromFavorites: (userId: string, productId: string) => Promise<void>;
  getFavorites: (userId: string) => Promise<Product[]>;
  clearFavorites: (userId: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
  
  // レコメンド関連
  getRecommendedProducts: (userId: string) => Promise<Product[]>;
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
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [swipeHistory, setSwipeHistory] = useState<Product[]>([]);
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const [totalFetched, setTotalFetched] = useState(0);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // 商品データを取得
      const result = await fetchProducts(20, 0);
      
      if (result.success && 'data' in result && result.data) {
        setProducts(result.data);
        setHasMoreProducts(true);
        setTotalFetched(result.data.length);
      } else {
        setError(result.error || '商品の読み込みに失敗しました');
        setProducts([]);
      }
      setLoading(false);
    } catch (error: any) {
      console.error('Error loading products:', error);
      setError(error.message || '商品の読み込みに失敗しました');
      setLoading(false);
    }
  };

  const loadMoreProducts = async () => {
    try {
      // ロード中または次のページがない場合は処理しない
      if (!hasMoreProducts || loading) return;
      
      setLoading(true);
      
      // 次のページを取得
      const result = await fetchProducts(10, totalFetched);
      
      if (result.success && 'data' in result && result.data && result.data.length > 0) {
        setProducts(prev => [...prev, ...result.data]);
        setHasMoreProducts(result.data.length === 10); // 10件取得できた場合はまだページがある
        setTotalFetched(prev => prev + result.data.length);
      } else {
        setHasMoreProducts(false);
      }
      setLoading(false);
    } catch (error: any) {
      console.error('Error loading more products:', error);
      setError(error.message || '商品の追加読み込みに失敗しました');
      setLoading(false);
    }
  };

  const resetProducts = () => {
    setProducts([]);
    setFilteredProducts([]);
    setLoading(false);
    setError(null);
    setHasMoreProducts(true);
    setTotalFetched(0);
  };

  const addSwipe = async (userId: string, productId: string, result: 'yes' | 'no') => {
    try {
      // スワイプ結果を保存
      await saveSwipeResult(userId, productId, result);
      
      // スワイプした商品を記録（メモリ内のみ）
      const swipedProduct = products.find(p => p.id === productId);
      if (swipedProduct && result === 'yes') {
        // Yesの場合、レコメンド候補に追加（簡易実装）
        setRecommendedProducts(prev => [...prev, swipedProduct]);
      }
    } catch (error: any) {
      console.error('Error adding swipe:', error);
      // スワイプエラーはUIに表示しない（バックグラウンド処理）
    }
  };

  const getSwipeHistoryHandler = async (userId: string, result?: 'yes' | 'no') => {
    try {
      setLoading(true);
      setError(null);
      
      // スワイプ履歴を取得
      const swipes = await getSwipeHistory(userId, result);
      
      // 商品データを取得
      const fetchedProducts: Product[] = [];
      for (const swipe of swipes) {
        const result = await fetchProductById(swipe.productId);
        if (result.success && 'data' in result && result.data) {
          fetchedProducts.push(result.data);
        }
      }
      
      setSwipeHistory(fetchedProducts);
      setLoading(false);
      return fetchedProducts;
    } catch (error: any) {
      console.error('Error fetching swipe history:', error);
      setError(error.message || 'スワイプ履歴の取得に失敗しました');
      setLoading(false);
      return [];
    }
  };

  const addToFavorites = async (userId: string, productId: string) => {
    try {
      // 商品データの取得
      const product = products.find(p => p.id === productId);
      if (!product) {
        throw new Error('商品が見つかりません');
      }
      
      // すでにお気に入りに追加済みかチェック
      if (favorites.some(p => p.id === productId)) {
        return; // すでに追加済みの場合は何もしない
      }
      
      // MVPテスト用: メモリ内のみでお気に入りを管理
      setFavorites(prev => [...prev, product]);
      
      // コンソールにログを出力（テスト用）
      console.log(`お気に入り追加（テスト）: ユーザー ${userId} が商品 ${productId} をお気に入りに追加`);
    } catch (error: any) {
      console.error('Error adding to favorites:', error);
    }
  };

  const removeFromFavorites = async (userId: string, productId: string) => {
    try {
      // お気に入りから削除
      setFavorites(prev => prev.filter(p => p.id !== productId));
      
      // コンソールにログを出力（テスト用）
      console.log(`お気に入り削除（テスト）: ユーザー ${userId} が商品 ${productId} をお気に入りから削除`);
    } catch (error: any) {
      console.error('Error removing from favorites:', error);
    }
  };

  const clearFavorites = async (userId: string) => {
    try {
      // お気に入りをすべてクリア
      setFavorites([]);
      
      // コンソールにログを出力（テスト用）
      console.log(`お気に入りクリア（テスト）: ユーザー ${userId} がお気に入りをすべて削除`);
    } catch (error: any) {
      console.error('Error clearing favorites:', error);
    }
  };

  const getFavorites = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // MVPテスト用: 現在のお気に入りリストを返す
      if (favorites.length === 0 && products.length > 0) {
        // ダミーお気に入りの生成（開発用）
        const randomIndices = Array.from({ length: 5 }, () => 
          Math.floor(Math.random() * Math.min(products.length, 10))
        );
        const randomFavorites = randomIndices
          .map(index => products[index])
          .filter(Boolean);
        
        // 疑似的に少し遅延を入れる
        await new Promise(resolve => setTimeout(resolve, 300));
        
        setFavorites(randomFavorites);
        setLoading(false);
        return randomFavorites;
      }
      
      // すでにお気に入りが存在する場合はそれを返す
      setLoading(false);
      return favorites;
    } catch (error: any) {
      console.error('Error fetching favorites:', error);
      setError(error.message || 'お気に入りの取得に失敗しました');
      setLoading(false);
      return [];
    }
  };

  const isFavorite = (productId: string) => {
    return favorites.some(p => p.id === productId);
  };

  const getRecommendedProducts = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      // MVPテスト用: シンプルなタグベースのレコメンデーション
      const yesSwipes = await getSwipeHistory(userId, 'yes');
      const yesProductIds = yesSwipes.map(swipe => swipe.productId);
      
      // タグの集計
      const tagCounts: Record<string, number> = {};
      
      // 「Yes」と判定された商品のタグを集計
      products.forEach(product => {
        if (yesProductIds.includes(product.id) && product.tags) {
          product.tags.forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
          });
        }
      });
      
      // 人気のタグを抽出
      const popularTags = Object.entries(tagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag]) => tag);
      
      // 人気タグを持つ商品を取得
      let recommended: Product[] = [];
      
      if (popularTags.length > 0) {
        const result = await fetchProductsByTags(popularTags, 20, 0);
        if (result.success && 'data' in result && result.data) {
          recommended = result.data.filter(p => !yesProductIds.includes(p.id));
        }
      } else {
        // タグがない場合はランダムに20件取得
        const result = await fetchProducts(20, 0);
        if (result.success && 'data' in result && result.data) {
          recommended = result.data.filter(p => !yesProductIds.includes(p.id));
        }
      }
      
      setRecommendedProducts(recommended);
      setLoading(false);
      return recommended;
    } catch (error: any) {
      console.error('Error fetching recommended products:', error);
      setError(error.message || 'おすすめ商品の取得に失敗しました');
      setLoading(false);
      return [];
    }
  };

  const value: ProductContextType = {
    products,
    filteredProducts,
    favorites,
    swipeHistory,
    recommendedProducts,
    loading,
    error,
    hasMoreProducts,
    totalFetched,
    loadProducts,
    loadMoreProducts,
    resetProducts,
    addSwipe,
    getSwipeHistory: getSwipeHistoryHandler,
    addToFavorites,
    removeFromFavorites,
    getFavorites,
    clearFavorites,
    isFavorite,
    getRecommendedProducts,
  };

  return <ProductContext.Provider value={value}>{children}</ProductContext.Provider>;
};
