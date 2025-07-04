import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, MainTabParamList, SwipeStackParamList } from '@/types';
import { Product } from '@/types/product';
import { useStyle } from '@/contexts/ThemeContext';
import { useAuth } from '@/hooks/useAuth';
import { EmptyState } from '@/components/common';
import { useProducts } from '@/hooks/useProducts';
import { useFavorites } from '@/hooks/useFavorites';
import { SwipeContainer } from '@/components/swipe';
import ActionButtons from '@/components/swipe/ActionButtons';
import FilterModal from '@/components/recommend/FilterModal';
import { FilterOptions } from '@/services/productService';

// ナビゲーションの型定義
type SwipeScreenNavigationProp = StackNavigationProp<SwipeStackParamList, 'SwipeHome'>;

// スワイプ画面コンポーネント
const SwipeScreen: React.FC = () => {
  const navigation = useNavigation<SwipeScreenNavigationProp>();
  const { user, isInitialized } = useAuth();
  const { theme } = useStyle();
  
  // 商品とスワイプ状態の管理
  const { 
    products, 
    currentIndex,
    currentProduct,
    isLoading, 
    error,
    loadMore,
    resetProducts,
    refreshProducts,
    handleSwipe: swipeProduct,
    hasMore,
    setFilters: setProductFilters
  } = useProducts();
  
  // お気に入り機能（useFavoritesフックを使用）
  const {
    favorites: favoriteIds,
    addToFavorites,
    removeFromFavorites,
    isFavorite
  } = useFavorites();
  
  // 状態管理
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [swipeStartTime, setSwipeStartTime] = useState<number>(Date.now()); // スワイプ開始時刻
  
  // デバッグ用の状態表示
  useEffect(() => {
    console.log('[SwipeScreen] Debug Info:', {
      userExists: !!user,
      userId: user?.id,
      isInitialized,
      productsLength: products.length,
      currentIndex,
      currentProduct: currentProduct?.title,
      currentProductId: currentProduct?.id,
      isLoading,
      error,
      hasMore,
      favoritesCount: favoriteIds.length
    });
  }, [user, isInitialized, products.length, currentIndex, currentProduct, isLoading, error, hasMore, favoriteIds.length]);
  
  // 初期データロード
  useEffect(() => {
    // useProductsフックが自動的に初期ロードを行うので、ここでは特に何もしない
    console.log('[SwipeScreen] Component mounted');
  }, []);
  
  // エラーハンドリング
  useEffect(() => {
    if (error) {
      console.error('[SwipeScreen] Error:', error);
    }
  }, [error]);
  
  // 商品が空の場合の処理
  useEffect(() => {
    if (!isLoading && products.length === 0 && currentIndex >= products.length) {
      setShowEmptyState(true);
    } else {
      setShowEmptyState(false);
    }
  }, [isLoading, products.length, currentIndex]);
  
  // 利用可能なタグを商品から抽出
  useEffect(() => {
    if (products.length > 0) {
      const tags = new Set<string>();
      products.forEach(product => {
        if (product.tags && Array.isArray(product.tags)) {
          product.tags.forEach(tag => tags.add(tag));
        }
      });
      setAvailableTags(Array.from(tags));
    }
  }, [products]);
  
  // 商品が変わったときにスワイプ開始時刻をリセット
  useEffect(() => {
    setSwipeStartTime(Date.now());
  }, [currentProduct?.id]);
  
  // スワイプ処理
  const handleSwipe = useCallback(async (product: Product, direction: 'left' | 'right') => {
    if (!user) return;
    
    // スワイプ時間を計算
    const swipeTime = Date.now() - swipeStartTime;
    
    console.log(`[SwipeScreen] スワイプ: ${direction} - ${product.title} (ID: ${product.id}) - 時間: ${swipeTime}ms`);
    
    // useProductsフックのhandleSwipeを使用（時間情報付き）
    await swipeProduct(product, direction, { swipeTime });
    
    // 最後の商品に達した場合
    if (currentIndex >= products.length - 1) {
      if (!hasMore) {
        setShowEmptyState(true);
      } else {
        // 追加商品をロード
        await loadMore();
      }
    }
  }, [user, currentIndex, products.length, swipeProduct, hasMore, loadMore, swipeStartTime]);
  
  // お気に入り処理（useFavoritesフックを使用）
  const handleFavorite = useCallback(async () => {
    if (!currentProduct) return;
    
    try {
      if (isFavorite(currentProduct.id)) {
        await removeFromFavorites(currentProduct.id);
        console.log(`[SwipeScreen] お気に入りから削除: ${currentProduct.title}`);
      } else {
        await addToFavorites(currentProduct.id);
        console.log(`[SwipeScreen] お気に入りに追加: ${currentProduct.title}`);
      }
    } catch (error) {
      console.error('[SwipeScreen] お気に入り処理エラー:', error);
    }
  }, [currentProduct, isFavorite, addToFavorites, removeFromFavorites]);
  
  // ロードし直し
  const handleReload = useCallback(() => {
    console.log('[SwipeScreen] リロード開始');
    setShowEmptyState(false);
    resetProducts();
  }, [resetProducts]);
  
  // フィルター適用
  const handleApplyFilter = useCallback((newFilters: FilterOptions) => {
    console.log('[SwipeScreen] フィルター適用:', newFilters);
    setFilters(newFilters);
    setProductFilters(newFilters);
    setShowFilterModal(false);
  }, [setProductFilters]);
  
  // 認証状態の確認
  if (!isInitialized) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>初期化中...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // ローディング表示
  if (isLoading && products.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>商品を読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // エラー表示
  if (error && products.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <EmptyState
          icon="alert-circle-outline"
          title="エラーが発生しました"
          message={error}
          buttonText="再読み込み"
          onButtonPress={handleReload}
        />
      </SafeAreaView>
    );
  }
  
  // 空の状態
  if (showEmptyState || (!isLoading && products.length === 0)) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <EmptyState
          icon="card-outline"
          title="商品がありません"
          message="新しい商品を探してみましょう"
          buttonText="再読み込み"
          onButtonPress={handleReload}
        />
      </SafeAreaView>
    );
  }
  
  // 現在の商品がない場合（商品リストが空でない場合のみローディング表示）
  if (!currentProduct && products.length > 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>商品を準備中...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* ヘッダー */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="options-outline" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Stilya</Text>
        
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('ProductDetail', { productId: currentProduct?.id || '', from: 'swipe' })}
        >
          <Ionicons name="information-circle-outline" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
      </View>
      
      {/* スワイプエリア */}
      <View style={styles.swipeContainer}>
        {currentProduct && (
          <SwipeContainer
            products={products}
            isLoading={isLoading}
            onSwipe={handleSwipe}
            currentIndex={currentIndex}
            onCardPress={(product) => navigation.navigate('ProductDetail', { productId: product.id, from: 'swipe' })}
            onLoadMore={loadMore}
            hasMoreProducts={hasMore}
            useEnhancedCard={true}
          />
        )}
      </View>
      
      {/* アクションボタン */}
      <ActionButtons
        onPressNo={() => currentProduct && handleSwipe(currentProduct, 'left')}
        onPressYes={() => currentProduct && handleSwipe(currentProduct, 'right')}
        onPressSave={handleFavorite}
        isSaved={currentProduct ? isFavorite(currentProduct.id) : false}
        disabled={!currentProduct}
      />
      
      {/* フィルターモーダル */}
      <FilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
        onApply={handleApplyFilter}
        initialFilters={filters}
        availableTags={availableTags}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  swipeContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
});

export default SwipeScreen;
