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
import { useSwipe } from '../../hooks/useSwipe';
import { Product } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { useNetwork } from '../../contexts/NetworkContext';
import SwipeCard from './SwipeCard';
import QuickViewModal from './QuickViewModal';
import { savedItemsService } from '../../services/savedItemsService';
import Toast from 'react-native-toast-message';

const { width } = Dimensions.get('window');
const SWIPE_THRESHOLD = 120;

interface SwipeContainerProps {
  products: Product[];
  isLoading: boolean;
  onSwipe?: (product: Product, direction: 'left' | 'right') => void;
  onCardPress?: (product: Product) => void;
  onEmptyProducts?: () => void;
  onLoadMore?: () => Promise<void>;
  hasMoreProducts?: boolean;
  testID?: string;
  currentIndex?: number; // 外部から現在のインデックスを受け取る
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
  currentIndex: externalIndex, // 外部から渡されたインデックス
}) => {
  const { user } = useAuth();
  const { isConnected } = useNetwork();
  const [internalIndex, setInternalIndex] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [savedProductIds, setSavedProductIds] = useState<Set<string>>(new Set());
  const loadMoreThreshold = useRef(5); // あと5枚になったら追加読み込み
  
  // 外部のインデックスが提供されていればそれを使う、なければ内部の状態を使う
  const currentIndex = externalIndex !== undefined ? externalIndex : internalIndex;
  const currentProduct = products[currentIndex];

  // アニメーション値
  const position = useRef(new Animated.ValueXY()).current;
  const swipeIndicatorOpacity = useRef(new Animated.Value(0)).current;

  // 保存済みアイテムを初期ロード
  useEffect(() => {
    const loadSavedItems = async () => {
      if (user?.id) {
        try {
          const savedItems = await savedItemsService.getSavedItems(user.id);
          const savedIds = savedItems.map(item => item.product_id);
          setSavedProductIds(new Set(savedIds));
        } catch (error) {
          console.error('[SwipeContainer] Failed to load saved items:', error);
        }
      }
    };

    loadSavedItems();
  }, [user?.id]);

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
    if (currentProduct && onCardPress) {
      onCardPress(currentProduct);
    }
  }, [currentProduct, onCardPress]);

  // 商品カードの長押しイベント
  const handleCardLongPress = useCallback(() => {
    if (currentProduct) {
      setQuickViewProduct(currentProduct);
      setShowQuickView(true);
    }
  }, [currentProduct]);

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

  // 保存ボタンのハンドラー
  const handleSaveProduct = useCallback(async () => {
    if (!currentProduct || !user?.id) return;

    const productId = currentProduct.id;
    const isSaved = savedProductIds.has(productId);

    try {
      if (isSaved) {
        // 保存解除
        await savedItemsService.unsaveItem(user.id, productId);
        setSavedProductIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(productId);
          return newSet;
        });
        Toast.show({
          type: 'success',
          text1: '保存を解除しました',
          text2: currentProduct.title,
          position: 'bottom',
          visibilityTime: 2000,
        });
      } else {
        // 保存
        await savedItemsService.saveItem(user.id, productId);
        setSavedProductIds(prev => new Set([...prev, productId]));
        Toast.show({
          type: 'success',
          text1: '保存しました',
          text2: currentProduct.title,
          position: 'bottom',
          visibilityTime: 2000,
        });
      }
    } catch (error) {
      console.error('[SwipeContainer] Save error:', error);
      Toast.show({
        type: 'error',
        text1: 'エラーが発生しました',
        text2: '後でもう一度お試しください',
        position: 'bottom',
        visibilityTime: 3000,
      });
    }
  }, [currentProduct, user?.id, savedProductIds]);

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
      
      <Animated.View
        style={[styles.cardContainer, animatedCardStyle]}
        {...panResponder.panHandlers}
        testID="animated-card-container"
      >
        {currentProduct && (
          <SwipeCard
            product={currentProduct}
            onPress={handleCardPress}
            onLongPress={handleCardLongPress}
            onSwipeLeft={isConnected === false ? undefined : handleNoButtonPress}
            onSwipeRight={isConnected === false ? undefined : handleYesButtonPress}
            onSave={handleSaveProduct}
            isSaved={savedProductIds.has(currentProduct.id)}
            testID="current-swipe-card"
          />
        )}
        
        {/* スワイプインジケーター */}
        <Animated.View
          style={[
            styles.swipeIndicator,
            styles.yesIndicator,
            { opacity: position.x.interpolate({
              inputRange: [0, SWIPE_THRESHOLD],
              outputRange: [0, 1],
              extrapolate: 'clamp',
            }) }
          ]}
        >
          <Text style={styles.indicatorText}>YES</Text>
        </Animated.View>
        
        <Animated.View
          style={[
            styles.swipeIndicator,
            styles.noIndicator,
            { opacity: position.x.interpolate({
              inputRange: [-SWIPE_THRESHOLD, 0],
              outputRange: [1, 0],
              extrapolate: 'clamp',
            }) }
          ]}
        >
          <Text style={styles.indicatorText}>NO</Text>
        </Animated.View>
      </Animated.View>
      
      {/* 残りカード数表示 */}
      <View style={styles.remainingContainer} testID="remaining-counter">
        <Text style={styles.remainingText}>
          残り {products.length - currentIndex} / {products.length} 件
        </Text>
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
  swipeIndicator: {
    position: 'absolute',
    padding: 10,
    borderRadius: 4,
  },
  yesIndicator: {
    top: 20,
    right: 20,
    backgroundColor: '#10B981',
  },
  noIndicator: {
    top: 20,
    left: 20,
    backgroundColor: '#EF4444',
  },
  indicatorText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 24,
  },
});

export default SwipeContainer;
