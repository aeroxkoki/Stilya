import React, { useRef, useState, useEffect } from 'react';
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
  
  // アニメーション値
  const position = useRef(new Animated.ValueXY()).current;
  const swipeIndicatorOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const cardScale = useRef(new Animated.Value(0.95)).current;
  const likeOpacity = useRef(new Animated.Value(0)).current;
  const nopeOpacity = useRef(new Animated.Value(0)).current;
  const cardOpacity = useRef(new Animated.Value(1)).current;
  
  // 状態管理
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  const [isSwiping, setIsSwiping] = useState(false);
  
  // 画像URL取得
  const imageUrl = getProductImageUrl(product);
  
  // カード登場アニメーション（スタック表示用）
  useEffect(() => {
    if (isTopCard) {
      // 最前面のカードは通常サイズ
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true
      }).start();
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true
      }).start();
    } else {
      // 背後のカードは少し小さくして薄く表示
      const scale = 1 - (cardIndex * 0.03); // カードごとに少しずつ小さく
      const opacity = 1 - (cardIndex * 0.3); // カードごとに薄く
      
      Animated.timing(cardScale, {
        toValue: Math.max(scale, 0.85),
        duration: 200,
        useNativeDriver: true
      }).start();
      
      Animated.timing(cardOpacity, {
        toValue: Math.max(opacity, 0.3),
        duration: 200,
        useNativeDriver: true
      }).start();
    }
  }, [isTopCard, cardIndex]);
  
  // スワイプ完了時のアニメーション
  const completeSwipe = (direction: 'left' | 'right') => {
    const x = direction === 'left' ? -width * 1.5 : width * 1.5;
    const rotation = direction === 'left' ? -ROTATION_ANGLE : ROTATION_ANGLE;
    
    // カードを画面外に飛ばす（戻ってこないようにする）
    Animated.parallel([
      Animated.timing(position, {
        toValue: { x, y: 100 },
        duration: SWIPE_OUT_DURATION,
        useNativeDriver: true
      }),
      Animated.timing(cardOpacity, {
        toValue: 0,
        duration: SWIPE_OUT_DURATION,
        useNativeDriver: true
      })
    ]).start(() => {
      // アニメーション完了後、コールバックを呼ぶ
      if (direction === 'left' && onSwipeLeft) {
        onSwipeLeft();
      } else if (direction === 'right' && onSwipeRight) {
        onSwipeRight();
      }
    });
  };
  
  // スワイプジェスチャー
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isTopCard && !isSwiping,
      onMoveShouldSetPanResponder: () => isTopCard && !isSwiping,
      onPanResponderGrant: () => {
        setIsSwiping(true);
        position.setOffset({
          x: position.x._value,
          y: position.y._value
        });
      },
      onPanResponderMove: (_, gesture) => {
        position.setValue({ x: gesture.dx, y: gesture.dy });
        
        // スワイプ方向の判定
        if (gesture.dx > 20) {
          setSwipeDirection('right');
          Animated.timing(likeOpacity, {
            toValue: Math.min(gesture.dx / 100, 1),
            duration: 0,
            useNativeDriver: true
          }).start();
          nopeOpacity.setValue(0);
        } else if (gesture.dx < -20) {
          setSwipeDirection('left');
          Animated.timing(nopeOpacity, {
            toValue: Math.min(Math.abs(gesture.dx) / 100, 1),
            duration: 0,
            useNativeDriver: true
          }).start();
          likeOpacity.setValue(0);
        } else {
          setSwipeDirection(null);
          likeOpacity.setValue(0);
          nopeOpacity.setValue(0);
        }
      },
      onPanResponderRelease: (_, gesture) => {
        position.flattenOffset();
        setIsSwiping(false);
        
        // スワイプ完了判定
        if (gesture.dx > SWIPE_THRESHOLD && onSwipeRight) {
          // 右スワイプ（いいね！）- ポジティブなフィードバック
          console.log('[SwipeCard] 右スワイプ検出 - バイブレーション開始');
          try {
            if (Platform.OS === 'ios') {
              // iOS: Haptic Engineを使用
              console.log('[SwipeCard] iOS - Haptic Engineを使用');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            } else {
              // Android: 最適化されたバイブレーションパターン
              // [wait, vibrate, wait, vibrate] - ダブルタップパターン
              console.log('[SwipeCard] Android - バイブレーションパターン: [0, 50, 30, 50]');
              Vibration.vibrate([0, 50, 30, 50]);
            }
          } catch (error) {
            console.error('[SwipeCard] バイブレーションエラー:', error);
          }
          completeSwipe('right');
        } else if (gesture.dx < -SWIPE_THRESHOLD && onSwipeLeft) {
          // 左スワイプ（スキップ）- 軽めのフィードバック
          console.log('[SwipeCard] 左スワイプ検出 - バイブレーション開始');
          try {
            if (Platform.OS === 'ios') {
              // iOS: Haptic Engineを使用
              console.log('[SwipeCard] iOS - Haptic Engineを使用（軽め）');
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            } else {
              // Android: シンプルな短い振動
              console.log('[SwipeCard] Android - バイブレーション: 30ms');
              Vibration.vibrate(30);
            }
          } catch (error) {
            console.error('[SwipeCard] バイブレーションエラー:', error);
          }
          completeSwipe('left');
        } else {
          // 元の位置に戻す（スワイプが不完全な場合のみ）
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: true,
            friction: 5
          }).start();
          setSwipeDirection(null);
          likeOpacity.setValue(0);
          nopeOpacity.setValue(0);
        }
      }
    })
  ).current;
  
  // ボタンアニメーション
  const animateButton = (callback?: () => void, isLikeAction?: boolean) => {
    // 保存ボタンの場合は中間のフィードバック
    if (callback === onSave) {
      console.log('[SwipeCard] 保存ボタン - バイブレーション開始');
      try {
        if (Platform.OS === 'ios') {
          console.log('[SwipeCard] iOS - Haptic Engine (Medium)');
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } else {
          console.log('[SwipeCard] Android - 中間振動 (40ms)');
          Vibration.vibrate(40); // 中間の長さ
        }
      } catch (error) {
        console.error('[SwipeCard] 保存ボタンバイブレーションエラー:', error);
      }
      
      Animated.sequence([
        Animated.timing(buttonScale, {
          toValue: 1.2,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.timing(buttonScale, {
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
    if (isLikeAction !== undefined) {
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
        Animated.timing(buttonScale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true
        }),
        Animated.timing(buttonScale, {
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
  const rotate = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-15deg', '0deg', '15deg'],
    extrapolate: 'clamp'
  });
  
  // カードのY軸の動きを制限
  const translateY = position.y.interpolate({
    inputRange: [-100, 0, 100],
    outputRange: [-30, 0, 30],
    extrapolate: 'clamp'
  });

  // カードのアニメーションスタイル
  const animatedCardStyle = {
    transform: [
      { translateX: position.x },
      { translateY: translateY },
      { rotate: rotate },
      { scale: cardScale }
    ],
    opacity: cardOpacity
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
          position: 'absolute',
          top: -stackOffset, // 背後のカードを少し下にずらす
        }
      ]} 
      {...(isTopCard ? panResponder.panHandlers : {})}
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
        onPress={() => onPress && onPress()}
        onLongPress={() => onLongPress && onLongPress()}
        disabled={!isTopCard || isSwiping}
        style={styles.touchableArea}
      >
        {/* 商品画像 */}
        <View style={styles.imageContainer}>
          <CachedImage
            source={{ uri: imageUrl }}
            style={styles.image}
            cachePolicy="memory-disk"
            placeholderType="shimmer"
            placeholderColor={theme.colors.border}
          />
          
          {/* グラデーションオーバーレイ */}
          <View style={[styles.gradientOverlay, { 
            backgroundColor: `${theme.colors.background}00`,
            backgroundImage: `linear-gradient(to bottom, transparent, ${theme.colors.background}CC)`
          }]} />
        </View>
        
        {/* スワイプインジケーター */}
        <Animated.View 
          style={[
            styles.likeIndicator,
            { opacity: likeOpacity }
          ]}
          pointerEvents="none"
        >
          <View style={[styles.indicatorBadge, { backgroundColor: theme.colors.success }]}>
            <Text style={styles.indicatorText}>LIKE</Text>
          </View>
        </Animated.View>
        
        <Animated.View 
          style={[
            styles.nopeIndicator,
            { opacity: nopeOpacity }
          ]}
          pointerEvents="none"
        >
          <View style={[styles.indicatorBadge, { backgroundColor: theme.colors.error }]}>
            <Text style={styles.indicatorText}>NOPE</Text>
          </View>
        </Animated.View>
        
        {/* 商品情報 */}
        <View style={[styles.infoContainer, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.infoHeader}>
            <View style={styles.infoMain}>
              <Text 
                style={[styles.title, { color: theme.colors.text.primary }]} 
                numberOfLines={2}
              >
                {product.title || '商品名なし'}
              </Text>
              <Text style={[styles.brand, { color: theme.colors.text.secondary }]} numberOfLines={1}>
                {product.brand || 'ブランド名なし'}
              </Text>
            </View>
            <View style={styles.priceContainer}>
              <Text style={[styles.price, { color: theme.colors.primary }]}>
                {formatPrice(product.price || 0)}
              </Text>
            </View>
          </View>
          
          {/* タグ */}
          {product.tags && product.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {product.tags.slice(0, 3).map((tag, index) => (
                <View 
                  key={index} 
                  style={[styles.tag, { backgroundColor: `${theme.colors.primary}10` }]}
                >
                  <Text style={[styles.tagText, { color: theme.colors.primary }]}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
      
      {/* アクションボタン（最前面のカードのみ表示） */}
      {isTopCard && (
        <View style={[styles.actionButtons, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity
            style={[styles.actionButton, styles.noButton, { backgroundColor: `${theme.colors.error}10` }]}
            onPress={() => animateButton(undefined, false)}
            activeOpacity={0.8}
          >
            <Ionicons name="close" size={32} color={theme.colors.error} />
          </TouchableOpacity>
          
          <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
            <TouchableOpacity
              style={[
                styles.actionButton, 
                styles.saveButton, 
                { 
                  backgroundColor: isSaved ? theme.colors.warning : `${theme.colors.warning}10`,
                  borderColor: theme.colors.warning,
                  borderWidth: isSaved ? 0 : 1
                }
              ]}
              onPress={() => animateButton(onSave)}
              activeOpacity={0.8}
            >
              <Ionicons 
                name={isSaved ? "star" : "star-outline"} 
                size={28} 
                color={isSaved ? '#FFFFFF' : theme.colors.warning} 
              />
            </TouchableOpacity>
          </Animated.View>
          
          <TouchableOpacity
            style={[styles.actionButton, styles.yesButton, { backgroundColor: `${theme.colors.success}10` }]}
            onPress={() => animateButton(undefined, true)}
            activeOpacity={0.8}
          >
            <Ionicons name="heart" size={32} color={theme.colors.success} />
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
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  shadowOverlay: {
    position: 'absolute',
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
  },
  touchableArea: {
    flex: 1,
  },
  imageContainer: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  infoContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  infoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  infoMain: {
    flex: 1,
    marginRight: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  brand: {
    fontSize: 14,
    marginBottom: 8,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  price: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 12,
  },
  likeIndicator: {
    position: 'absolute',
    top: 40,
    right: 20,
    transform: [{ rotate: '20deg' }],
  },
  nopeIndicator: {
    position: 'absolute',
    top: 40,
    left: 20,
    transform: [{ rotate: '-20deg' }],
  },
  indicatorBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  indicatorText: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
  actionButtons: {
    position: 'absolute',
    bottom: -70,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  actionButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 16,
  },
  noButton: {},
  saveButton: {},
  yesButton: {},
});

export default SwipeCardImproved;
