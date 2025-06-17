import React, { useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, MainTabParamList, SwipeStackParamList } from '../../types';
import { Product } from '../../types/product';
import { useStyle } from '../../contexts/ThemeContext';
import { useAuth } from '../../hooks/useAuth';
import { EmptyState } from '../../components/common';
import { useProducts } from '../../hooks/useProducts';
import { StyledSwipeContainer } from '../../components/swipe';
import ActionButtons from '../../components/swipe/ActionButtons';

// ナビゲーションの型定義
type SwipeScreenNavigationProp = StackNavigationProp<SwipeStackParamList, 'SwipeHome'>;

// スワイプ画面コンポーネント
const SwipeScreen: React.FC = () => {
  const navigation = useNavigation<SwipeScreenNavigationProp>();
  const { theme, styleType } = useStyle();
  
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
    hasMore
  } = useProducts();
  
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
      {renderContent()}
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
});

export default SwipeScreen;
