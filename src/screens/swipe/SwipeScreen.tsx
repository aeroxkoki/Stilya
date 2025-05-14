import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import SwipeContainer from '@/components/swipe/SwipeContainer';
import { useAuth } from '@/hooks/useAuth';
import { useNetwork } from '@/contexts/NetworkContext';
import { Product } from '@/types';
import { fetchProducts, fetchNextPage } from '@/services/productService';
import { saveSwipeResult } from '@/services/swipeService';
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
  const { user } = useAuth();
  const { isConnected } = useNetwork();

  // 状態管理
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [swipedProductIds, setSwipedProductIds] = useState<Set<string>>(new Set());
  const [hasMoreProducts, setHasMoreProducts] = useState(true);
  const swipeCount = useRef<number>(0);
  
  // アニメーション値
  const emptyStateOpacity = useSharedValue(0);
  const headerScale = useSharedValue(1);

  // 商品データの読み込み
  useEffect(() => {
    const loadProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 商品データの取得（ページネーション対応）
        const result = await fetchProducts(20, 0, true);
        setProducts(result.products);
        setHasMoreProducts(result.hasMore);
        
        // オフラインモードの通知
        if (!isConnected) {
          console.log('Loading products in offline mode');
        }
      } catch (err: any) {
        console.error('Failed to load products:', err);
        setError(err.message || 'Failed to load products');
      } finally {
        setLoading(false);
      }
    };
    
    loadProducts();
  }, [isConnected]);

  // 追加の商品を読み込む
  const handleLoadMore = useCallback(async () => {
    if (!hasMoreProducts || loading) return;
    
    try {
      // 次のページを取得
      const result = await fetchNextPage();
      
      if (result.products.length > 0) {
        // スワイプ済みの商品をフィルタリング
        const newProducts = result.products.filter(
          product => !swipedProductIds.has(product.id)
        );
        
        setProducts(prevProducts => [...prevProducts, ...newProducts]);
        setHasMoreProducts(result.hasMore);
      } else {
        setHasMoreProducts(false);
      }
    } catch (err: any) {
      console.error('Failed to load more products:', err);
      // エラーがあっても続行できるようにする（通知だけ）
    }
  }, [hasMoreProducts, loading, swipedProductIds]);

  // スワイプ操作の処理
  const handleSwipe = useCallback(async (product: Product, direction: 'left' | 'right') => {
    if (!user) return;

    const swipeResult = direction === 'right' ? 'yes' : 'no';
    
    // スワイプデータをSupabaseに保存（オフライン対応）
    try {
      await saveSwipeResult(user.id, product.id, swipeResult);
    } catch (err) {
      console.error('Failed to save swipe result:', err);
      // エラー時の処理（UI通知など）
    }
    
    // スワイプ済み商品を記録
    setSwipedProductIds(prev => {
      const newSet = new Set(prev);
      newSet.add(product.id);
      return newSet;
    });

    // カウンターをインクリメント
    swipeCount.current += 1;
    
    // スケールアニメーション効果
    headerScale.value = withSequence(
      withTiming(1.1, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    
    // 商品がなくなった場合は空の状態をフェードイン
    if (products.filter(p => !swipedProductIds.has(p.id)).length <= 1) {
      emptyStateOpacity.value = withTiming(1, { duration: 500 });
    }
  }, [user, products, swipedProductIds, emptyStateOpacity, headerScale]);

  // 商品詳細画面へ
  const handleCardPress = useCallback((product: Product) => {
    // @ts-ignore
    navigation.navigate('ProductDetail', { productId: product.id });
  }, [navigation]);

  // 商品をリロード
  const handleReload = useCallback(async () => {
    // フェードアウト
    emptyStateOpacity.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(resetData)();
    });
  }, [emptyStateOpacity]);
  
  // データリセット
  const resetData = async () => {
    try {
      setLoading(true);
      const result = await fetchProducts(20, 0, true);
      setProducts(result.products);
      setHasMoreProducts(result.hasMore);
      setSwipedProductIds(new Set());
      swipeCount.current = 0;
    } catch (err: any) {
      setError(err.message || 'Failed to reload products');
    } finally {
      setLoading(false);
    }
  };

  // 商品切れ時の処理
  const handleEmptyProducts = useCallback(() => {
    // 空の状態をアニメーションで表示
    emptyStateOpacity.value = withTiming(1, { duration: 500 });
  }, [emptyStateOpacity]);

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

  // 表示するフィルタリング済み商品リスト
  const filteredProducts = products.filter(p => !swipedProductIds.has(p.id));

  // ローディング表示
  if (loading && products.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center" testID="loading-container">
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
        <View className="flex-1 items-center justify-center p-6" testID="error-container">
          <Ionicons name="alert-circle-outline" size={64} color="#F87171" />
          <Text className="text-red-500 text-xl font-bold mt-4 mb-2">エラーが発生しました</Text>
          <Text className="text-gray-700 mb-8 text-center">{error}</Text>
          <Button onPress={handleReload} testID="reload-button">再読み込み</Button>
          
          {isConnected === false && (
            <View className="mt-6 bg-yellow-50 p-4 rounded-lg w-full">
              <Text className="text-yellow-700 text-center">
                オフラインモードです。インターネット接続を確認してください。
              </Text>
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  // 全ての商品をスワイプし終わった場合
  const allProductsSwiped = filteredProducts.length === 0 && products.length > 0;

  return (
    <SafeAreaView className="flex-1 bg-white" testID="swipe-screen">
      {/* ヘッダー情報 */}
      <Animated.View 
        className="px-4 py-2 flex-row justify-between items-center"
        style={headerAnimatedStyle}
        testID="swipe-header"
      >
        <Text className="text-gray-400 text-sm">
          {swipeCount.current}件スワイプ
        </Text>
        <Text className="text-gray-500 font-medium">
          Stilya
        </Text>
        <Text className="text-gray-400 text-sm">
          残り{filteredProducts.length}件
        </Text>
      </Animated.View>
      
      <View className="flex-1 items-center justify-center p-4">
        {/* スワイプコンテナ */}
        {!allProductsSwiped ? (
          <SwipeContainer
            products={filteredProducts}
            isLoading={loading}
            onSwipe={isConnected === false ? undefined : handleSwipe}
            onCardPress={handleCardPress}
            onEmptyProducts={handleEmptyProducts}
            onLoadMore={isConnected === false ? undefined : handleLoadMore}
            hasMoreProducts={hasMoreProducts}
            testID="swipe-container"
          />
        ) : (
          <Animated.View 
            className="items-center justify-center p-6"
            style={emptyStateAnimatedStyle}
            testID="empty-state"
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
                onPress={() => {
                  // @ts-ignore
                  navigation.navigate('Recommend');
                }}
                style={[styles.button, styles.primaryButton]}
              >
                おすすめを見る
              </Button>
            </View>
            
            {/* オフライン状態表示 */}
            {isConnected === false && (
              <View className="mt-6 bg-red-50 p-4 rounded-lg w-full">
                <Text className="text-red-700 text-center">
                  オフラインモードです。インターネット接続時に新しい商品が表示されます。
                </Text>
              </View>
            )}
          </Animated.View>
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
