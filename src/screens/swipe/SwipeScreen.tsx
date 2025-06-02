import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { RootStackParamList, MainStackParamList } from '../../navigation/types';
import { Product } from '../../types/product';
import { useTheme } from '../../contexts/ThemeContext';
import { EmptyState } from '../../components/common';
import { useProducts } from '../../hooks/useProducts';
import { useSwipe } from '../../hooks/useSwipe';
import SwipeContainer from '../../components/swipe/SwipeContainer';
import ActionButtons from '../../components/swipe/ActionButtons';

// ナビゲーションの型定義
type SwipeScreenNavigationProp = StackNavigationProp<MainStackParamList>;

// スワイプ画面コンポーネント
const SwipeScreen: React.FC = () => {
  const navigation = useNavigation<SwipeScreenNavigationProp>();
  const theme = useTheme();
  
  // 商品データの取得
  const { products, isLoading: loading, error, loadMore, resetProducts } = useProducts();
  
  // 現在表示中のカードインデックス
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // スワイプ機能の利用
  const swipeUtils = useSwipe({ 
    userId: 'user123', // ここで適切なユーザーIDを渡す
    onSwipeComplete: (direction, product) => {
      // スワイプ完了時の処理
      console.log(`Swiped ${direction} on product ${product.id}`);
    }
  });
  
  // スワイプ関数を定義
  const handleSwipe = useCallback(async (product: Product, direction: 'left' | 'right') => {
    // 現在の商品
    const currentProduct = products[currentIndex];
    
    if (!currentProduct) return;
    
    // スワイプ方向に応じた処理
    if (direction === 'right') {
      await swipeUtils.handleSwipeRight(currentProduct);
    } else {
      await swipeUtils.handleSwipeLeft(currentProduct);
    }
    
    // 次のカードへ
    setCurrentIndex(prevIndex => prevIndex + 1);
    
    // 残りが少なくなったら追加で取得
    if (currentIndex >= products.length - 3) {
      loadMore();
    }
  }, [currentIndex, products, swipeUtils, loadMore]);
  
  // 商品カードをタップした時の処理
  const handleCardPress = (product: Product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };
  
  // 残りのアイテムがなくなった場合のリロード
  const handleReload = () => {
    setCurrentIndex(0);
    // resetProductsを使用するか、refreshProductsがあればそれを使用
    if (resetProducts) {
      resetProducts();
    } else {
      loadMore(true); // loadMoreにtrueを渡して強制リフレッシュ
    }
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
          icon="shopping-bag"
          buttonText="もっと見る"
          onButtonPress={handleReload}
        />
      );
    }
    
    // 通常表示（スワイプカード）
    return (
      <>
        <SwipeContainer
          products={products.slice(currentIndex)}
          onSwipe={handleSwipe}
          onCardPress={handleCardPress}
          isLoading={loading}
        />
        <View style={styles.actionButtonsContainer}>
          <ActionButtons
            onPressNo={() => handleSwipe(products[currentIndex], 'left')}
            onPressYes={() => handleSwipe(products[currentIndex], 'right')}
          />
        </View>
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