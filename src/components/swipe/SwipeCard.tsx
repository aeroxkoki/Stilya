import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PanGestureHandler } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withSpring,
  interpolate,
  runOnJS,
  withTiming,
  Extrapolate
} from 'react-native-reanimated';
import { Product } from '@/types';
import { formatPrice } from '@/utils';
import { Tags } from '@/components/common';

export interface SwipeCardProps {
  product: Product;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onPress?: () => void;
}

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = height * 0.6;
const SWIPE_THRESHOLD = 120; // この値以上スワイプしたらアクションを実行

const SwipeCard: React.FC<SwipeCardProps> = ({ 
  product, 
  onPress,
  onSwipeLeft,
  onSwipeRight
}) => {
  // Reanimated 2のSharedValue
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const scale = useSharedValue(1);
  
  // スワイプ方向の状態
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  // ジェスチャーハンドラー
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startX = translateX.value;
      ctx.startY = translateY.value;
      // カードを持ち上げる効果
      scale.value = withTiming(1.05, { duration: 200 });
    },
    onActive: (event, ctx) => {
      translateX.value = ctx.startX + event.translationX;
      translateY.value = ctx.startY + event.translationY * 0.5; // Y軸は少し抑制
    },
    onEnd: (event) => {
      // スワイプがしきい値を超えたかどうかを判定
      if (event.translationX > SWIPE_THRESHOLD) {
        // 右にスワイプ完了
        translateX.value = withSpring(CARD_WIDTH + 100);
        translateY.value = withSpring(0);
        if (onSwipeRight) {
          runOnJS(setDirection)('right');
          runOnJS(onSwipeRight)();
        }
      } else if (event.translationX < -SWIPE_THRESHOLD) {
        // 左にスワイプ完了
        translateX.value = withSpring(-CARD_WIDTH - 100);
        translateY.value = withSpring(0);
        if (onSwipeLeft) {
          runOnJS(setDirection)('left');
          runOnJS(onSwipeLeft)();
        }
      } else {
        // しきい値未満ならリセット
        translateX.value = withSpring(0, { damping: 15 });
        translateY.value = withSpring(0, { damping: 15 });
        runOnJS(setDirection)(null);
      }
      // カードを元のサイズに戻す
      scale.value = withTiming(1, { duration: 200 });
    },
  });

  // 左右のボタンでスワイプするハンドラー
  const handleNoPress = () => {
    translateX.value = withSpring(-CARD_WIDTH - 100);
    if (onSwipeLeft) {
      setDirection('left');
      onSwipeLeft();
    }
  };

  const handleYesPress = () => {
    translateX.value = withSpring(CARD_WIDTH + 100);
    if (onSwipeRight) {
      setDirection('right');
      onSwipeRight();
    }
  };

  // アニメーションスタイル
  const animatedCardStyle = useAnimatedStyle(() => {
    const rotate = interpolate(
      translateX.value,
      [-SWIPE_THRESHOLD * 2, 0, SWIPE_THRESHOLD * 2],
      ['-30deg', '0deg', '30deg'],
      Extrapolate.CLAMP
    );

    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate },
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

  return (
    <PanGestureHandler onGestureEvent={gestureHandler}>
      <Animated.View style={[styles.card, animatedCardStyle]}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onPress}
          className="bg-white rounded-xl shadow-lg overflow-hidden w-full h-full"
        >
          <View className="w-full h-full">
            <Image
              source={{ uri: product.imageUrl }}
              style={styles.image}
              className="w-full h-full"
            />
            
            {/* Yes/Noインジケーター */}
            <Animated.View 
              style={[styles.indicator, styles.yesIndicator, yesIndicatorStyle]}
            >
              <Text style={styles.indicatorText}>YES</Text>
            </Animated.View>
            
            <Animated.View 
              style={[styles.indicator, styles.noIndicator, noIndicatorStyle]}
            >
              <Text style={styles.indicatorText}>NO</Text>
            </Animated.View>
            
            <View className="absolute bottom-0 left-0 right-0 bg-black/50 p-4">
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="text-white font-bold text-xl" numberOfLines={1}>
                    {product.title}
                  </Text>
                  {product.brand && (
                    <Text className="text-gray-200 text-base" numberOfLines={1}>
                      {product.brand}
                    </Text>
                  )}
                </View>
                <Text className="text-white font-bold text-xl ml-2">
                  {formatPrice(product.price)}
                </Text>
              </View>
              
              {product.tags && product.tags.length > 0 && (
                <View className="mt-2">
                  <Tags tags={product.tags} size="small" />
                </View>
              )}
            </View>
            
            {/* スワイプアクションボタン */}
            <View className="absolute bottom-28 left-4 right-4 flex-row justify-between">
              <TouchableOpacity 
                className="w-16 h-16 bg-white rounded-full items-center justify-center shadow-md"
                onPress={handleNoPress}
              >
                <Ionicons name="close" size={32} color="#F87171" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                className="w-16 h-16 bg-white rounded-full items-center justify-center shadow-md"
                onPress={handleYesPress}
              >
                <Ionicons name="heart" size={32} color="#3B82F6" />
              </TouchableOpacity>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    </PanGestureHandler>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
    borderRadius: 12,
  },
  indicator: {
    position: 'absolute',
    padding: 10,
    borderWidth: 5,
    borderRadius: 12,
    top: 30,
    transform: [{ rotate: '-20deg' }],
  },
  yesIndicator: {
    right: 20,
    borderColor: '#22C55E',
  },
  noIndicator: {
    left: 20,
    borderColor: '#F87171',
  },
  indicatorText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  }
});

export default SwipeCard;