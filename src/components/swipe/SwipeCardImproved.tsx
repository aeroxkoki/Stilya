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
}

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.92;
const CARD_HEIGHT = height * 0.58;
const SWIPE_THRESHOLD = width * 0.25; // スワイプ判定のしきい値
const SWIPE_OUT_DURATION = 200;

const SwipeCardImproved: React.FC<SwipeCardImprovedProps> = ({ 
  product, 
  onSwipeLeft,
  onSwipeRight,
  onPress,
  onLongPress,
  onSave,
  isSaved = false,
  testID,
  isTopCard = false
}) => {
  const { theme } = useStyle();
  
  // アニメーション値
  const position = useRef(new Animated.ValueXY()).current;
  const swipeIndicatorOpacity = useRef(new Animated.Value(0)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const cardScale = useRef(new Animated.Value(0.95)).current;
  const likeOpacity = useRef(new Animated.Value(0)).current;
  const nopeOpacity = useRef(new Animated.Value(0)).current;
  
  // 状態管理
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  
  // 画像URL取得
  const imageUrl = getProductImageUrl(product);
  
  // カード登場アニメーション
  useEffect(() => {
    if (isTopCard) {
      Animated.spring(cardScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true
      }).start();
    }
  }, [isTopCard]);
  
  // スワイプジェスチャー
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isTopCard,
      onMoveShouldSetPanResponder: () => isTopCard,
      onPanResponderGrant: () => {
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
          Animated.timing(position, {
            toValue: { x: width, y: gesture.dy },
            duration: SWIPE_OUT_DURATION,
            useNativeDriver: true
          }).start(() => {
            onSwipeRight();
            resetPosition();
          });
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
          Animated.timing(position, {
            toValue: { x: -width, y: gesture.dy },
            duration: SWIPE_OUT_DURATION,
            useNativeDriver: true
          }).start(() => {
            onSwipeLeft();
            resetPosition();
          });
        } else {
          // 元の位置に戻す
          resetPosition();
        }
      }
    })
  ).current;
  
  // ポジションをリセット
  const resetPosition = () => {
    Animated.spring(position, {
      toValue: { x: 0, y: 0 },
      useNativeDriver: true
    }).start();
    setSwipeDirection(null);
    likeOpacity.setValue(0);
    nopeOpacity.setValue(0);
  };
  
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
        console.error('[SwipeCard] 保存ボタンのバイブレーションエラー:', error);
      }
    }
    
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.9,
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
  };
  
  // プログラム的なスワイプ
  const handleProgrammaticSwipe = (direction: 'left' | 'right') => {
    const toValue = direction === 'right' ? width : -width;
    const callback = direction === 'right' ? onSwipeRight : onSwipeLeft;
    
    // バイブレーションフィードバック
    console.log(`[SwipeCard] プログラム的${direction === 'right' ? '右' : '左'}スワイプ - バイブレーション開始`);
    try {
      if (direction === 'right') {
        // いいね！ボタン - ポジティブなフィードバック
        if (Platform.OS === 'ios') {
          console.log('[SwipeCard] iOS - Haptic Engine (Heavy)');
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
        } else {
          console.log('[SwipeCard] Android - ダブルタップパターン');
          Vibration.vibrate([0, 50, 30, 50]); // ダブルタップパターン
        }
      } else {
        // スキップボタン - 軽めのフィードバック
        if (Platform.OS === 'ios') {
          console.log('[SwipeCard] iOS - Haptic Engine (Light)');
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        } else {
          console.log('[SwipeCard] Android - 短い振動 (30ms)');
          Vibration.vibrate(30);
        }
      }
    } catch (error) {
      console.error('[SwipeCard] プログラム的スワイプのバイブレーションエラー:', error);
    }
    
    // インジケーター表示
    const opacity = direction === 'right' ? likeOpacity : nopeOpacity;
    Animated.timing(opacity, {
      toValue: 1,
      duration: 200,
      useNativeDriver: true
    }).start();
    
    // カードをスワイプアウト
    Animated.timing(position, {
      toValue: { x: toValue, y: 0 },
      duration: SWIPE_OUT_DURATION,
      useNativeDriver: true
    }).start(() => {
      if (callback) callback();
      resetPosition();
    });
  };
  
  // カードの回転角度
  const rotate = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp'
  });
  
  const animatedCardStyle = {
    transform: [
      { translateX: position.x },
      { translateY: position.y },
      { rotate },
      { scale: cardScale }
    ]
  };

  return (
    <Animated.View 
      style={[styles.container, animatedCardStyle]}
      {...(isTopCard ? panResponder.panHandlers : {})}
      testID={testID || 'swipe-card-improved'}
    >
      <TouchableOpacity
        style={styles.cardContent}
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={400}
        activeOpacity={0.95}
        disabled={!isTopCard}
      >
        {/* 商品画像 */}
        <View style={styles.imageContainer}>
          <CachedImage
            source={{ uri: imageUrl }}
            style={styles.image}
            contentFit="cover"
            testID="product-image"
            showLoadingIndicator={true}
          />
          
          {/* 中古品ラベル */}
          {product.isUsed && (
            <View style={styles.usedLabel}>
              <Text style={styles.usedLabelText}>USED</Text>
            </View>
          )}
          
          {/* Like/Nopeインジケーター */}
          <Animated.View 
            style={[
              styles.likeIndicator,
              { opacity: likeOpacity }
            ]}
          >
            <Text style={styles.likeText}>LIKE</Text>
          </Animated.View>
          
          <Animated.View 
            style={[
              styles.nopeIndicator,
              { opacity: nopeOpacity }
            ]}
          >
            <Text style={styles.nopeText}>NOPE</Text>
          </Animated.View>
        </View>
        
        {/* 商品情報 */}
        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <View style={styles.productDetails}>
              <Text style={styles.productTitle} numberOfLines={2}>
                {product.title}
              </Text>
              {product.brand && (
                <Text style={styles.productBrand} numberOfLines={1}>
                  {product.brand}
                </Text>
              )}
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.productPrice}>
                {formatPrice(product.price)}
              </Text>
            </View>
          </View>
          
          {/* タグ */}
          {product.tags && product.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {product.tags.slice(0, 3).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
      
      {/* アクションボタン（カードの外側） */}
      {isTopCard && (
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.noButton]}
            onPress={() => {
              animateButton(() => handleProgrammaticSwipe('left'));
            }}
            testID="swipe-left-button"
          >
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <Ionicons name="close" size={36} color="#EF4444" />
            </Animated.View>
            <Text style={styles.buttonText}>スキップ</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.saveButton]}
            onPress={() => {
              animateButton(onSave);
            }}
            testID="save-button"
          >
            <Ionicons 
              name={isSaved ? "bookmark" : "bookmark-outline"} 
              size={32} 
              color={isSaved ? "#10B981" : "#6B7280"} 
            />
            <Text style={[styles.buttonText, { color: isSaved ? "#10B981" : "#6B7280" }]}>
              保存
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.yesButton]}
            onPress={() => {
              animateButton(() => handleProgrammaticSwipe('right'));
            }}
            testID="swipe-right-button"
          >
            <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
              <Ionicons name="heart" size={36} color="#3B82F6" />
            </Animated.View>
            <Text style={styles.buttonText}>いいね！</Text>
          </TouchableOpacity>
        </View>
      )}
      
      {/* スワイプヒント（初回のみ） */}
      {isTopCard && (
        <View style={styles.swipeHint}>
          <Ionicons name="swap-horizontal" size={20} color="#9CA3AF" />
          <Text style={styles.swipeHintText}>左右にスワイプもできます</Text>
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT + 100, // ボタン分の高さを追加
    position: 'absolute',
  },
  cardContent: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    backgroundColor: 'white',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    overflow: 'hidden',
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  usedLabel: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  usedLabelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  likeIndicator: {
    position: 'absolute',
    top: 50,
    left: 20,
    padding: 10,
    borderWidth: 4,
    borderColor: '#10B981',
    borderRadius: 8,
    transform: [{ rotate: '-30deg' }],
  },
  likeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#10B981',
  },
  nopeIndicator: {
    position: 'absolute',
    top: 50,
    right: 20,
    padding: 10,
    borderWidth: 4,
    borderColor: '#EF4444',
    borderRadius: 8,
    transform: [{ rotate: '30deg' }],
  },
  nopeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#EF4444',
  },
  productInfo: {
    backgroundColor: 'white',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productDetails: {
    flex: 1,
    marginRight: 16,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 14,
    color: '#6B7280',
  },
  priceContainer: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  productPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  tagsContainer: {
    flexDirection: 'row',
    marginTop: 12,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginRight: 6,
    marginBottom: 4,
  },
  tagText: {
    color: '#4B5563',
    fontSize: 12,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    marginTop: 16,
  },
  actionButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noButton: {
    backgroundColor: '#FEE2E2',
  },
  yesButton: {
    backgroundColor: '#DBEAFE',
  },
  saveButton: {
    backgroundColor: '#F3F4F6',
  },
  buttonText: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
  },
  swipeHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    opacity: 0.6,
  },
  swipeHintText: {
    marginLeft: 6,
    fontSize: 12,
    color: '#9CA3AF',
  },
});

export default SwipeCardImproved;