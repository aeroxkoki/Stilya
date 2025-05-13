import React, { useState, useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ActivityIndicator, 
  StyleSheet, 
  Dimensions 
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/common';
import SwipeCard from '@/components/swipe/SwipeCard';
import { useProductStore } from '@/store/productStore';
import { useAuthStore } from '@/store/authStore';
import { Product } from '@/types';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSpring, 
  withSequence, 
  withTiming, 
  runOnJS
} from 'react-native-reanimated';

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
  
  // アニメーション値
  const emptyStateOpacity = useSharedValue(0);
  const headerScale = useSharedValue(1);

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
    
    // スケールアニメーション効果
    headerScale.value = withSequence(
      withTiming(1.1, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    
    // 次の商品へ
    setCurrentIndex(prevIndex => prevIndex + 1);
    
    // 商品がなくなった場合は空の状態をフェードイン
    if (currentIndex >= availableProducts.length - 1) {
      emptyStateOpacity.value = withTiming(1, { duration: 500 });
    }
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
    // フェードアウト
    emptyStateOpacity.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(resetData)();
    });
  };
  
  // データリセット
  const resetData = () => {
    fetchProducts();
    setCurrentIndex(0);
    setSwipedProductIds(new Set());
    swipeCount.current = 0;
  };

  // アニメーションスタイル
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: headerScale.value }]
    };
  });
  
  const emptyStateAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: emptyStateOpacity.value
    };
  });

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
          <Ionicons name="alert-circle-outline" size={64} color="#F87171" />
          <Text className="text-red-500 text-xl font-bold mt-4 mb-2">エラーが発生しました</Text>
          <Text className="text-gray-700 mb-8 text-center">{error}</Text>
          <Button onPress={handleReload}>再読み込み</Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* ヘッダー情報 */}
      <Animated.View 
        className="px-4 py-2 flex-row justify-between items-center"
        style={headerAnimatedStyle}
      >
        <Text className="text-gray-400 text-sm">
          {swipeCount.current}件スワイプ
        </Text>
        <Text className="text-gray-500 font-medium">
          Stilya
        </Text>
        <Text className="text-gray-400 text-sm">
          残り{availableProducts.length - currentIndex}件
        </Text>
      </Animated.View>
      
      <View className="flex-1 items-center justify-center p-4">
        {/* スワイプカード */}
        {hasProducts ? (
          <SwipeCard
            product={availableProducts[currentIndex]}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onPress={handleCardPress}
          />
        ) : (
          <Animated.View 
            className="items-center justify-center p-6"
            style={emptyStateAnimatedStyle}
          >
            <Ionicons name="checkmark-circle-outline" size={64} color="#22C55E" />
            <Text className="text-2xl font-bold mt-4 mb-2 text-center">
              すべての商品をスワイプしました
            </Text>
            <Text className="text-gray-500 text-center mb-8">
              あなたの好みに合わせた商品をチェックしてみましょう。
            </Text>
            <View className="flex-row space-x-4">
              <Button 
                onPress={handleReload}
                style={styles.button}
              >
                もっと見る
              </Button>
              <Button 
                onPress={() => navigation.navigate('Recommend' as never)}
                style={[styles.button, styles.primaryButton]}
              >
                おすすめを見る
              </Button>
            </View>
          </Animated.View>
        )}
        
        {/* フッター情報 */}
        {hasProducts && (
          <View className="w-full items-center mt-4 mb-4">
            <Text className="text-gray-400 text-sm text-center">
              左右にスワイプするか、ボタンをタップしてください
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  button: {
    minWidth: 120,
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
  }
});

export default SwipeScreen;