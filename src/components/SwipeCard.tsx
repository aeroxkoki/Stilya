import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Product } from '../types/product';
import { Feather } from '@expo/vector-icons';
import { CachedImage } from '../components/common';
import { useTheme } from '../contexts/ThemeContext';
import { useRenderMeasure } from '../utils/performance';
import { InteractionManager } from 'react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 300;

// スロットリング時間（ms）- パフォーマンス最適化用
const GESTURE_UPDATE_THROTTLE = 8;

interface SwipeCardProps {
  product: Product;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onCardPress: () => void;
  index?: number;
  testID?: string;
}

const SwipeCard: React.FC<SwipeCardProps> = ({
  product,
  onSwipeLeft,
  onSwipeRight,
  onCardPress,
  index = 0,
  testID,
}) => {
  // 開発モードのみパフォーマンスモニタリング
  if (__DEV__) {
    useRenderMeasure('SwipeCard');
  }

  const { theme, isDarkMode } = useTheme();
  const position = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(index === 0 ? 1 : 0.95)).current;
  const opacity = useRef(new Animated.Value(index === 0 ? 1 : 0.8)).current;
  
  // 最後のジェスチャー更新時間（スロットリング用）
  const lastGestureUpdate = useRef(Date.now());

  // 初期アニメーションの適用
  useEffect(() => {
    if (index === 0) {
      Animated.spring(scale, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: true,
      }).start();
      
      Animated.spring(opacity, {
        toValue: 1,
        friction: 6,
        useNativeDriver: true,
      }).start();
    }
  }, [index, scale, opacity]);

  // カードの回転を計算（メモ化して再計算を防止）
  const rotate = useMemo(() => 
    position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: ['-12deg', '0deg', '12deg'],
      extrapolate: 'clamp',
    }), 
    [position.x]
  );

  // Yes / No ラベルの透明度を計算（メモ化して再計算を防止）
  const likeOpacity = useMemo(() =>
    position.x.interpolate({
      inputRange: [0, SCREEN_WIDTH / 5],
      outputRange: [0, 1],
      extrapolate: 'clamp',
    }),
    [position.x]
  );

  const nopeOpacity = useMemo(() =>
    position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 5, 0],
      outputRange: [1, 0],
      extrapolate: 'clamp',
    }),
    [position.x]
  );

  // カードの背景色を変化させる（メモ化して再計算を防止）
  const cardColor = useMemo(() =>
    position.x.interpolate({
      inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
      outputRange: [
        'rgba(239, 68, 68, 0.1)', // 薄い赤
        'rgba(0, 0, 0, 0)',       // 透明
        'rgba(34, 197, 94, 0.1)'  // 薄い緑
      ],
      extrapolate: 'clamp',
    }),
    [position.x]
  );

  // スワイプ処理の最適化版
  const handlePanResponderMove = useCallback((
    _: any, 
    gesture: { dx: number; dy: number }
  ) => {
    const now = Date.now();
    
    // スロットリング適用（頻繁な更新を防止）
    if (now - lastGestureUpdate.current > GESTURE_UPDATE_THROTTLE) {
      position.setValue({ x: gesture.dx, y: gesture.dy });
      lastGestureUpdate.current = now;
    }
  }, [position]);

  const handlePanResponderRelease = useCallback((
    _: any, 
    gesture: { dx: number; dy: number }
  ) => {
    if (gesture.dx > SWIPE_THRESHOLD) {
      forceSwipe('right');
    } else if (gesture.dx < -SWIPE_THRESHOLD) {
      forceSwipe('left');
    } else {
      resetPosition();
    }
  }, []);

  // スワイプアニメーションを強制的に実行
  const forceSwipe = useCallback((direction: 'right' | 'left') => {
    const x = direction === 'right' ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;
    Animated.timing(position, {
      toValue: { x, y: direction === 'right' ? 30 : -30 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: true,
    }).start(() => onSwipeComplete(direction));
  }, [position]);

  // スワイプ完了時の処理
  const onSwipeComplete = useCallback((direction: 'right' | 'left') => {
    // スワイプ処理をメインスレッドの処理完了後に実行
    InteractionManager.runAfterInteractions(() => {
      if (direction === 'right') {
        onSwipeRight();
      } else {
        onSwipeLeft();
      }
      position.setValue({ x: 0, y: 0 });
    });
  }, [onSwipeLeft, onSwipeRight, position]);

  // カードの位置をリセット
  const resetPosition = useCallback(() => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [position]);

  // パンレスポンダーの設定（メモ化して再生成を防止）
  const panResponder = useMemo(() => 
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: handlePanResponderMove,
      onPanResponderRelease: handlePanResponderRelease,
    }),
    [handlePanResponderMove, handlePanResponderRelease]
  );

  // 価格をフォーマット
  const formatPrice = useCallback((price: number): string => {
    return price.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' });
  }, []);

  // カードのスタイルを定義（メモ化して再計算を防止）
  const cardAnimStyle = useMemo(() => ({
    transform: [
      { translateX: position.x },
      { translateY: position.y },
      { rotate },
      { scale }
    ],
    opacity,
    zIndex: 100 - index,
  }), [position.x, position.y, rotate, scale, opacity, index]);

  return (
    <Animated.View
      style={[
        styles.container,
        cardAnimStyle,
        { padding: theme.spacing.s }
      ]}
      testID={testID}
      {...(index === 0 ? panResponder.panHandlers : {})}
    >
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={index === 0 ? onCardPress : undefined}
        style={[
          styles.card,
          {
            borderRadius: theme.radius.l,
            backgroundColor: isDarkMode ? theme.colors.background.card : '#fff',
            shadowColor: isDarkMode ? '#000' : '#222',
            borderColor: theme.colors.border.light,
            borderWidth: isDarkMode ? 1 : 0,
          }
        ]}
      >
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            { backgroundColor: cardColor, zIndex: 1 }
          ]}
        />

        <CachedImage
          source={{ uri: product.imageUrl || '' }}
          style={styles.image}
          resizeMode="cover"
          showLoadingIndicator={true}
          // 優先度と最適化設定を追加
          priority={index === 0 ? 'high' : index < 3 ? 'normal' : 'low'}
          cachePolicy="memory-disk"
          blurRadius={5} // 低解像度プレースホルダーを利用
        />

        <View 
          style={[
            styles.overlay,
            {
              backgroundColor: isDarkMode 
                ? 'rgba(0, 0, 0, 0.6)' 
                : 'rgba(0, 0, 0, 0.4)'
            }
          ]}
        >
          <View style={styles.titleContainer}>
            <Text style={[
              styles.brand,
              { color: theme.colors.text.inverse }
            ]}>
              {product.brand}
            </Text>
            <Text style={[
              styles.title,
              { color: theme.colors.text.inverse }
            ]}>
              {product.title}
            </Text>
            <Text style={[
              styles.price,
              { color: theme.colors.accent }
            ]}>
              {formatPrice(product.price)}
            </Text>
          </View>

          <View style={styles.tagsContainer}>
            {product.tags.slice(0, 3).map((tag, tagIndex) => (
              <View 
                key={tagIndex} 
                style={[
                  styles.tag,
                  { backgroundColor: 'rgba(255, 255, 255, 0.2)' }
                ]}
              >
                <Text style={[
                  styles.tagText,
                  { color: theme.colors.text.inverse }
                ]}>
                  {tag}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Yes / No ラベル */}
        <Animated.View
          style={[
            styles.yesLabel,
            { opacity: likeOpacity },
          ]}
        >
          <Feather 
            name="check-circle" 
            size={80} 
            color={theme.colors.status.success} 
          />
        </Animated.View>

        <Animated.View
          style={[
            styles.noLabel,
            { opacity: nopeOpacity },
          ]}
        >
          <Feather 
            name="x-circle" 
            size={80} 
            color={theme.colors.status.error} 
          />
        </Animated.View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    width: SCREEN_WIDTH,
    height: '100%',
  },
  card: {
    flex: 1,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  image: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  titleContainer: {
    marginBottom: 8,
  },
  brand: {
    fontSize: 14,
    fontWeight: '500',
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 4,
  },
  price: {
    fontSize: 18,
    fontWeight: '600',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 12,
  },
  yesLabel: {
    position: 'absolute',
    top: 50,
    right: 40,
    transform: [{ rotate: '15deg' }],
    zIndex: 10,
  },
  noLabel: {
    position: 'absolute',
    top: 50,
    left: 40,
    transform: [{ rotate: '-15deg' }],
    zIndex: 10,
  },
});

// メモ化して再レンダリングを最小限に
export default React.memo(SwipeCard);
