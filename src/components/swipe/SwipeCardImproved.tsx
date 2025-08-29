import React, { useRef, useState, useEffect, useMemo } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  Animated,
  PanResponder,
  Vibration,
  Platform
} from 'react-native';
import * as Haptics from 'expo-haptics';
import CachedImage from '@/components/common/CachedImage';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '@/types';
import { formatPrice } from '@/utils';
import { useStyle } from '@/contexts/ThemeContext';
import { getProductImageUrl } from '@/utils/imageUtils';

interface SwipeCardImprovedProps {
  product: Product;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onPress?: () => void;
  onLongPress?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
  testID?: string;
  isTopCard?: boolean; // 最前面のカードかどうか
  cardIndex?: number; // カードのインデックス（スタック表示用）
  totalCards?: number; // 合計カード数
}

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.92;
const CARD_HEIGHT = height * 0.58;
const SWIPE_THRESHOLD = width * 0.25; // スワイプ判定のしきい値
const SWIPE_OUT_DURATION = 250; // スワイプアウトの速度を少し遅めに
const ROTATION_ANGLE = 30; // 回転角度

const SwipeCardImproved: React.FC<SwipeCardImprovedProps> = ({ 
  product, 
  onSwipeLeft,
  onSwipeRight,
  onPress,
  onLongPress,
  onSave,
  isSaved = false,
  testID,
  isTopCard = false,
  cardIndex = 0,
  totalCards = 1
}) => {
  const { theme } = useStyle();
  
  // アニメーション値（useRefの代わりにuseStateでリセット可能にする）
  const [animValues] = useState(() => ({
    position: new Animated.ValueXY(),
    swipeIndicatorOpacity: new Animated.Value(0),
    buttonScale: new Animated.Value(1),
    cardScale: new Animated.Value(0.95),
    likeOpacity: new Animated.Value(0),
    nopeOpacity: new Animated.Value(0),
    cardOpacity: new Animated.Value(1)
  }));
  
  // 状態管理
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  // 画像URL取得
  const imageUrl = getProductImageUrl(product);
  
  // デバッグ用ログ
  useEffect(() => {
    if (__DEV__) {
      console.log('[SwipeCardImproved] Product data:', {
        id: product?.id,
        title: product?.title,
        imageUrl: imageUrl,
        hasImageUrl: !!imageUrl,
        productData: product
      });
    }
  }, [product]);
  
  // カード登場アニメーション（スタック表示用）
  useEffect(() => {
    if (isTopCard) {
      // 最前面のカードは通常サイズ
      Animated.spring(animValues.cardScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true
      }).start();
      Animated.timing(animValues.cardOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      }).start();
    } else {
      // 背後のカードは少し小さくして薄く表示
      const scale = 1 - (cardIndex * 0.03); // カードごとに少しずつ小さく
      const opacity = 1 - (cardIndex * 0.3); // カードごとに薄く
      
      Animated.timing(animValues.cardScale, {
        toValue: Math.max(scale, 0.85),
        duration: 200,
        useNativeDriver: true
      }).start();
      
      Animated.timing(animValues.cardOpacity, {
        toValue: Math.max(opacity, 0.3),
        duration: 200,
        useNativeDriver: true
      }).start();
    }
  }, [isTopCard, cardIndex]);
  
  // productが変更されたらアニメーション値をリセット
  useEffect(() => {
    animValues.position.setValue({ x: 0, y: 0 });
    animValues.likeOpacity.setValue(0);
    animValues.nopeOpacity.setValue(0);
    setSwipeDirection(null);
    setIsSwiping(false);
    setIsAnimating(false);
  }, [product.id]);
  
  // スワイプ完了時のアニメーション
  const completeSwipe = (direction: 'left' | 'right') => {
    if (isAnimating) return; // アニメーション中は無視
    setIsAnimating(true);
    
    const x = direction === 'left' ? -width * 1.5 : width * 1.5;
    const rotation = direction === 'left' ? -ROTATION_ANGLE : ROTATION_ANGLE;
    
    // カードを画面外に飛ばす
    Animated.parallel([
      Animated.timing(animValues.position, {
        toValue: { x, y: 100 },
        duration: SWIPE_OUT_DURATION,
        useNativeDriver: true
      }),
      Animated.timing(animValues.cardOpacity, {
        toValue: 0,
        duration: SWIPE_OUT_DURATION,
        useNativeDriver: true
      })
    ]).start(() => {
      // アニメーション完了後、即座にコールバックを呼ぶ
      // （状態のリセットはコールバック後にコンポーネントが再レンダリングされるため不要）
      if (direction === 'left' && onSwipeLeft) {
        onSwipeLeft();
      } else if (direction === 'right' && onSwipeRight) {
        onSwipeRight();
      }
    });
  };
  
  // スワイプジェスチャー
  const panResponder = useMemo(() => 
    PanResponder.create({
      onStartShouldSetPanResponder: () => isTopCard && !isSwiping && !isAnimating,
      onMoveShouldSetPanResponder: (_, gesture) => {
        return isTopCard && !isSwiping && !isAnimating && 
               (Math.abs(gesture.dx) > 5 || Math.abs(gesture.dy) > 5);
      },
      onPanResponderGrant: () => {
        setIsSwiping(true);
        animValues.position.setOffset({
          x: (animValues.position.x as any)._value || 0,
          y: (animValues.position.y as any)._value || 0
        });
        animValues.position.setValue({ x: 0, y: 0 });
      },
      onPanResponderMove: (_, gesture) => {
        animValues.position.setValue({ x: gesture.dx, y: gesture.dy });
        
        // スワイプ方向の判定
        if (gesture.dx > 20) {
          setSwipeDirection('right');
          const opacity = Math.min(gesture.dx / 100, 1);
          animValues.likeOpacity.setValue(opacity);
          animValues.nopeOpacity.setValue(0);
        } else if (gesture.dx < -20) {
          setSwipeDirection('left');
          const opacity = Math.min(Math.abs(gesture.dx) / 100, 1);
          animValues.nopeOpacity.setValue(opacity);
          animValues.likeOpacity.setValue(0);
        } else {
          setSwipeDirection(null);
          animValues.likeOpacity.setValue(0);
          animValues.nopeOpacity.setValue(0);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        animValues.position.flattenOffset();
        
        // スワイプ完了判定
        if (gesture.dx > SWIPE_THRESHOLD && onSwipeRight && !isAnimating) {
          // 右スワイプ（いいね！）
          try {
            if (Platform.OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            } else {
              Vibration.vibrate([0, 50, 30, 50]);
            }
          } catch (error) {
            console.error('[SwipeCard] バイブレーションエラー:', error);
          }
          completeSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD && onSwipeLeft && !isAnimating) {
          // 左スワイプ（スキップ）
          try {
            if (Platform.OS === 'ios') {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } else {
              Vibration.vibrate(30);
            }
          } catch (error) {
            console.error('[SwipeCard] バイブレーションエラー:', error);
          }
          completeSwipe('left');
        } else {
          // 元の位置に戻す
          setIsSwiping(false);
          Animated.spring(animValues.position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
            friction: 5
          }).start();
          setSwipeDirection(null);
          animValues.likeOpacity.setValue(0);
          animValues.nopeOpacity.setValue(0);
        }
      },
      onPanResponderTerminate: () => {
        // ジェスチャーが中断された場合、元の位置に戻す
        setIsSwiping(false);
        animValues.position.flattenOffset();
        Animated.spring(animValues.position, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: true,
          friction: 5
        }).start();
        setSwipeDirection(null);
        animValues.likeOpacity.setValue(0);
        animValues.nopeOpacity.setValue(0);
      }
    }), [isTopCard, isSwiping, isAnimating, onSwipeLeft, onSwipeRight]
  );
  
  // ボタンアニメーション
  const animateButton = (callback?: () => void, isLikeAction?: boolean) => {
    // 保存ボタンの場合は中間のフィードバック
    if (callback === onSave) {
      try {
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
          Vibration.vibrate(40);
        }
      } catch (error) {
        console.error('[SwipeCard] 保存ボタンバイブレーションエラー:', error);
      }
      
      Animated.sequence([
        Animated.timing(animValues.buttonScale, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.timing(animValues.buttonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true
        })
      ]).start(() => {
        if (callback) callback();
      });
      
      return;
    }
    
    // スワイプボタンはカードごと飛ばす
    if (isLikeAction !== undefined && !isAnimating) {
      completeSwipe(isLikeAction ? 'right' : 'left');
      
      // バイブレーション
      try {
        if (Platform.OS === 'ios') {
          Haptics.impactAsync(isLikeAction ? Haptics.ImpactFeedbackStyle.Heavy : Haptics.ImpactFeedbackStyle.Light);
        } else {
          Vibration.vibrate(isLikeAction ? [0, 50, 30, 50] : 30);
        }
      } catch (error) {
        console.error('[SwipeCard] ボタンバイブレーションエラー:', error);
      }
    } else if (callback) {
      // その他のボタン（詳細ボタンなど）
      Animated.sequence([
        Animated.timing(animValues.buttonScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.timing(animValues.buttonScale, {
          toValue: 1,
          duration: 100,
          useNativeDriver: true
        })
      ]).start(() => {
        callback();
      });
    }
  };
  
  // カードの回転角度を計算
  const rotate = animValues.position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-15deg', '0deg', '15deg'],
    extrapolate: 'clamp'
  });
  
  // カードのY軸の動きを制限
  const translateY = animValues.position.y.interpolate({
    inputRange: [-100, 0, 100],
    outputRange: [-30, 0, 30],
    extrapolate: 'clamp'
  });

  // カードのアニメーションスタイル
  const animatedCardStyle = {
    transform: [
      { translateX: animValues.position.x },
      { translateY: translateY },
      { rotate: rotate },
      { scale: animValues.cardScale }
    ],
    opacity: animValues.cardOpacity
  };

  // スタック表示用のオフセット
  const stackOffset = cardIndex * 10; // 各カードを10pxずつずらす
  
  return (
    <Animated.View 
      style={[
        styles.container, 
        animatedCardStyle,
        { 
          backgroundColor: theme.colors.surface,
          zIndex: totalCards - cardIndex, // 前面のカードほど高いz-index
          elevation: totalCards - cardIndex, // Android用
          // positionはSwipeCardImprovedでは設定しない（親のViewで制御）
          marginTop: -stackOffset, // 背後のカードを少し下にずらす
        }
      ]} 
      {...(isTopCard && !isAnimating ? panResponder.panHandlers : {})}
      testID={testID}
    >
      {/* カード影 */}
      <View style={[
        styles.shadowOverlay, 
        { 
          backgroundColor: theme.colors.primary,
          opacity: 0.05,
          transform: [{ translateY: 4 }]
        }
      ]} />
      
      {/* カード本体 */}
      <TouchableOpacity 
        activeOpacity={0.95}
        onPress={onPress}
        onLongPress={onLongPress}
        disabled={!isTopCard || isSwiping || isAnimating}
        style={styles.cardContent}
      >
        {/* 商品画像 */}
        <View style={styles.imageContainer}>
          <CachedImage
            source={{ uri: imageUrl }}
            style={styles.productImage}
            contentFit="cover"
            showLoadingIndicator={true}
            debugMode={__DEV__}
            productTitle={product.title}
            testID="product-image"
          />
          
          {/* スワイプインジケーター */}
          <Animated.View 
            style={[
              styles.swipeIndicator,
              styles.likeIndicator,
              { 
                backgroundColor: theme.colors.success,
                opacity: animValues.likeOpacity,
                transform: [{ scale: animValues.likeOpacity }]
              }
            ]}
          >
            <Text style={styles.indicatorText}>LIKE</Text>
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.swipeIndicator,
              styles.nopeIndicator,
              { 
                backgroundColor: theme.colors.error,
                opacity: animValues.nopeOpacity,
                transform: [{ scale: animValues.nopeOpacity }]
              }
            ]}
          >
            <Text style={styles.indicatorText}>NOPE</Text>
          </Animated.View>
        </View>
        
        {/* 商品情報 */}
        <View style={[styles.infoContainer, { backgroundColor: theme.colors.background }]}>
          <View style={styles.infoContent}>
            <View style={styles.textContainer}>
              <Text 
                style={[styles.productTitle, { color: theme.colors.text.primary }]} 
                numberOfLines={2}
                testID="product-title"
              >
                {product.title}
              </Text>
              
              <Text 
                style={[styles.brandName, { color: theme.colors.text.secondary }]} 
                numberOfLines={1}
              >
                {product.brand || 'ブランド未設定'}
              </Text>
              
              <View style={styles.priceRow}>
                <Text 
                  style={[styles.price, { color: theme.colors.primary }]}
                  testID="product-price"
                >
                  {formatPrice(product.price)}
                </Text>
              </View>
              
              {/* タグ */}
              {product.tags && product.tags.length > 0 && (
                <View style={styles.tagsContainer}>
                  {product.tags.slice(0, 3).map((tag, index) => (
                    <View 
                      key={`${tag}-${index}`} 
                      style={[
                        styles.tag, 
                        { backgroundColor: `${theme.colors.primary}15` }
                      ]}
                    >
                      <Text 
                        style={[styles.tagText, { color: theme.colors.primary }]}
                        numberOfLines={1}
                      >
                        #{tag}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
      
      {/* アクションボタン - 最前面のカードのみ表示 */}
      {isTopCard && !isAnimating && (
        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity 
            style={[
              styles.actionButton,
              styles.noButton,
              { backgroundColor: theme.colors.surface }
            ]}
            onPress={() => animateButton(undefined, false)}
            disabled={isSwiping || isAnimating}
            testID="no-button"
          >
            <Ionicons name="close" size={32} color={theme.colors.error} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.actionButton,
              styles.saveButton,
              { 
                backgroundColor: theme.colors.surface,
                borderColor: isSaved ? theme.colors.primary : theme.colors.border
              }
            ]}
            onPress={() => animateButton(onSave)}
            disabled={isSwiping || isAnimating}
            testID="save-button"
          >
            <Animated.View style={{ transform: [{ scale: animValues.buttonScale }] }}>
              <Ionicons 
                name={isSaved ? "bookmark" : "bookmark-outline"} 
                size={24} 
                color={isSaved ? theme.colors.primary : theme.colors.text.secondary} 
              />
            </Animated.View>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.actionButton,
              styles.yesButton,
              { backgroundColor: theme.colors.surface }
            ]}
            onPress={() => animateButton(undefined, true)}
            disabled={isSwiping || isAnimating}
            testID="yes-button"
          >
            <Ionicons name="heart" size={32} color={theme.colors.primary} />
          </TouchableOpacity>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  shadowOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 16,
  },
  cardContent: {
    flex: 1,
  },
  imageContainer: {
    flex: 1,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  swipeIndicator: {
    position: 'absolute',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 3,
    borderColor: '#FFF',
  },
  likeIndicator: {
    top: 50,
    right: 20,
    transform: [{ rotate: '15deg' }],
  },
  nopeIndicator: {
    top: 50,
    left: 20,
    transform: [{ rotate: '-15deg' }],
  },
  indicatorText: {
    color: '#FFF',
    fontSize: 28,
    fontWeight: '900',
  },
  infoContainer: {
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    paddingVertical: 12,
  },
  infoContent: {
    paddingHorizontal: 16,
  },
  textContainer: {
    flex: 1,
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  brandName: {
    fontSize: 14,
    marginBottom: 8,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
    letterSpacing: -0.5,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: -70,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingHorizontal: 20,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noButton: {
    borderColor: '#FF6B6B20',
  },
  saveButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  yesButton: {
    borderColor: '#4ECDC420',
  },
});

export default SwipeCardImproved;