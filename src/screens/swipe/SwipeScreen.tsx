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
import { SwipeContainer } from '@/components/swipe';
import ActionButtons from '@/components/swipe/ActionButtons';
import FilterModal from '@/components/recommend/FilterModal';
import { FilterOptions } from '@/services/productService';
import { getFavorites, toggleFavorite } from '@/services/favoriteService';
import { getSafeUserId, diagnoseUserId } from '@/utils/authUtils';

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
  
  // 状態管理
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [swipeStartTime, setSwipeStartTime] = useState<number>(Date.now()); // スワイプ開始時刻
  
  // 表示済み商品IDの追跡は削除（useProductsフックで管理）
  // const [displayedProductIds, setDisplayedProductIds] = useState<Set<string>>(new Set());
  
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
      // displayedProductsCount: displayedProductIds.size
    });
    
    // 重複チェックは削除（useProductsフックが既に管理している）
    // 現在の商品が既に表示されたかチェック
    // if (currentProduct) {
    //   if (displayedProductIds.has(currentProduct.id)) {
    //     console.error(`[SwipeScreen] 🚨 重複検出: 商品ID ${currentProduct.id} (${currentProduct.title}) が再度表示されています！`);
    //     console.log('[SwipeScreen] 表示済み商品ID一覧:', Array.from(displayedProductIds));
    //     console.log('[SwipeScreen] 現在の商品リスト:', products.map(p => ({ id: p.id, title: p.title })));
    //   } else {
    //     setDisplayedProductIds(prev => new Set(prev).add(currentProduct.id));
    //   }
    // }
  }, [user, isInitialized, products.length, currentIndex, currentProduct, isLoading, error, hasMore]);
  
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
  
  // お気に入りリストの初期化
  useEffect(() => {
    const loadFavorites = async () => {
      const userId = getSafeUserId(user);
      if (userId) {
        // デバッグ情報を出力
        diagnoseUserId('SwipeScreen.loadFavorites', userId, user);
        
        const userFavorites = await getFavorites(userId);
        setFavorites(userFavorites);
      }
    };
    loadFavorites();
  }, [user]);
  
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
  
  // お気に入り処理
  const handleFavorite = useCallback(async () => {
    const userId = getSafeUserId(user);
    if (!userId || !currentProduct) return;
    
    try {
      const isFavorite = favorites.includes(currentProduct.id);
      await toggleFavorite(userId, currentProduct.id);
      
      if (isFavorite) {
        setFavorites(favorites.filter(id => id !== currentProduct.id));
      } else {
        setFavorites([...favorites, currentProduct.id]);
      }
    } catch (error) {
      console.error('お気に入り処理エラー:', error);
    }
  }, [user, currentProduct, favorites]);
  
  // ロードし直し
  const handleReload = useCallback(() => {
    console.log('[SwipeScreen] リロード開始');
    setShowEmptyState(false);
    // setDisplayedProductIds(new Set()); // 表示済みIDをリセット（削除）
    resetProducts();
  }, [resetProducts]);
  
  // フィルター適用
  const handleApplyFilter = useCallback((newFilters: FilterOptions) => {
    console.log('[SwipeScreen] フィルター適用:', newFilters);
    setFilters(newFilters);
    // setDisplayedProductIds(new Set()); // 表示済みIDをリセット（削除）
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
        isSaved={currentProduct ? favorites.includes(currentProduct.id) : false}
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
