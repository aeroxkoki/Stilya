import React, { useCallback } from 'react';
import { View, StyleSheet, ActivityIndicator, Text, RefreshControl, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { SwipeStackParamList } from '@/types';
import SwipeContainer from '@/components/swipe/SwipeContainer';
import EmptyState from '@/components/common/EmptyState';
import { useProducts } from '@/hooks/useProducts';
import { useRecordClick } from '@/hooks/useRecordClick';

type SwipeScreenNavigationProp = StackNavigationProp<SwipeStackParamList, 'SwipeHome'>;

const SwipeScreen: React.FC = () => {
  const navigation = useNavigation<SwipeScreenNavigationProp>();
  const recordClick = useRecordClick();
  
  const {
    products,
    currentProduct,
    isLoading,
    error,
    handleSwipe,
    resetProducts,
    refreshProducts,
  } = useProducts();

  // 商品詳細画面に遷移
  const handleCardPress = useCallback((product) => {
    if (product) {
      // クリックログを記録
      recordClick(product.id);
      
      // 詳細画面に遷移
      navigation.navigate('ProductDetail', { productId: product.id });
    }
  }, [navigation, recordClick]);

  // スワイプ処理
  const handleSwipeEvent = useCallback((product, direction) => {
    handleSwipe(product, direction);
  }, [handleSwipe]);

  // 商品をすべてスワイプし終わった時の処理
  const handleEmptyProducts = useCallback(() => {
    resetProducts();
  }, [resetProducts]);

  // エラー発生時
  if (error) {
    return (
      <EmptyState
        title="エラーが発生しました"
        message={error}
        buttonText="再読み込み"
        onButtonPress={resetProducts}
      />
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl 
            refreshing={isLoading}
            onRefresh={refreshProducts}
            colors={['#3B82F6']}
            tintColor="#3B82F6"
          />
        }
      >
        <SwipeContainer 
          products={products}
          isLoading={isLoading}
          onSwipe={handleSwipeEvent}
          onCardPress={handleCardPress}
          onEmptyProducts={handleEmptyProducts}
        />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  scrollContent: {
    flexGrow: 1,
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
  },
});

export default SwipeScreen;
