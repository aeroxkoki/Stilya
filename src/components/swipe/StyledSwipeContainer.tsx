import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  View, 
  StyleSheet, 
  ActivityIndicator, 
  Text, 
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSwipe } from '@/hooks/useSwipe';
import { useFavorites } from '@/hooks/useFavorites';
import { Product } from '@/types';
import { useAuth } from '@/hooks/useAuth';
import { useNetwork } from '@/contexts/NetworkContext';
import { useStyle } from '@/contexts/ThemeContext';
import { imagePreloadService } from '@/services/imagePreloadService';
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
  const loadMoreThreshold = useRef(10); // あと10枚になったら追加読み込み
  
  // 外部のインデックスが提供されていればそれを使う、なければ内部の状態を使う
  const currentIndex = externalIndex !== undefined ? externalIndex : internalIndex;
  const currentProduct = products[currentIndex];

  // スワイプ方向を保持する状態
  const [swipeDirection, setSwipeDirection] = useState<'left' | 'right' | null>(null);
  
  // お気に入り機能のフックを使用
  const {
    favorites: savedItems,
    addToFavorites,
    removeFromFavorites,
    isFavorite
  } = useFavorites();

  // 画像のプリロード処理
  useEffect(() => {
    // 次の3枚の画像を事前読み込み（表示される分だけ）
    if (products.length > 0 && currentIndex < products.length) {
      imagePreloadService.preloadProductImages(
        products,
        currentIndex + 1, // 次のインデックスから
        3 // 3枚先読み（表示される分だけ）
      ).catch(error => {
        if (__DEV__) {
          console.warn('[StyledSwipeContainer] Failed to preload images:', error);
        }
      });
    }
  }, [currentIndex, products]);

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
      console.log(`[StyledSwipeContainer] Swipe completed: ${direction} for product ${product.id}`);
      if (onSwipe) {
        onSwipe(product, direction);
      }
      // 外部インデックスが提供されていない場合のみ、内部インデックスを更新
      // 外部インデックスが提供されている場合は、外部（useProducts）でインデックス管理される
      if (externalIndex === undefined) {
        setInternalIndex(prevIndex => {
          const nextIndex = prevIndex + 1;
          console.log(`[StyledSwipeContainer] Internal index updated to ${nextIndex}`);
          return nextIndex;
        });
      } else {
        console.log('[StyledSwipeContainer] External index provided, not updating internal index');
      }
      setSwipeDirection(null);
    },
  });

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
        {/* カードスタック表示 - 背後のカードから順に表示 */}
        {useEnhancedCard ? (
          <>
            {/* 最大3枚のカードをスタック表示 */}
            {[0, 1, 2].map((stackIndex) => {
              const productIndex = currentIndex + stackIndex;
              const product = products[productIndex];
              const isTop = stackIndex === 0;
              const isVisible = product && productIndex < products.length;
              
              if (!isVisible) return null;
              
              return (
                <View 
                  key={`product-${product.id}-stack-${stackIndex}`} // 商品IDと位置の組み合わせをkeyとして使用
                  style={{ 
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: isTop ? 1000 : 1000 - stackIndex,
                    elevation: isTop ? 10 : 10 - stackIndex,
                    opacity: isTop ? 1 : 0.7 - (stackIndex * 0.2), // 背後のカードは少し透明に
                    pointerEvents: isTop ? 'auto' : 'none',
                    transform: isTop ? [] : [
                      { scale: 1 - (stackIndex * 0.03) }, // 背後のカードを少し小さく
                      { translateY: stackIndex * 8 }, // 少しずらして立体感を出す
                    ],
                  }}
                >
                  <SwipeCardImproved
                    product={product}
                    onPress={isTop ? handleCardPress : undefined}
                    onLongPress={isTop ? handleCardLongPress : undefined}
                    onSwipeLeft={isTop && isConnected !== false ? () => handleSwipeLeft(product) : undefined}
                    onSwipeRight={isTop && isConnected !== false ? () => handleSwipeRight(product) : undefined}
                    onSave={isTop ? handleSaveButtonPress : undefined}
                    isSaved={savedItems.includes(product.id)}
                    testID={isTop ? "current-swipe-card" : `stacked-card-${stackIndex}`}
                    isTopCard={isTop}
                    cardIndex={stackIndex}
                    totalCards={3}
                  />
                </View>
              );
            })}
          </>
        ) : (
          currentProduct && (
            <View
              style={{
                width: '100%',
                height: '100%',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <SwipeCardImproved
                key={currentProduct.id} // 商品IDのみをkeyとして使用
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
            </View>
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
});

export default StyledSwipeContainer;
