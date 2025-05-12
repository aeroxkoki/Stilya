import React, { useState, useEffect, useRef } from 'react';
import { View, Text, SafeAreaView, ActivityIndicator, Alert, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Button } from '@/components/common';
import SwipeCard from '@/components/swipe/SwipeCard';
import { useProductStore } from '@/store/productStore';
import { useAuthStore } from '@/store/authStore';
import { Product } from '@/types';

const { width, height } = Dimensions.get('window');

const SwipeScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { 
    products, 
    fetchProducts, 
    addSwipe, 
    loading, 
    error 
  } = useProductStore();

  // スワイプ中の商品管理
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [swipedProductIds, setSwipedProductIds] = useState<Set<string>>(new Set());
  const swipeCount = useRef<number>(0);

  // 商品データの読み込み
  useEffect(() => {
    const loadProducts = async () => {
      await fetchProducts();
    };
    
    loadProducts();
  }, [fetchProducts]);

  // 表示する商品のフィルタリング（スワイプ済みを除外）
  const availableProducts: Product[] = products.filter(p => !swipedProductIds.has(p.id));

  // スワイプ可能な商品が残っているか
  const hasProducts = availableProducts.length > 0 && currentIndex < availableProducts.length;

  // 次の商品を表示
  const handleSwipeCompleted = (productId: string, result: 'yes' | 'no') => {
    if (!user) return;

    // スワイプデータをSupabaseに保存
    addSwipe(user.id, productId, result);
    
    // スワイプ済み商品を記録
    setSwipedProductIds(prev => {
      const newSet = new Set(prev);
      newSet.add(productId);
      return newSet;
    });

    // カウンターをインクリメント
    swipeCount.current += 1;
    
    // 次の商品へ
    setCurrentIndex(prevIndex => prevIndex + 1);
  };

  // 右スワイプ（YES）ハンドラー
  const handleSwipeRight = () => {
    if (!hasProducts) return;
    
    const currentProduct = availableProducts[currentIndex];
    handleSwipeCompleted(currentProduct.id, 'yes');
  };

  // 左スワイプ（NO）ハンドラー
  const handleSwipeLeft = () => {
    if (!hasProducts) return;
    
    const currentProduct = availableProducts[currentIndex];
    handleSwipeCompleted(currentProduct.id, 'no');
  };

  // 商品詳細画面へ
  const handleCardPress = () => {
    if (!hasProducts) return;
    
    const currentProduct = availableProducts[currentIndex];
    navigation.navigate('ProductDetail' as never, { productId: currentProduct.id } as never);
  };

  // 商品をリロード
  const handleReload = () => {
    fetchProducts();
    setCurrentIndex(0);
    setSwipedProductIds(new Set());
  };

  // ローディング表示
  if (loading && products.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-500">商品を読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // エラー表示
  if (error && products.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-red-500 mb-4">エラーが発生しました</Text>
          <Text className="text-gray-700 mb-8 text-center">{error}</Text>
          <Button onPress={handleReload}>再読み込み</Button>
        </View>
      </SafeAreaView>
    );
  }

  // 商品がない場合
  if (products.length === 0 || !hasProducts) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-2xl font-bold mb-4">
            {products.length === 0 ? '商品がありません' : 'すべての商品をスワイプしました'}
          </Text>
          <Text className="text-gray-500 text-center mb-8">
            新しい商品を読み込みましょう。
          </Text>
          <Button onPress={handleReload}>商品を更新する</Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 items-center justify-center p-4">
        {/* スワイプ中の商品数表示 */}
        <View className="absolute top-2 right-4 z-10">
          <Text className="text-gray-500 text-sm">
            {swipeCount.current}件スワイプ / 残り{availableProducts.length - currentIndex}件
          </Text>
        </View>
        
        {/* スワイプカード */}
        <View className="flex-1 items-center justify-center">
          <SwipeCard
            product={availableProducts[currentIndex]}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onPress={handleCardPress}
          />
        </View>
        
        {/* フッター情報 */}
        <View className="w-full items-center mb-4">
          <Text className="text-gray-400 text-sm text-center">
            左右にスワイプするか、ボタンをタップしてください
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default SwipeScreen;