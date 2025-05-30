import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, TouchableOpacity } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import { useSwipe } from '../../hooks/useSwipe';
import { Product } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useNetwork } from '../../contexts/NetworkContext';
import SwipeCard from './SwipeCard';

interface SwipeContainerProps {
  products: Product[];
  isLoading: boolean;
  onSwipe?: (product: Product, direction: 'left' | 'right') => void;
  onCardPress?: (product: Product) => void;
  onEmptyProducts?: () => void;
  onLoadMore?: () => Promise<void>;
  hasMoreProducts?: boolean;
  testID?: string;
}

const SwipeContainer: React.FC<SwipeContainerProps> = ({
  products,
  isLoading,
  onSwipe,
  onCardPress,
  onEmptyProducts,
  onLoadMore,
  hasMoreProducts = false,
  testID,
}) => {
  const { user } = useAuth();
  const { isConnected } = useNetwork();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const loadMoreThreshold = useRef(5); // あと5枚になったら追加読み込み
  const currentProduct = products[currentIndex];

  // 商品が少なくなってきたら追加読み込み
  useEffect(() => {
    const handleLoadMore = async () => {
      if (
        hasMoreProducts && 
        onLoadMore && 
        !loadingMore && 
        products.length > 0 && 
        products.length - currentIndex <= loadMoreThreshold.current
      ) {
        try {
          setLoadingMore(true);
          await onLoadMore();
        } finally {
          setLoadingMore(false);
        }
      }
    };

    handleLoadMore();
  }, [currentIndex, products.length, hasMoreProducts, onLoadMore, loadingMore]);

  // 全ての商品をスワイプし終わったら通知
  useEffect(() => {
    if (products.length > 0 && currentIndex >= products.length) {
      if (onEmptyProducts) {
        onEmptyProducts();
      }
    }
  }, [currentIndex, products.length, onEmptyProducts]);

  // スワイプ完了時の処理
  const handleSwipeComplete = useCallback((direction: 'left' | 'right', product: Product) => {
    // スワイプイベントを親コンポーネントに通知
    if (onSwipe) {
      onSwipe(product, direction);
    }
    
    // 一定時間後に次のカードへ
    setTimeout(() => {
      setCurrentIndex(prevIndex => prevIndex + 1);
    }, 300); // アニメーション完了まで少し待つ
  }, [onSwipe]);

  // スワイプロジックを取得
  const { 
    translateX, 
    translateY, 
    scale, 
    rotation,
    handleSwipeLeft,
    handleSwipeRight,
    handleSwipeStart,
    resetPosition,
    SWIPE_THRESHOLD
  } = useSwipe({
    userId: user?.id,
    onSwipeComplete: handleSwipeComplete,
  });

  // パンジェスチャーハンドラー
  const gestureHandler = useAnimatedGestureHandler({
    onStart: () => {
      runOnJS(handleSwipeStart)();
    },
    onActive: (event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      rotation.value = interpolate(
        event.translationX,
        [-200, 0, 200],
        [-15, 0, 15],
        Extrapolate.CLAMP
      );
    },
    onEnd: (event) => {
      if (event.translationX > SWIPE_THRESHOLD && currentProduct) {
        runOnJS(handleSwipeRight)(currentProduct);
      } else if (event.translationX < -SWIPE_THRESHOLD && currentProduct) {
        runOnJS(handleSwipeLeft)(currentProduct);
      } else {
        runOnJS(resetPosition)();
      }
    },
  });

  // カードのアニメーションスタイル
  const animatedCardStyle = useAnimatedStyle(() => {
    'worklet';
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotation.value}deg` },
        { scale: scale.value },
      ] as any,
    } as any;
  });

  // Yes/Noインジケーターのアニメーションスタイル
  const yesIndicatorStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        translateX.value,
        [0, SWIPE_THRESHOLD / 2, SWIPE_THRESHOLD],
        [0, 0.5, 1],
        Extrapolate.CLAMP
      ),
    };
  });

  const noIndicatorStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        translateX.value,
        [-SWIPE_THRESHOLD, -SWIPE_THRESHOLD / 2, 0],
        [1, 0.5, 0],
        Extrapolate.CLAMP
      ),
    };
  });

  // ボタンによるスワイプ操作ハンドラー
  const handleNoButtonPress = useCallback(() => {
    if (currentProduct) {
      handleSwipeLeft(currentProduct);
    }
  }, [currentProduct, handleSwipeLeft]);

  const handleYesButtonPress = useCallback(() => {
    if (currentProduct) {
      handleSwipeRight(currentProduct);
    }
  }, [currentProduct, handleSwipeRight]);

  // 商品カードのタップイベント
  const handleCardPress = useCallback(() => {
    if (currentProduct && onCardPress) {
      onCardPress(currentProduct);
    }
  }, [currentProduct, onCardPress]);

  // ローディング中の表示
  if (isLoading && products.length === 0) {
    return (
      <View style={styles.centerContainer} testID="loading-container">
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>商品を読み込んでいます...</Text>
      </View>
    );
  }

  // 全ての商品をスワイプし終わった場合 または オフライン時でデータがない場合
  if ((products.length === 0 || currentIndex >= products.length)) {
    return (
      <View style={styles.centerContainer} testID="empty-container">
        <Ionicons name="cart-outline" size={64} color="#9CA3AF" />
        <Text style={styles.emptyText}>表示できる商品がありません</Text>
        {isConnected === false && (
          <View style={styles.offlineContainer} testID="offline-state-notice">
            <Ionicons name="cloud-offline-outline" size={24} color="#F87171" />
            <Text style={styles.offlineText}>オフラインモードです</Text>
            <Text style={styles.offlineSubText}>インターネット接続時に商品が更新されます</Text>
          </View>
        )}
      </View>
    );
  }

  return (
    <View style={styles.container} testID={testID || 'swipe-container'}>
      {/* オフライン通知 */}
      {isConnected === false && (
        <View style={styles.offlineBanner} testID="offline-banner">
          <Ionicons name="cloud-offline-outline" size={18} color="#FFFFFF" />
          <Text style={styles.offlineBannerText}>オフラインモード</Text>
        </View>
      )}
      
      {/* 追加ローディング */}
      {loadingMore && (
        <View style={styles.loadingMoreContainer} testID="loading-more">
          <ActivityIndicator size="small" color="#3B82F6" />
          <Text style={styles.loadingMoreText}>もっと読み込み中...</Text>
        </View>
      )}
      
      <PanGestureHandler onGestureEvent={gestureHandler} enabled={!!onSwipe} testID="pan-handler">
        <Animated.View style={[styles.cardContainer, animatedCardStyle]} testID="animated-card-container">
          {currentProduct && (
            <SwipeCard
              product={currentProduct}
              onPress={handleCardPress}
              onSwipeLeft={isConnected === false ? undefined : handleNoButtonPress}
              onSwipeRight={isConnected === false ? undefined : handleYesButtonPress}
              testID="current-swipe-card"
            />
          )}
        </Animated.View>
      </PanGestureHandler>
      
      {/* 残りカード数表示 */}
      <View style={styles.remainingContainer} testID="remaining-counter">
        <Text style={styles.remainingText}>
          残り {products.length - currentIndex} / {products.length} 件
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#757575',
  },
  emptyText: {
    fontSize: 18,
    color: '#757575',
    textAlign: 'center',
    marginVertical: 12,
  },
  cardContainer: {
    width: '90%',
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingMoreContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    zIndex: 10,
  },
  loadingMoreText: {
    marginLeft: 8,
    fontSize: 14,
    color: '#4B5563',
  },
  remainingContainer: {
    position: 'absolute',
    bottom: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  remainingText: {
    fontSize: 12,
    color: '#6B7280',
  },
  offlineBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#F87171',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    zIndex: 20,
  },
  offlineBannerText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
    marginLeft: 6,
  },
  offlineContainer: {
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    width: '90%',
  },
  offlineText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#EF4444',
    marginTop: 8,
  },
  offlineSubText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
});

export default SwipeContainer;
