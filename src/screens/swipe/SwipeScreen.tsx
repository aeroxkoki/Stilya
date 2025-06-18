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
import { useProducts } from '@/contexts/ProductContext';
import { SwipeContainer } from '@/components/swipe';
import ActionButtons from '@/components/swipe/ActionButtons';
import FilterModal from '@/components/recommend/FilterModal';
import { FilterOptions } from '@/services/productService';

// ナビゲーションの型定義
type SwipeScreenNavigationProp = StackNavigationProp<SwipeStackParamList, 'SwipeHome'>;

// スワイプ画面コンポーネント
const SwipeScreen: React.FC = () => {
  const navigation = useNavigation<SwipeScreenNavigationProp>();
  const { user } = useAuth();
  const { styleType } = useStyle();
  
  // 商品とスワイプ状態の管理
  const { 
    products, 
    loading, 
    loadProducts, 
    addSwipe,
    addToFavorites,
    removeFromFavorites,
    isFavorite
  } = useProducts();
  
  // 状態管理
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showEmptyState, setShowEmptyState] = useState(false);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  // 現在の商品
  const currentProduct = products[currentIndex];
  
  // 初期データロード
  useEffect(() => {
    loadProducts();
  }, []);
  
  // 商品が空の場合の処理
  useEffect(() => {
    if (!loading && products.length === 0) {
      setShowEmptyState(true);
    }
  }, [loading, products.length]);
  
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
  
  // スワイプ処理
  const handleSwipe = useCallback(async (direction: 'left' | 'right', product: Product) => {
    if (!user) return;
    
    const result = direction === 'right' ? 'yes' : 'no';
    
    try {
      // スワイプをDBに記録
      await addSwipe(user.id, product.id, result);
      
      // 次の商品へ
      if (currentIndex < products.length - 1) {
        setCurrentIndex(currentIndex + 1);
      } else {
        // 商品が終了
        setShowEmptyState(true);
      }
    } catch (error) {
      console.error('スワイプ記録エラー:', error);
    }
  }, [user, currentIndex, products.length, addSwipe]);
  
  // お気に入り処理
  const handleFavorite = useCallback(async () => {
    if (!user || !currentProduct) return;
    
    try {
      if (isFavorite(currentProduct.id)) {
        await removeFromFavorites(user.id, currentProduct.id);
        setFavorites(favorites.filter(id => id !== currentProduct.id));
      } else {
        await addToFavorites(user.id, currentProduct.id);
        setFavorites([...favorites, currentProduct.id]);
      }
    } catch (error) {
      console.error('お気に入り処理エラー:', error);
    }
  }, [user, currentProduct, favorites, isFavorite, addToFavorites, removeFromFavorites]);
  
  // ロードし直し
  const handleReload = useCallback(() => {
    setShowEmptyState(false);
    setCurrentIndex(0);
    loadProducts(filters);
  }, [loadProducts, filters]);
  
  // Undo処理
  const handleUndo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setShowEmptyState(false);
    }
  }, [currentIndex]);
  
  // フィルター適用
  const handleApplyFilter = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
    setCurrentIndex(0);
    loadProducts(newFilters);
    setShowFilterModal(false);
  }, [loadProducts]);
  
  // ローディング表示
  if (loading && products.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>商品を読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // 空の状態
  if (showEmptyState || (!loading && products.length === 0)) {
    return (
      <SafeAreaView style={styles.container}>
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
  
  return (
    <SafeAreaView style={styles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => setShowFilterModal(true)}
        >
          <Ionicons name="options-outline" size={24} color="#374151" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Stilya</Text>
        
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.navigate('ProductDetail', { productId: currentProduct?.id || '', from: 'swipe' })}
        >
          <Ionicons name="information-circle-outline" size={24} color="#374151" />
        </TouchableOpacity>
      </View>
      
      {/* スワイプエリア */}
      <View style={styles.swipeContainer}>
        {currentProduct && (
          <SwipeContainer
            products={products.slice(currentIndex, currentIndex + 3)}
            onSwipe={handleSwipe}
            currentIndex={currentIndex}
            styleType={styleType}
          />
        )}
      </View>
      
      {/* アクションボタン */}
      <ActionButtons
        onPressNo={() => currentProduct && handleSwipe('left', currentProduct)}
        onPressYes={() => currentProduct && handleSwipe('right', currentProduct)}
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
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
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
    color: '#6B7280',
  },
  undoButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 30,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 30,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
});

export default SwipeScreen;
