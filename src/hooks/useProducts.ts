import { useState, useEffect, useCallback } from 'react';
import { fetchProducts, saveSwipeResult } from '../services/productService';
import { Product, SwipeResult } from '../types/product';
import { useAuth } from './useAuth';

interface UseProductsReturn {
  products: Product[];
  currentProduct: Product | undefined;
  isLoading: boolean;
  error: string | null;
  handleSwipeLeft: () => void;
  handleSwipeRight: () => void;
  resetProducts: () => void;
}

export const useProducts = (): UseProductsReturn => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // 商品データを取得
  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const productsData = await fetchProducts(20);
      setProducts(productsData);
    } catch (err) {
      setError('商品データの読み込みに失敗しました。');
      console.error('Error loading products:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // 初回マウント時に商品データを取得
  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // 現在表示中の商品
  const currentProduct = products[currentIndex];

  // スワイプ左（NO）の処理
  const handleSwipeLeft = async () => {
    if (!user) return;

    try {
      // スワイプ結果を保存
      await saveSwipeResult({
        productId: currentProduct.id,
        result: 'no',
        userId: user.id,
      });

      // 次の商品へ
      setCurrentIndex(prevIndex => prevIndex + 1);
    } catch (err) {
      console.error('Error saving swipe result:', err);
    }
  };

  // スワイプ右（YES）の処理
  const handleSwipeRight = async () => {
    if (!user) return;

    try {
      // スワイプ結果を保存
      await saveSwipeResult({
        productId: currentProduct.id,
        result: 'yes',
        userId: user.id,
      });

      // 次の商品へ
      setCurrentIndex(prevIndex => prevIndex + 1);
    } catch (err) {
      console.error('Error saving swipe result:', err);
    }
  };

  // 商品リストをリセット
  const resetProducts = () => {
    setCurrentIndex(0);
    loadProducts();
  };

  return {
    products,
    currentProduct,
    isLoading,
    error,
    handleSwipeLeft,
    handleSwipeRight,
    resetProducts,
  };
};
