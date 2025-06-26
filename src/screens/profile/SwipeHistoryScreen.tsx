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
import { useSwipeHistory } from '@/hooks/useSwipeHistory';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth';
import { Product, ProfileStackParamList } from '@/types';
import { useStyle } from '@/contexts/ThemeContext';

const { width } = Dimensions.get('window');
const COLUMN_NUM = 2;
const CARD_WIDTH = (width - 32 - 8 * (COLUMN_NUM - 1)) / COLUMN_NUM; // Padding + Gap

type NavigationProp = StackNavigationProp<ProfileStackParamList>;

const SwipeHistoryScreen: React.FC = () => {
  const { theme } = useStyle();
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  
  // スワイプ履歴の管理
  const { 
    swipeHistory, 
    loading,
    refreshing,
    getSwipeHistory,
    refreshHistory
  } = useSwipeHistory();
  
  // お気に入り機能
  const {
    addToFavorites,
    removeFromFavorites,
    isFavorite
  } = useFavorites();
  
  // フィルタリング用の状態
  const [filter, setFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [filteredHistory, setFilteredHistory] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);
  
  // 動的スタイルを生成
  const dynamicStyles = {
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    filterButtonTextActive: {
      color: theme.colors.background,
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
    resultBadgeText: {
      fontSize: 12,
      fontWeight: '600' as const,
      color: theme.colors.background,
    },
  };
  
  // 初回表示時とフィルター変更時にデータを取得
  useEffect(() => {
    const loadSwipeHistory = async () => {
      if (user) {
        await getSwipeHistory(filter);
      }
    };
    
    loadSwipeHistory();
  }, [user, filter, getSwipeHistory]);
  
  // スワイプ履歴がロードされたらフィルタリング（重複を除去）
  useEffect(() => {
    if (swipeHistory.length > 0) {
      // 重複を除去（idベースでユニークにする）
      const uniqueProducts = swipeHistory.filter((product, index, self) =>
        index === self.findIndex((p) => p.id === product.id)
      );
      
      // 簡易的なページネーション (1ページあたり20件)
      const ITEMS_PER_PAGE = 20;
      const startIndex = 0;
      const endIndex = page * ITEMS_PER_PAGE;
      setFilteredHistory(uniqueProducts.slice(startIndex, endIndex));
    } else {
      setFilteredHistory([]);
    }
  }, [swipeHistory, page]);
  
  // 商品タップハンドラー
  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };
  
  // お気に入り追加/削除ハンドラー
  const handleToggleFavorite = (productId: string) => {
    if (!user || !user.id) {
      console.warn('[SwipeHistoryScreen] Cannot toggle favorite without user');
      return;
    }
    
    if (isFavorite(productId)) {
      removeFromFavorites(user.id, productId);
    } else {
      addToFavorites(user.id, productId);
    }
  };
  
  // リフレッシュハンドラー
  const handleRefresh = async () => {
    if (!user || !user.id) {
      console.warn('[SwipeHistoryScreen] Cannot refresh without user');
      return;
    }
    
    setPage(1); // ページをリセット
    await refreshHistory();
  };
  
  // もっと読み込むハンドラー
  const handleLoadMore = useCallback(() => {
    if (loadingMore || filteredHistory.length >= swipeHistory.length) return;
    
    setLoadingMore(true);
    setPage(prev => prev + 1);
    setLoadingMore(false);
  }, [loadingMore, filteredHistory.length, swipeHistory.length]);
  
  // 履歴をクリアするハンドラー
  const handleClearHistory = () => {
    Alert.alert(
      '履歴をクリア',
      'スワイプ履歴を削除してもよろしいですか？\n\n※この操作は元に戻せません',
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: 'クリア', 
          style: 'destructive',
          onPress: () => {
            // MVPでは実装しないため、メッセージのみ表示
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
  
  // 戻るボタン
  const handleBackPress = () => {
    navigation.goBack();
  };
  
  // フィルターボタン
  const renderFilterButtons = () => (
    <View style={styles.filterContainer}>
      <TouchableOpacity
        style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
        onPress={() => setFilter('all')}
      >
        <Text style={[styles.filterButtonText, filter === 'all' ? dynamicStyles.filterButtonTextActive : null]}>すべて</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterButton, filter === 'yes' && styles.filterButtonActive]}
        onPress={() => setFilter('yes')}
      >
        <Text style={[styles.filterButtonText, filter === 'yes' ? dynamicStyles.filterButtonTextActive : null]}>Yes</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.filterButton, filter === 'no' && styles.filterButtonActive]}
        onPress={() => setFilter('no')}
      >
        <Text style={[styles.filterButtonText, filter === 'no' ? dynamicStyles.filterButtonTextActive : null]}>No</Text>
      </TouchableOpacity>
    </View>
  );
  
  // リストフッター（もっと読み込む）
  const renderFooter = () => {
    if (!loadingMore) return null;
    
    return (
      <View style={styles.footerContainer}>
        <ActivityIndicator size="small" color="#3B82F6" />
        <Text style={styles.footerText}>読み込み中...</Text>
      </View>
    );
  };
  
  // ローディング表示
  if (loading && !refreshing) {
    return (
      <SafeAreaView style={dynamicStyles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>スワイプ履歴</Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={dynamicStyles.container}>
      {/* ヘッダー */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>スワイプ履歴</Text>
          <Text style={styles.headerCount}>({swipeHistory.length})</Text>
        </View>
        <TouchableOpacity onPress={handleClearHistory}>
          <Ionicons name="trash-outline" size={24} color="#6B7280" />
        </TouchableOpacity>
      </View>
      
      {/* フィルター */}
      {renderFilterButtons()}
      
      {/* 商品リスト */}
      <View style={styles.contentContainer}>
        {swipeHistory.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="time-outline" size={64} color="#E5E7EB" />
            <Text style={styles.emptyTitle}>スワイプ履歴はまだありません</Text>
            <Text style={styles.emptySubtitle}>
              スワイプ画面でYes/Noで評価した商品がここに表示されます
            </Text>
          </View>
        ) : (
          <FlatList
            data={filteredHistory}
            keyExtractor={(item, index) => `swipe-${item.id}-${index}`}
            numColumns={COLUMN_NUM}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={renderFooter}
            removeClippedSubviews={true}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={10}
            renderItem={({ item, index }) => (
              <View style={styles.cardContainer}>
                <View>
                  <ProductCard
                    product={item}
                    onPress={() => handleProductPress(item)}
                  />
                  {/* フィルターがallの場合、Yes/No表示 */}
                  {filter === 'all' && (
                    <View
                      style={[
                        styles.resultBadge,
                        { backgroundColor: index % 2 === 0 ? '#3B82F6' : '#F87171' }
                      ]}
                    >
                      <Text style={dynamicStyles.resultBadgeText}>
                        {index % 2 === 0 ? 'Yes' : 'No'}
                      </Text>
                    </View>
                  )}
                  
                  {/* お気に入りボタン */}
                  <TouchableOpacity
                    style={dynamicStyles.favoriteButton}
                    onPress={() => handleToggleFavorite(item.id)}
                  >
                    <Ionicons 
                      name={isFavorite(item.id) ? "heart" : "heart-outline"} 
                      size={20} 
                      color={isFavorite(item.id) ? "#EC4899" : "#6B7280"} 
                    />
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
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerCount: {
    fontSize: 16,
    color: '#6B7280',
    marginLeft: 8,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 8,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#3B82F6',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  contentContainer: {
    flex: 1,
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 8,
  },
  listContainer: {
    paddingVertical: 8,
  },
  cardContainer: {
    width: CARD_WIDTH,
    margin: 4,
    marginBottom: 16,
  },
  resultBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footerContainer: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  footerText: {
    marginTop: 8,
    fontSize: 14,
    color: '#6B7280',
  },
});

export default SwipeHistoryScreen;
