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
import { useProductStore } from '@/store/productStore';
import { useAuthStore } from '@/store/authStore';
import { Product, ProfileStackParamList } from '@/types';
import { useStyle } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');
const COLUMN_NUM = 2;
const CARD_WIDTH = (width - 32 - 8 * (COLUMN_NUM - 1)) / COLUMN_NUM; // Padding + Gap

type NavigationProp = StackNavigationProp<ProfileStackParamList>;

const FavoritesScreen: React.FC = () => {
  const { theme } = useStyle();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuthStore();
  const { 
    favorites, 
    getFavorites, 
    removeFromFavorites, 
    loading 
  } = useProductStore();
  
  const [refreshing, setRefreshing] = useState(false);
  const [displayFavorites, setDisplayFavorites] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  const [sortOrder, setSortOrder] = useState<'recent' | 'price_high' | 'price_low'>('recent');
  
  // 初回表示時にデータを取得
  useEffect(() => {
    const loadFavorites = async () => {
      if (user) {
        await getFavorites(user.id);
      }
    };
    
    loadFavorites();
  }, [user]);
  
  // お気に入りがロードされたらソートして表示
  useEffect(() => {
    if (favorites.length > 0) {
      const sorted = sortFavorites(favorites, sortOrder);
      
      // 簡易的なページネーション (1ページあたり20件)
      const ITEMS_PER_PAGE = 20;
      const startIndex = 0;
      const endIndex = page * ITEMS_PER_PAGE;
      
      setDisplayFavorites(sorted.slice(startIndex, endIndex));
    } else {
      setDisplayFavorites([]);
    }
  }, [favorites, page, sortOrder]);
  
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
          onPress: () => {
            if (user) {
              removeFromFavorites(user.id, productId);
            }
          }
        }
      ]
    );
  };
  
  // リフレッシュハンドラー
  const handleRefresh = async () => {
    if (!user) return;
    
    setRefreshing(true);
    setPage(1);
    await getFavorites(user.id);
    setRefreshing(false);
  };
  
  // もっと読み込むハンドラー
  const handleLoadMore = useCallback(() => {
    if (loadingMore || displayFavorites.length >= favorites.length) return;
    
    setLoadingMore(true);
    setPage(prev => prev + 1);
    setLoadingMore(false);
  }, [loadingMore, displayFavorites.length, favorites.length]);
  
  // すべてのお気に入りをクリア
  const handleClearAll = () => {
    if (!user || favorites.length === 0) return;
    
    Alert.alert(
      'すべて削除',
      'お気に入りをすべて削除してもよろしいですか？\n\nこの操作は元に戻せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: 'すべて削除', 
          style: 'destructive',
          onPress: () => {
            // MVPでは未実装のため、アラートのみ表示
            Alert.alert(
              '機能制限',
              'この機能はMVP版では実装されていません。',
              [{ text: 'OK', style: 'default' }]
            );
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
      <View >
        <ActivityIndicator size="small" color="#3B82F6" />
        <Text >読み込み中...</Text>
      </View>
    );
  };
  
  // ローディング表示
  if (loading && !refreshing) {
    return (
      <SafeAreaView >
        <View >
          <TouchableOpacity onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text >お気に入り</Text>
          <View style={{ width: 24 }} /> {/* バランス用の空のビュー */}
        </View>
        <View >
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text >読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView >
      {/* ヘッダー */}
      <View >
        <TouchableOpacity onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View >
          <Text >お気に入り</Text>
          <Text >({favorites.length})</Text>
        </View>
        <View >
          <TouchableOpacity onPress={handleShowSortOptions} >
            <Ionicons name="filter-outline" size={24} color="#6B7280" />
          </TouchableOpacity>
          <TouchableOpacity onPress={handleClearAll}>
            <Ionicons name="trash-outline" size={24} color="#6B7280" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* ソート状態表示 */}
      <View >
        <Text >
          {sortOrder === 'recent' ? '最新順' : 
           sortOrder === 'price_high' ? '価格が高い順' : '価格が低い順'}
           で表示中
        </Text>
      </View>
      
      {/* 商品リスト */}
      <View >
        {favorites.length === 0 ? (
          <View >
            <Ionicons name="heart-outline" size={64} color="#E5E7EB" />
            <Text >お気に入りはまだありません</Text>
            <Text >
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
                <View >
                  <ProductCard
                    product={item}
                    onPress={() => handleProductPress(item)}
                  />
                  <TouchableOpacity
                    style={styles.favoriteButton}
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
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'white',
    borderRadius: 15,
    width: 30,
    height: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: theme.colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
});

export default FavoritesScreen;