import React, { useEffect, useCallback, useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, MainTabParamList, SwipeStackParamList } from '../../types';
import { Product } from '../../types/product';
import { useStyle } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { EmptyState } from '../../components/common';
import { useProducts } from '../../hooks/useProducts';
import { StyledSwipeContainer } from '../../components/swipe';
import ActionButtons from '../../components/swipe/ActionButtons';
import FilterModal from '../../components/recommend/FilterModal';
import { FilterOptions } from '../../services/productService';

// ナビゲーションの型定義
type SwipeScreenNavigationProp = StackNavigationProp<SwipeStackParamList, 'SwipeHome'>;

// スワイプ画面コンポーネント
const SwipeScreen: React.FC = () => {
  const navigation = useNavigation<SwipeScreenNavigationProp>();
  const { theme, styleType } = useStyle();
  const [showFilter, setShowFilter] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    categories: [],
    priceRange: [0, Infinity],
    selectedTags: []
  });
  
  // フィルター適用数を計算
  const getActiveFilterCount = () => {
    let count = 0;
    if (activeFilters.categories.length > 0) count += activeFilters.categories.length;
    if (activeFilters.priceRange[0] > 0 || activeFilters.priceRange[1] < Infinity) count++;
    if (activeFilters.selectedTags.length > 0) count += activeFilters.selectedTags.length;
    return count;
  };
  
  // useProductsフックを使用（currentIndexも管理）
  const { 
    products, 
    currentIndex,
    currentProduct,
    isLoading: loading, 
    error, 
    loadMore, 
    resetProducts,
    handleSwipe: productHandleSwipe,
    hasMore,
    // フィルター機能を追加（実装は後述）
    setFilters
  } = useProducts();
  
  // フィルター適用時の処理
  const handleApplyFilter = useCallback((filters: FilterOptions) => {
    setActiveFilters(filters);
    // フィルターを適用して商品を再読み込み
    if (setFilters) {
      setFilters(filters);
    }
    setShowFilter(false);
  }, [setFilters]);
  
  // スワイプ処理（useProductsのhandleSwipeを使用）
  const handleSwipe = useCallback(async (product: Product, direction: 'left' | 'right') => {
    try {
      // デバッグ情報
      console.log('[SwipeScreen] Handling swipe:', {
        direction,
        productId: product.id,
        currentIndex,
        totalProducts: products.length,
        hasMore
      });
      
      // useProductsのhandleSwipeを呼び出す
      await productHandleSwipe(product, direction);
      
    } catch (error) {
      console.error('[SwipeScreen] Error during swipe:', error);
    }
  }, [currentIndex, products.length, hasMore, productHandleSwipe]);
  
  // 商品カードをタップした時の処理
  const handleCardPress = (product: Product) => {
    navigation.navigate('ProductDetail', { 
      productId: product.id,
      from: 'swipe' // 遷移元を記録
    });
  };
  
  // 残りのアイテムがなくなった場合のリロード
  const handleReload = () => {
    // resetProductsを使用（currentIndexのリセットも内部で行われる）
    resetProducts();
  };
  
  // 利用可能なタグの取得（実際の実装では商品データから動的に取得）
  const availableTags = ['カジュアル', 'フォーマル', 'ストリート', 'モード', 'ナチュラル', 'ヴィンテージ'];
  
  // スワイプ画面の表示内容
  const renderContent = () => {
    // ローディング中
    if (loading && products.length === 0) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
            ファッションアイテムを読み込み中...
          </Text>
        </View>
      );
    }
    
    // エラー発生時
    if (error) {
      return (
        <EmptyState
          message="アイテムの読み込みに失敗しました"
          icon="alert-circle"
          buttonText="再読み込み"
          onButtonPress={handleReload}
        />
      );
    }
    
    // 表示するアイテムがない場合
    if (products.length === 0 || currentIndex >= products.length) {
      return (
        <EmptyState
          message="表示できるアイテムがありません"
          icon="bag"
          buttonText="もっと見る"
          onButtonPress={handleReload}
        />
      );
    }
    
    // 通常表示（スワイプカード）
    return (
      <>
        <StyledSwipeContainer
          products={products}
          onSwipe={handleSwipe}
          onCardPress={handleCardPress}
          isLoading={loading}
          currentIndex={currentIndex}
          onLoadMore={loadMore}
          hasMoreProducts={hasMore}
          useEnhancedCard={true} // 強化版カードを使用
        />
      </>
    );
  };
  
  return (
    <SafeAreaView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      testID="swipe-screen"
    >
      {/* フィルターボタン（右上に配置） */}
      <TouchableOpacity
        style={[
          styles.filterButton,
          {
            backgroundColor: `${theme.colors.card.background}E6`,
            shadowColor: theme.shadows.small.shadowColor,
            shadowOffset: theme.shadows.small.shadowOffset,
            shadowOpacity: theme.shadows.small.shadowOpacity,
            shadowRadius: theme.shadows.small.shadowRadius,
            elevation: theme.shadows.small.elevation,
          }
        ]}
        onPress={() => setShowFilter(true)}
        testID="filter-button"
      >
        <Ionicons 
          name="options-outline" 
          size={24} 
          color={theme.colors.text.primary} 
        />
        {getActiveFilterCount() > 0 && (
          <View 
            style={[
              styles.filterBadge, 
              { backgroundColor: theme.colors.primary }
            ]}
          >
            <Text style={styles.filterBadgeText}>{getActiveFilterCount()}</Text>
          </View>
        )}
      </TouchableOpacity>
      
      {renderContent()}
      
      {/* フィルターモーダル */}
      <FilterModal
        visible={showFilter}
        onClose={() => setShowFilter(false)}
        onApply={handleApplyFilter}
        initialFilters={activeFilters}
        availableTags={availableTags}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  actionButtonsContainer: {
    position: 'absolute',
    bottom: 30,
    left: 0,
    right: 0,
    paddingHorizontal: 24,
  },
  filterButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 100,
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

export default SwipeScreen;
