import React from 'react';
import { View, StyleSheet, ActivityIndicator, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import SwipeCard from '../components/SwipeCard';
import ActionButtons from '../components/ActionButtons';
import EmptyState from '../components/EmptyState';
import { useProducts } from '../hooks/useProducts';

type RootStackParamList = {
  ProductDetail: { productId: string };
};

type SwipeScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const SwipeScreen: React.FC = () => {
  const navigation = useNavigation<SwipeScreenNavigationProp>();
  const {
    products,
    currentProduct,
    isLoading,
    error,
    handleSwipeLeft,
    handleSwipeRight,
    resetProducts,
  } = useProducts();

  // 商品詳細画面に遷移
  const handleCardPress = () => {
    if (currentProduct) {
      navigation.navigate('ProductDetail', { productId: currentProduct.id });
    }
  };

  // ローディング中
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>商品を読み込んでいます...</Text>
      </View>
    );
  }

  // エラー発生時
  if (error) {
    return (
      <EmptyState
        message={error}
        buttonText="再読み込み"
        onButtonPress={resetProducts}
      />
    );
  }

  // 商品がない場合
  if (!products.length) {
    return (
      <EmptyState
        message="商品が見つかりませんでした。"
        buttonText="再読み込み"
        onButtonPress={resetProducts}
      />
    );
  }

  // 全ての商品をスワイプし終わった場合
  if (products.length <= currentProduct?.id) {
    return (
      <EmptyState
        message="すべての商品をチェックしました！"
        buttonText="もっと見る"
        onButtonPress={resetProducts}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.cardContainer}>
        {currentProduct && (
          <SwipeCard
            product={currentProduct}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onCardPress={handleCardPress}
          />
        )}
      </View>
      <View style={styles.buttonsContainer}>
        <ActionButtons
          onPressNo={handleSwipeLeft}
          onPressYes={handleSwipeRight}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
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
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonsContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
  },
});

export default SwipeScreen;
