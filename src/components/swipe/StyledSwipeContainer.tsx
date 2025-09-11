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
import SwipeCardImproved from './SwipeCardImproved';
import QuickViewModal from './QuickViewModal';

const { width } = Dimensions.get('window');

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
  currentIndex: externalIndex = 0,
  useEnhancedCard = true,
}) => {
  const { user } = useAuth();
  const { isConnected } = useNetwork();
  const { theme } = useStyle();
  const [loadingMore, setLoadingMore] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const loadMoreThreshold = useRef(10);
  
  // 外部から提供されたインデックスを使用
  const currentIndex = externalIndex;
  // 商品配列が空または初期化中の場合はundefinedを返す
  const currentProduct = products.length > 0 && currentIndex < products.length 
    ? products[currentIndex] 
    : undefined;

  // お気に入り機能のフックを使用
  const {
    favorites: savedItems,
    addToFavorites,
    removeFromFavorites,
    isFavorite
  } = useFavorites();

  // 画像のプリロード処理
  useEffect(() => {
    // 次の3枚の画像を事前読み込み
    if (products.length > 0 && currentIndex < products.length) {
      imagePreloadService.preloadProductImages(
        products,
        currentIndex + 1,
        3
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
      // インデックスの更新は外部(useProducts)で管理されるため、ここでは何もしない
    },
  });

  // 商品カードのタップイベント
  const handleCardPress = useCallback(() => {
    console.log('[StyledSwipeContainer] handleCardPress called');
    console.log('[StyledSwipeContainer] Current product:', currentProduct?.title, 'ID:', currentProduct?.id);
    if (currentProduct && onCardPress) {
      console.log('[StyledSwipeContainer] Calling onCardPress with product');
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

  // ローディング中の表示（初期状態も含む）
  if ((isLoading && products.length === 0) || !currentProduct) {
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
      
      {/* カードスタック - シンプルな実装に変更 */}
      <View style={styles.cardStackContainer}>
        {/* 現在のカードと次の2枚を表示（currentProductが存在する場合のみ） */}
        {currentProduct && products.slice(currentIndex, Math.min(currentIndex + 3, products.length)).map((product, index) => {
          const isTopCard = index === 0;
          const zIndex = 1000 - index;
          const scale = 1 - (index * 0.03);
          const translateY = index * 8;
          const opacity = isTopCard ? 1 : 0.7 - (index * 0.2);
          
          return (
            <View 
              key={`card-${product.id}`} // キーを商品IDのみに変更（再マウントを防ぐ）
              style={[
                styles.cardStack,
                { 
                  zIndex,
                  elevation: zIndex,
                  opacity,
                  transform: [
                    { scale },
                    { translateY },
                  ],
                  pointerEvents: isTopCard ? 'auto' : 'none',
                }
              ]}
            >
              <SwipeCardImproved
                product={product}
                onPress={isTopCard ? handleCardPress : undefined}
                onLongPress={isTopCard ? handleCardLongPress : undefined}
                onSwipeLeft={isTopCard && isConnected !== false ? () => handleSwipeLeft(product) : undefined}
                onSwipeRight={isTopCard && isConnected !== false ? () => handleSwipeRight(product) : undefined}
                onSave={isTopCard ? handleSaveButtonPress : undefined}
                isSaved={savedItems.includes(product.id)}
                testID={isTopCard ? "current-swipe-card" : `stacked-card-${index}`}
                isTopCard={isTopCard}
                cardIndex={index}
                totalCards={3}
              />
            </View>
          );
        })}
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
  cardStackContainer: {
    width: '100%',
    height: '80%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardStack: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default StyledSwipeContainer;
