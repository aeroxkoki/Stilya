import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ActivityIndicator, 
  Text, 
  TouchableOpacity,
  Animated,
  PanResponder,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSwipe } from '@/hooks/useSwipe';
import { useFavorites } from '@/hooks/useFavorites';
import { Product } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useNetwork } from '@/contexts/NetworkContext';
import { useStyle } from '@/contexts/ThemeContext';
import StyledSwipeCard from './StyledSwipeCard';
import SwipeCardEnhanced from './SwipeCardEnhanced';
import SwipeCardImproved from './SwipeCardImproved';
import QuickViewModal from './QuickViewModal';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

interface StyledSwipeContainerProps {
  products: Product[];
  isLoading: boolean;
  onSwipe?: (product: Product, direction: 'left' | 'right') => void;
  onCardPress?: (product: Product) => void;
  onEmptyProducts?: () => void;
  onLoadMore?: () => Promise<void>;
  hasMoreProducts?: boolean;
  testID?: string;
  currentIndex?: number;
  useEnhancedCard?: boolean;
}

const StyledSwipeContainer: React.FC<StyledSwipeContainerProps> = ({
  products,
  isLoading,
  onSwipe,
  onCardPress,
  onEmptyProducts,
  onLoadMore,
  hasMoreProducts = false,
  testID,
  currentIndex: externalIndex,
  useEnhancedCard = true, // デフォルトで強化版カードを使用
}) => {
  const { user } = useAuth();
  const { isConnected } = useNetwork();
  const { theme, styleType } = useStyle();
  const [internalIndex, setInternalIndex] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const loadMoreThreshold = useRef(5); // あと5枚になったら追加読み込み
  
  // 外部のインデックスが提供されていればそれを使う、なければ内部の状態を使う
  const currentIndex = externalIndex !== undefined ? externalIndex : internalIndex;
  const currentProduct = products[currentIndex];

  // スワイプ方向を保持する状態
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);

  // アニメーション値
  const position = useRef(new Animated.ValueXY()).current;
  const swipeIndicatorOpacity = useRef(new Animated.Value(0)).current;
  
  // お気に入り機能のフックを使用
  const {
    favorites: savedItems,
    addToFavorites,
    removeFromFavorites,
    isFavorite
  } = useFavorites();

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

  // スワイプロジックを取得
  const { 
    handleSwipeLeft,
    handleSwipeRight,
  } = useSwipe({
    userId: user?.id,
    onSwipeComplete: (direction, product) => {
      if (onSwipe) {
        onSwipe(product, direction);
      }
      // 外部インデックスが提供されていない場合のみ、内部インデックスを更新
      if (externalIndex === undefined) {
        setInternalIndex(prevIndex => prevIndex + 1);
      }
      // ポジションをリセット
      position.setValue({ x: 0, y: 0 });
      swipeIndicatorOpacity.setValue(0);
      setSwipeDirection(null);
    },
  });

  // PanResponderの設定
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: () => {
        position.extractOffset();
      },
      onPanResponderMove: (_, gestureState) => {
        position.setValue({ x: gestureState.dx, y: gestureState.dy });
        
        // スワイプインジケーターのopacityを更新
        const opacity = Math.min(Math.abs(gestureState.dx) / SWIPE_THRESHOLD, 1);
        swipeIndicatorOpacity.setValue(opacity);
        
        // スワイプ方向の判定
        if (gestureState.dx > SWIPE_THRESHOLD) {
          setSwipeDirection('right');
        } else if (gestureState.dx < -SWIPE_THRESHOLD) {
          setSwipeDirection('left');
        } else {
          setSwipeDirection(null);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        position.flattenOffset();

        if (gestureState.dx > SWIPE_THRESHOLD && currentProduct) {
          // 右スワイプ（Yes）
          Animated.timing(position, {
            toValue: { x: width + 100, y: gestureState.dy },
            duration: 250,
            useNativeDriver: false,
          }).start(() => {
            handleSwipeRight(currentProduct);
          });
        } else if (gestureState.dx < -SWIPE_THRESHOLD && currentProduct) {
          // 左スワイプ（No）
          Animated.timing(position, {
            toValue: { x: -width - 100, y: gestureState.dy },
            duration: 250,
            useNativeDriver: false,
          }).start(() => {
            handleSwipeLeft(currentProduct);
          });
        } else {
          // 元の位置に戻す
          Animated.spring(position, {
            toValue: { x: 0, y: 0 },
            useNativeDriver: false,
          }).start();
          Animated.timing(swipeIndicatorOpacity, {
            toValue: 0,
            duration: 200,
            useNativeDriver: false,
          }).start();
        }
      },
    })
  ).current;

  // ボタンによるスワイプ操作ハンドラー
  const handleNoButtonPress = useCallback(() => {
    if (currentProduct) {
      Animated.timing(position, {
        toValue: { x: -width - 100, y: 0 },
        duration: 250,
        useNativeDriver: false,
      }).start(() => {
        handleSwipeLeft(currentProduct);
      });
    }
  }, [currentProduct, handleSwipeLeft, position]);

  const handleYesButtonPress = useCallback(() => {
    if (currentProduct) {
      Animated.timing(position, {
        toValue: { x: width + 100, y: 0 },
        duration: 250,
        useNativeDriver: false,
      }).start(() => {
        handleSwipeRight(currentProduct);
      });
    }
  }, [currentProduct, handleSwipeRight, position]);

  // 商品カードのタップイベント
  const handleCardPress = useCallback(() => {
    console.log('[StyledSwipeContainer] handleCardPress called');
    console.log('[StyledSwipeContainer] Current product:', currentProduct?.title, 'ID:', currentProduct?.id);
    if (currentProduct && onCardPress) {
      console.log('[StyledSwipeContainer] Calling onCardPress with product');
      onCardPress(currentProduct);
    } else {
      console.log('[StyledSwipeContainer] Missing product or onCardPress callback');
    }
  }, [currentProduct, onCardPress]);

  // 商品カードの長押しイベント
  const handleCardLongPress = useCallback(() => {
    if (currentProduct) {
      setQuickViewProduct(currentProduct);
      setShowQuickView(true);
    }
  }, [currentProduct]);
  
  // 保存ボタンのハンドラー
  const handleSaveButtonPress = useCallback(async () => {
    if (!currentProduct) return;
    
    try {
      if (isFavorite(currentProduct.id)) {
        await removeFromFavorites(currentProduct.id);
      } else {
        await addToFavorites(currentProduct.id);
      }
    } catch (error) {
      console.error('[StyledSwipeContainer] 保存処理エラー:', error);
    }
  }, [currentProduct, isFavorite, addToFavorites, removeFromFavorites]);

  // クイックビューから詳細画面への遷移
  const handleQuickViewDetail = useCallback(() => {
    if (quickViewProduct && onCardPress) {
      onCardPress(quickViewProduct);
    }
  }, [quickViewProduct, onCardPress]);

  // クイックビューからのスワイプ処理
  const handleQuickViewSwipeLeft = useCallback(() => {
    if (quickViewProduct) {
      handleSwipeLeft(quickViewProduct);
    }
  }, [quickViewProduct, handleSwipeLeft]);

  const handleQuickViewSwipeRight = useCallback(() => {
    if (quickViewProduct) {
      handleSwipeRight(quickViewProduct);
    }
  }, [quickViewProduct, handleSwipeRight]);

  // ローディング中の表示
  if (isLoading && products.length === 0) {
    return (
      <View 
        style={[
          styles.centerContainer, 
          { backgroundColor: theme.colors.background }
        ]} 
        testID="loading-container"
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text 
          style={[
            styles.loadingText,
            { color: theme.colors.text.secondary }
          ]}
        >
          商品を読み込んでいます...
        </Text>
      </View>
    );
  }

  // 全ての商品をスワイプし終わった場合 または オフライン時でデータがない場合
  if ((products.length === 0 || currentIndex >= products.length)) {
    return (
      <View 
        style={[
          styles.centerContainer,
          { backgroundColor: theme.colors.background }
        ]} 
        testID="empty-container"
      >
        <Ionicons name="cart-outline" size={64} color={theme.colors.text.hint} />
        <Text 
          style={[
            styles.emptyText,
            { color: theme.colors.text.secondary }
          ]}
        >
          表示できる商品がありません
        </Text>
        {isConnected === false && (
          <View 
            style={[
              styles.offlineContainer,
              { backgroundColor: `${theme.colors.error}10` }
            ]} 
            testID="offline-state-notice"
          >
            <Ionicons name="cloud-offline-outline" size={24} color={theme.colors.error} />
            <Text 
              style={[
                styles.offlineText,
                { color: theme.colors.error }
              ]}
            >
              オフラインモードです
            </Text>
            <Text 
              style={[
                styles.offlineSubText,
                { color: theme.colors.text.secondary }
              ]}
            >
              インターネット接続時に商品が更新されます
            </Text>
          </View>
        )}
      </View>
    );
  }

  // カードの回転角度を計算
  const rotate = position.x.interpolate({
    inputRange: [-width / 2, 0, width / 2],
    outputRange: ['-10deg', '0deg', '10deg'],
    extrapolate: 'clamp',
  });

  // カードのアニメーションスタイル
  const animatedCardStyle = {
    transform: [
      { translateX: position.x },
      { translateY: position.y },
      { rotate: rotate },
    ],
  };

  return (
    <View 
      style={[
        styles.container,
        { backgroundColor: theme.colors.background }
      ]} 
      testID={testID || 'swipe-container'}
    >
      {/* オフライン通知 */}
      {isConnected === false && (
        <View 
          style={[
            styles.offlineBanner,
            { backgroundColor: theme.colors.error }
          ]} 
          testID="offline-banner"
        >
          <Ionicons name="cloud-offline-outline" size={18} color="#FFFFFF" />
          <Text style={styles.offlineBannerText}>オフラインモード</Text>
        </View>
      )}
      
      {/* カードスタック */}
      <View style={styles.cardStackContainer}>
        {/* 進捗インジケーター - 残り商品数を控えめに表示 */}
        {products.length > 0 && currentIndex < products.length && (
          <View style={[styles.progressContainer, { backgroundColor: theme.colors.background }]}>
            <Text style={[styles.progressText, { color: theme.colors.text.hint }]}>
              {currentIndex + 1} / {products.length}
            </Text>
            {hasMoreProducts && (
              <Text style={[styles.progressSubText, { color: theme.colors.text.hint }]}>
                +まだまだあります
              </Text>
            )}
          </View>
        )}
        
        {/* 前面カード（現在のカード） */}
        {currentProduct && (
          useEnhancedCard ? (
            <SwipeCardImproved
              product={currentProduct}
              onPress={handleCardPress}
              onLongPress={handleCardLongPress}
              onSwipeLeft={isConnected === false ? undefined : () => handleSwipeLeft(currentProduct)}
              onSwipeRight={isConnected === false ? undefined : () => handleSwipeRight(currentProduct)}
              onSave={handleSaveButtonPress}
              isSaved={savedItems.includes(currentProduct.id)}
              testID="current-swipe-card"
              isTopCard={true}
            />
          ) : (
            <Animated.View
              style={[styles.cardContainer, animatedCardStyle]}
              {...panResponder.panHandlers}
            >
              <StyledSwipeCard
                product={currentProduct}
                onPress={handleCardPress}
                onLongPress={handleCardLongPress}
                onSwipeLeft={isConnected === false ? undefined : handleNoButtonPress}
                onSwipeRight={isConnected === false ? undefined : handleYesButtonPress}
                testID="current-swipe-card"
              />
              
              {/* スワイプインジケーター (従来のカードのみ表示) */}
              <Animated.View
                style={[
                  styles.swipeIndicator,
                  styles.yesIndicator,
                  { 
                    opacity: position.x.interpolate({
                      inputRange: [0, SWIPE_THRESHOLD],
                      outputRange: [0, 1],
                      extrapolate: 'clamp',
                    }),
                    backgroundColor: theme.colors.success
                  }
                ]}
              >
                <Text style={styles.indicatorText}>YES</Text>
              </Animated.View>
              
              <Animated.View
                style={[
                  styles.swipeIndicator,
                  styles.noIndicator,
                  { 
                    opacity: position.x.interpolate({
                      inputRange: [-SWIPE_THRESHOLD, 0],
                      outputRange: [1, 0],
                      extrapolate: 'clamp',
                    }),
                    backgroundColor: theme.colors.error
                  }
                ]}
              >
                <Text style={styles.indicatorText}>NO</Text>
              </Animated.View>
            </Animated.View>
          )
        )}
      </View>
      
      {/* クイックビューモーダル */}
      <QuickViewModal
        visible={showQuickView}
        product={quickViewProduct}
        onClose={() => setShowQuickView(false)}
        onViewDetails={handleQuickViewDetail}
        onSwipeLeft={handleQuickViewSwipeLeft}
        onSwipeRight={handleQuickViewSwipeRight}
      />
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
  },
  emptyText: {
    fontSize: 18,
    textAlign: 'center',
    marginVertical: 12,
  },
  cardContainer: {
    width: '90%',
    height: '70%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  offlineBanner: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
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
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    width: '90%',
  },
  offlineText: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  offlineSubText: {
    fontSize: 14,
    textAlign: 'center',
    marginTop: 4,
  },
  swipeIndicator: {
    position: 'absolute',
    padding: 10,
    borderRadius: 4,
  },
  yesIndicator: {
    top: 20,
    right: 20,
  },
  noIndicator: {
    top: 20,
    left: 20,
  },
  indicatorText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 24,
  },
  cardStackContainer: {
    width: '100%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundCard: {
    position: 'absolute',
    opacity: 0.5,
  },
  progressContainer: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 1,
  },
  progressText: {
    fontSize: 14,
    fontWeight: '500',
  },
  progressSubText: {
    fontSize: 12,
    marginTop: 2,
  },
});

export default StyledSwipeContainer;
