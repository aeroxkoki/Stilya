import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedGestureHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolate,
  runOnJS,
} from 'react-native-reanimated';
import { useSwipe } from '@/hooks/useSwipe';
import { Product } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import SwipeCard from './SwipeCard';

interface SwipeContainerProps {
  products: Product[];
  isLoading: boolean;
  onSwipe?: (product: Product, direction: 'left' | 'right') => void;
  onCardPress?: (product: Product) => void;
  onEmptyProducts?: () => void;
}

const SwipeContainer: React.FC<SwipeContainerProps> = ({
  products,
  isLoading,
  onSwipe,
  onCardPress,
  onEmptyProducts,
}) => {
  const { user } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentProduct = products[currentIndex];

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
    onStart: (_, ctx: any) => {
      ctx.startX = translateX.value;
      ctx.startY = translateY.value;
      runOnJS(handleSwipeStart)();
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX;
      translateY.value = ctx.startY + event.translationY * 0.5; // Y軸の動きは抑制
      
      // 回転角度（-15度〜15度）
      rotation.value = interpolate(
        event.translationX,
        [-SWIPE_THRESHOLD * 2, 0, SWIPE_THRESHOLD * 2],
        [-15, 0, 15]
      );
    },
    onEnd: (event) => {
      // しきい値を超えたら対応するスワイプアクションを実行
      if (event.translationX > SWIPE_THRESHOLD && currentProduct) {
        runOnJS(handleSwipeRight)(currentProduct);
      } else if (event.translationX < -SWIPE_THRESHOLD && currentProduct) {
        runOnJS(handleSwipeLeft)(currentProduct);
      } else {
        // しきい値未満ならリセット
        runOnJS(resetPosition)();
      }
    },
  });

  // カードのアニメーションスタイル
  const animatedCardStyle = useAnimatedStyle(() => {
    const rotateZ = `${rotation.value}deg`;
    
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotateZ },
        { scale: scale.value }
      ],
    };
  });

  // Yes/Noインジケーターのアニメーションスタイル
  const yesIndicatorStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, SWIPE_THRESHOLD],
      [0, 1],
      Extrapolate.CLAMP
    );

    return { opacity };
  });

  const noIndicatorStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD, 0],
      [1, 0],
      Extrapolate.CLAMP
    );

    return { opacity };
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
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>商品を読み込んでいます...</Text>
      </View>
    );
  }

  // 全ての商品をスワイプし終わった場合
  if (products.length === 0 || currentIndex >= products.length) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>表示できる商品がありません</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.cardContainer, animatedCardStyle]}>
          {currentProduct && (
            <SwipeCard
              product={currentProduct}
              onPress={handleCardPress}
              onSwipeLeft={handleNoButtonPress}
              onSwipeRight={handleYesButtonPress}
              yesIndicatorStyle={yesIndicatorStyle}
              noIndicatorStyle={noIndicatorStyle}
            />
          )}
        </Animated.View>
      </PanGestureHandler>
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
  },
  cardContainer: {
    width: '90%',
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SwipeContainer;
