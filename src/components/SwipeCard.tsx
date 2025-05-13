import React, { useRef, useEffect } from 'react';
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

const SCREEN_WIDTH = Dimensions.get('window').width;
const SWIPE_THRESHOLD = 0.25 * SCREEN_WIDTH;
const SWIPE_OUT_DURATION = 300;

interface SwipeCardProps {
  product: Product;
  onSwipeLeft: () => void;
  onSwipeRight: () => void;
  onCardPress: () => void;
  index?: number;
}

const SwipeCard: React.FC<SwipeCardProps> = ({
  product,
  onSwipeLeft,
  onSwipeRight,
  onCardPress,
  index = 0,
}) => {
  const { theme, isDarkMode } = useTheme();
  const position = useRef(new Animated.ValueXY()).current;
  const scale = useRef(new Animated.Value(index === 0 ? 1 : 0.95)).current;
  const opacity = useRef(new Animated.Value(index === 0 ? 1 : 0.8)).current;

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

  // カードの回転を計算
  const rotate = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: ['-12deg', '0deg', '12deg'],
    extrapolate: 'clamp',
  });

  // Yes / No ラベルの透明度を計算
  const likeOpacity = position.x.interpolate({
    inputRange: [0, SCREEN_WIDTH / 5],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 5, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  // カードの背景色を変化させる
  const cardColor = position.x.interpolate({
    inputRange: [-SCREEN_WIDTH / 2, 0, SCREEN_WIDTH / 2],
    outputRange: [
      'rgba(239, 68, 68, 0.1)', // 薄い赤
      'rgba(0, 0, 0, 0)',       // 透明
      'rgba(34, 197, 94, 0.1)'  // 薄い緑
    ],
    extrapolate: 'clamp',
  });

  // スワイプ処理を設定
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
      },
      onPanResponderRelease: (_, gesture) => {
        if (gesture.dx > SWIPE_THRESHOLD) {
          forceSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD) {
          forceSwipe('left');
        } else {
          resetPosition();
        }
      },
    })
  ).current;

  // スワイプアニメーションを強制的に実行
  const forceSwipe = (direction: 'right' | 'left') => {
    const x = direction === 'right' ? SCREEN_WIDTH + 100 : -SCREEN_WIDTH - 100;
    Animated.timing(position, {
      toValue: { x, y: direction === 'right' ? 30 : -30 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: true,
    }).start(() => onSwipeComplete(direction));
  };

  // スワイプ完了時の処理
  const onSwipeComplete = (direction: 'right' | 'left') => {
    if (direction === 'right') {
      onSwipeRight();
    } else {
      onSwipeLeft();
    }
    position.setValue({ x: 0, y: 0 });
  };

  // カードの位置をリセット
  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  // 価格をフォーマット
  const formatPrice = (price: number): string => {
    return price.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' });
  };

  // カードのスタイルを定義
  const cardAnimStyle = {
    transform: [
      { translateX: position.x },
      { translateY: position.y },
      { rotate },
      { scale }
    ],
    opacity,
    zIndex: 100 - index,
  };

  return (
    <Animated.View
      style={[
        styles.container,
        cardAnimStyle,
        { padding: theme.spacing.s }
      ]}
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
          uri={product.imageUrl}
          style={styles.image}
          resizeMode="cover"
          showLoadingIndicator={true}
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
            {product.tags.slice(0, 3).map((tag, index) => (
              <View 
                key={index} 
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

export default SwipeCard;
