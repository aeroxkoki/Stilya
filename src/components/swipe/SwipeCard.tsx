import React, { useRef, useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { PanGestureHandler, State } from 'react-native-gesture-handler';
import { Product } from '@/types';
import { formatPrice } from '@/utils';

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
  // アニメーション用の値
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const rotate = translateX.interpolate({
    inputRange: [-SWIPE_THRESHOLD * 2, 0, SWIPE_THRESHOLD * 2],
    outputRange: ['-30deg', '0deg', '30deg'],
    extrapolate: 'clamp'
  });

  // スワイプ方向の状態
  const [direction, setDirection] = useState<'left' | 'right' | null>(null);

  // パンジェスチャーのハンドラー
  const onPanGestureEvent = Animated.event(
    [{ nativeEvent: { translationX: translateX, translationY: translateY } }],
    { useNativeDriver: true }
  );

  // ジェスチャー状態の変化ハンドラー
  const onPanStateChange = ({ nativeEvent }: any) => {
    // ジェスチャーが終了したとき
    if (nativeEvent.state === State.END) {
      const { translationX } = nativeEvent;
      
      // スワイプしきい値を超えた場合
      if (translationX > SWIPE_THRESHOLD) {
        // 右にスワイプ（Yes）
        Animated.spring(translateX, {
          toValue: CARD_WIDTH + 100,
          useNativeDriver: true,
        }).start(() => {
          if (onSwipeRight) onSwipeRight();
        });
        setDirection('right');
      } else if (translationX < -SWIPE_THRESHOLD) {
        // 左にスワイプ（No）
        Animated.spring(translateX, {
          toValue: -CARD_WIDTH - 100,
          useNativeDriver: true,
        }).start(() => {
          if (onSwipeLeft) onSwipeLeft();
        });
        setDirection('left');
      } else {
        // しきい値以下ならリセット
        Animated.spring(translateX, {
          toValue: 0,
          friction: 5,
          useNativeDriver: true,
        }).start();
        Animated.spring(translateY, {
          toValue: 0,
          friction: 5,
          useNativeDriver: true,
        }).start();
        setDirection(null);
      }
    }
  };

  // 左右のボタンでスワイプするハンドラー
  const handleNoPress = () => {
    Animated.spring(translateX, {
      toValue: -CARD_WIDTH - 100,
      useNativeDriver: true,
    }).start(() => {
      if (onSwipeLeft) onSwipeLeft();
    });
    setDirection('left');
  };

  const handleYesPress = () => {
    Animated.spring(translateX, {
      toValue: CARD_WIDTH + 100,
      useNativeDriver: true,
    }).start(() => {
      if (onSwipeRight) onSwipeRight();
    });
    setDirection('right');
  };

  // Yes/Noインジケーターのスタイル
  const yesOpacity = translateX.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const noOpacity = translateX.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <PanGestureHandler
      onGestureEvent={onPanGestureEvent}
      onHandlerStateChange={onPanStateChange}
    >
      <Animated.View
        style={[
          styles.card,
          {
            transform: [
              { translateX },
              { translateY },
              { rotate }
            ]
          }
        ]}
      >
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={onPress}
          className="bg-white rounded-xl shadow-lg overflow-hidden w-full h-full"
        >
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.image}
            className="w-full"
          />
          
          {/* Yes/Noインジケーター */}
          <Animated.View 
            style={[styles.indicator, styles.yesIndicator, { opacity: yesOpacity }]}
          >
            <Text style={styles.indicatorText}>YES</Text>
          </Animated.View>
          
          <Animated.View 
            style={[styles.indicator, styles.noIndicator, { opacity: noOpacity }]}
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
              <View className="flex-row flex-wrap mt-2">
                {product.tags.slice(0, 4).map((tag, index) => (
                  <View
                    key={index}
                    className="bg-black/30 px-2 py-1 rounded-full mr-1 mb-1"
                  >
                    <Text className="text-white text-xs">{tag}</Text>
                  </View>
                ))}
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
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
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