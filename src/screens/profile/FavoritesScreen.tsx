import React, { useEffect, useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView,
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet,
  Dimensions,
  RefreshControl,
  Alert
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { ProductCard, Button } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';
import { useFavorites } from '@/hooks/useFavorites';
import { Product, ProfileStackParamList } from '@/types';
import { useStyle } from '@/contexts/ThemeContext';
import { fetchProductById } from '@/services/productService';

const { width } = Dimensions.get('window');
const COLUMN_NUM = 2;
const CARD_WIDTH = (width - 32 - 8 * (COLUMN_NUM - 1)) / COLUMN_NUM; // Padding + Gap

type NavigationProp = StackNavigationProp<ProfileStackParamList>;

const FavoritesScreen: React.FC = () => {
  const { theme } = useStyle();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { 
    favorites: favoriteIds, 
    removeFromFavorites, 
    refreshFavorites,
    loading 
  } = useFavorites();
  
  const [refreshing, setRefreshing] = useState(false);
  const [favoriteProducts, setFavoriteProducts] = useState<Product[]>([]);
  const [displayFavorites, setDisplayFavorites] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortOrder, setSortOrder] = useState<'recent' | 'price_high' | 'price_low'>('recent');
  const [loadingProducts, setLoadingProducts] = useState(false);
  
  // 動的スタイルを生成
  const dynamicStyles = {
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
      justifyContent: 'space-between' as const,
      paddingHorizontal: 16,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: 'bold' as const,
      color: theme.colors.text.primary,
    },
    headerCount: {
      fontSize: 16,
      color: theme.colors.text.secondary,
      marginLeft: 8,
    },
    headerTitleContainer: {
      flexDirection: 'row' as const,
      alignItems: 'center' as const,
    },
    headerActions: {
      flexDirection: 'row' as const,
      gap: 12,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
    },
    loadingText: {
      marginTop: 16,
      fontSize: 16,
      color: theme.colors.text.secondary,
    },
    sortStatus: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      backgroundColor: theme.colors.surface,
    },
    sortStatusText: {
      fontSize: 12,
      color: theme.colors.text.hint,
    },
    contentContainer: {
      flex: 1,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      paddingHorizontal: 32,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '600' as const,
      color: theme.colors.text.primary,
      marginTop: 16,
    },
    emptySubtitle: {
      fontSize: 14,
      color: theme.colors.text.secondary,
      textAlign: 'center' as const,
      marginTop: 8,
    },
    favoriteButton: {
      position: 'absolute' as const,
      top: 8,
      right: 8,
      backgroundColor: 'white',
      borderRadius: 15,
      width: 30,
      height: 30,
      justifyContent: 'center' as const,
      alignItems: 'center' as const,
      shadowColor: theme.colors.primary,
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.2,
      shadowRadius: 1.5,
      elevation: 2,
    },
    footerContainer: {
      paddingVertical: 16,
      alignItems: 'center' as const,
    },
    footerText: {
      marginTop: 8,
      fontSize: 14,
      color: theme.colors.text.secondary,
    },
  };
  
  // お気に入りIDから商品データを取得
  const loadFavoriteProducts = useCallback(async () => {
    if (favoriteIds.length === 0) {
      setFavoriteProducts([]);
      setDisplayFavorites([]);
      return;
    }
    
    setLoadingProducts(true);
    
    try {
      // お気に入りの商品データを取得（存在しない商品はスキップ）
      const products: Product[] = [];
      
      // バッチで処理（パフォーマンスを考慮）
      const batchSize = 10;
      for (let i = 0; i < favoriteIds.length; i += batchSize) {
        const batch = favoriteIds.slice(i, i + batchSize);
        const batchPromises = batch.map(async (id) => {
          try {
            const result = await fetchProductById(id);
            if (result.success && 'data' in result && result.data) {
              return result.data;
            }
            return null;
          } catch (error) {
            console.warn(`[FavoritesScreen] Failed to fetch product ${id}:`, error);
            return null;
          }
        });
        
        const batchResults = await Promise.all(batchPromises);
        // nullでない商品のみを追加
        products.push(...batchResults.filter((p): p is Product => p !== null));
      }
      
      setFavoriteProducts(products);
    } catch (error) {
      console.error('[FavoritesScreen] Error loading favorite products:', error);
    } finally {
      setLoadingProducts(false);
    }
  }, [favoriteIds]);
  
  // お気に入りIDが変更されたら商品データを再取得
  useEffect(() => {
    loadFavoriteProducts();
  }, [favoriteIds, loadFavoriteProducts]);
  
  // お気に入りがロードされたらソートして表示
  useEffect(() => {
    if (favoriteProducts.length > 0) {
      const sorted = sortFavorites(favoriteProducts, sortOrder);
      
      // 簡易的なページネーション (1ページあたり20件)
      const ITEMS_PER_PAGE = 20;
      const startIndex = 0;
      const endIndex = page * ITEMS_PER_PAGE;
      
      setDisplayFavorites(sorted.slice(startIndex, endIndex));
    } else {
      setDisplayFavorites([]);
    }
  }, [favoriteProducts, page, sortOrder]);
  
  // ソート機能
  const sortFavorites = (items: Product[], order: string) => {
    const clonedItems = [...items];
    
    switch (order) {
      case 'price_high':
        return clonedItems.sort((a, b) => b.price - a.price);
      case 'price_low':
        return clonedItems.sort((a, b) => a.price - b.price);
      case 'recent':
      default:
        // 日付でソート（最新順）
        // 日付情報がなければ元の順序を維持
        return clonedItems.sort((a, b) => {
          if (!a.createdAt || !b.createdAt) return 0;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
    }
  };
  
  // 商品タップハンドラー
  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };
  
  // お気に入り削除ハンドラー
  const handleRemoveFavorite = (productId: string) => {
    Alert.alert(
      'お気に入りから削除',
      'この商品をお気に入りから削除しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: '削除', 
          style: 'destructive',
          onPress: async () => {
            try {
              await removeFromFavorites(productId);
            } catch (error) {
              console.error('[FavoritesScreen] Error removing favorite:', error);
              Alert.alert('エラー', 'お気に入りの削除に失敗しました');
            }
          }
        }
      ]
    );
  };
  
  // リフレッシュハンドラー
  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await refreshFavorites();
    await loadFavoriteProducts();
    setRefreshing(false);
  };
  
  // もっと読み込むハンドラー
  const handleLoadMore = useCallback(() => {
    if (loadingMore || displayFavorites.length >= favoriteProducts.length) return;
    
    setLoadingMore(true);
    setPage(prev => prev + 1);
    setLoadingMore(false);
  }, [loadingMore, displayFavorites.length, favoriteProducts.length]);
  
  // すべてのお気に入りをクリア
  const handleClearAll = () => {
    if (!user || favoriteProducts.length === 0) return;
    
    Alert.alert(
      'すべて削除',
      'お気に入りをすべて削除してもよろしいですか？\n\nこの操作は元に戻せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: 'すべて削除', 
          style: 'destructive',
          onPress: async () => {
            try {
              const { clearAllFavorites } = await import('@/services/favoriteService');
              const success = await clearAllFavorites(user.id);
              
              if (success) {
                Alert.alert('完了', 'お気に入りをすべて削除しました');
                // お気に入りをリフレッシュ
                await refreshFavorites();
              } else {
                Alert.alert('エラー', 'お気に入りの削除に失敗しました');
              }
            } catch (error) {
              console.error('Clear all favorites error:', error);
              Alert.alert('エラー', 'お気に入りの削除に失敗しました');
            }
          }
        }
      ]
    );
  };
  
  // 並び替えメニュー
  const handleShowSortOptions = () => {
    Alert.alert(
      '並び替え',
      '表示順を選択してください',
      [
        {
          text: '最新順',
          onPress: () => setSortOrder('recent')
        },
        {
          text: '価格が高い順',
          onPress: () => setSortOrder('price_high')
        },
        {
          text: '価格が低い順',
          onPress: () => setSortOrder('price_low')
        },
        {
          text: 'キャンセル',
          style: 'cancel'
        }
      ]
    );
  };
  
  // 戻るボタン
  const handleBackPress = () => {
    navigation.goBack();
  };
  
  // リストフッター（もっと読み込む）
  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={dynamicStyles.footerContainer}>
        <ActivityIndicator size="small" color="#3B82F6" />
        <Text style={dynamicStyles.footerText}>読み込み中...</Text>
      </View>
    );
  };
  
  // ローディング表示
  if ((loading || loadingProducts) && !refreshing) {
    return (
      <SafeAreaView style={dynamicStyles.container}>
        <View style={dynamicStyles.header}>
          <TouchableOpacity onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={dynamicStyles.headerTitle}>お気に入り</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={dynamicStyles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={dynamicStyles.loadingText}>読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={dynamicStyles.container}>
      {/* ヘッダー */}
      <View style={dynamicStyles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={dynamicStyles.headerTitleContainer}>
          <Text style={dynamicStyles.headerTitle}>お気に入り</Text>
          <Text style={dynamicStyles.headerCount}>({favoriteProducts.length})</Text>
        </View>
        <View style={dynamicStyles.headerActions}>
          <TouchableOpacity onPress={handleShowSortOptions} style={{ padding: 4 }}>
            <Ionicons name="filter-outline" size={24} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleClearAll}>
            <Ionicons name="trash-outline" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* ソート状態表示 */}
      <View style={dynamicStyles.sortStatus}>
        <Text style={dynamicStyles.sortStatusText}>
          {sortOrder === 'recent' ? '最新順で表示中' : 
           sortOrder === 'price_high' ? '価格が高い順で表示中' : '価格が低い順で表示中'}
        </Text>
      </View>
      
      {/* 商品リスト */}
      <View style={dynamicStyles.contentContainer}>
        {favoriteProducts.length === 0 ? (
          <View style={dynamicStyles.emptyContainer}>
            <Ionicons name="heart-outline" size={64} color="#E5E7EB" />
            <Text style={dynamicStyles.emptyTitle}>お気に入りはまだありません</Text>
            <Text style={dynamicStyles.emptySubtitle}>
              スワイプ画面で「いいね」した商品や詳細画面でお気に入り登録した商品がここに表示されます
            </Text>
          </View>
        ) : (
          <FlatList
            data={displayFavorites}
            keyExtractor={(item) => item.id}
            numColumns={COLUMN_NUM}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            renderItem={({ item }) => (
              <View style={styles.cardContainer}>
                <View style={{ position: 'relative' }}>
                  <ProductCard
                    product={item}
                    onPress={() => handleProductPress(item)}
                  />
                  <TouchableOpacity
                    style={dynamicStyles.favoriteButton}
                    onPress={() => handleRemoveFavorite(item.id)}
                  >
                    <Ionicons name="heart" size={20} color="#EC4899" />
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingVertical: 8,
  },
  cardContainer: {
    width: CARD_WIDTH,
    margin: 4,
    marginBottom: 16,
  },
});

export default FavoritesScreen;