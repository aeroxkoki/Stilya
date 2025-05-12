import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet,
  Dimensions,
  RefreshControl
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { ProductCard } from '@/components/common';
import { useProductStore } from '@/store/productStore';
import { useAuthStore } from '@/store/authStore';
import { Product } from '@/types';

const { width } = Dimensions.get('window');
const COLUMN_NUM = 2;
const CARD_WIDTH = (width - 32 - 8 * (COLUMN_NUM - 1)) / COLUMN_NUM; // Padding + Gap

const SwipeHistoryScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { 
    swipeHistory, 
    getSwipeHistory, 
    loading,
    addToFavorites,
    isFavorite
  } = useProductStore();
  
  // フィルタリング用の状態
  const [filter, setFilter] = useState<'all' | 'yes' | 'no'>('all');
  const [refreshing, setRefreshing] = useState(false);
  
  // 初回表示時とフィルター変更時にデータを取得
  useEffect(() => {
    const loadSwipeHistory = async () => {
      if (user) {
        if (filter === 'all') {
          await getSwipeHistory(user.id);
        } else {
          await getSwipeHistory(user.id, filter);
        }
      }
    };
    
    loadSwipeHistory();
  }, [user, filter]);
  
  // 商品タップハンドラー
  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail' as never, { productId: product.id } as never);
  };
  
  // お気に入り追加ハンドラー
  const handleAddToFavorite = (productId: string) => {
    if (user) {
      addToFavorites(user.id, productId);
    }
  };
  
  // リフレッシュハンドラー
  const handleRefresh = async () => {
    if (!user) return;
    
    setRefreshing(true);
    if (filter === 'all') {
      await getSwipeHistory(user.id);
    } else {
      await getSwipeHistory(user.id, filter);
    }
    setRefreshing(false);
  };
  
  // 戻るボタン
  const handleBackPress = () => {
    navigation.goBack();
  };
  
  // フィルターボタン
  const renderFilterButtons = () => (
    <View className="flex-row justify-center my-3">
      <TouchableOpacity
        className={`px-4 py-2 mx-1 rounded-full ${filter === 'all' ? 'bg-gray-200' : 'bg-gray-50'}`}
        onPress={() => setFilter('all')}
      >
        <Text className={`${filter === 'all' ? 'font-bold' : 'text-gray-500'}`}>すべて</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={`px-4 py-2 mx-1 rounded-full ${filter === 'yes' ? 'bg-blue-100' : 'bg-gray-50'}`}
        onPress={() => setFilter('yes')}
      >
        <Text className={`${filter === 'yes' ? 'font-bold text-blue-600' : 'text-gray-500'}`}>Yes</Text>
      </TouchableOpacity>
      <TouchableOpacity
        className={`px-4 py-2 mx-1 rounded-full ${filter === 'no' ? 'bg-red-100' : 'bg-gray-50'}`}
        onPress={() => setFilter('no')}
      >
        <Text className={`${filter === 'no' ? 'font-bold text-red-600' : 'text-gray-500'}`}>No</Text>
      </TouchableOpacity>
    </View>
  );
  
  // ローディング表示
  if (loading && !refreshing) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row justify-between items-center px-6 pt-10 pb-4">
          <TouchableOpacity onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-xl font-bold ml-2">スワイプ履歴</Text>
          <View style={{ width: 24 }} /> {/* バランス用の空のビュー */}
        </View>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-500">読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* ヘッダー */}
      <View className="flex-row justify-between items-center px-6 pt-10 pb-2">
        <TouchableOpacity onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View className="flex-row items-center">
          <Text className="text-xl font-bold ml-2">スワイプ履歴</Text>
          <Text className="text-gray-500 ml-2">({swipeHistory.length})</Text>
        </View>
        <View style={{ width: 24 }} /> {/* バランス用の空のビュー */}
      </View>
      
      {/* フィルター */}
      {renderFilterButtons()}
      
      {/* 商品リスト */}
      <View className="flex-1 px-4">
        {swipeHistory.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Ionicons name="time-outline" size={64} color="#E5E7EB" />
            <Text className="mt-4 text-gray-400 text-lg">スワイプ履歴はまだありません</Text>
            <Text className="mt-2 text-gray-400 text-sm text-center px-10">
              スワイプ画面でYes/Noで評価した商品がここに表示されます
            </Text>
          </View>
        ) : (
          <FlatList
            data={swipeHistory}
            keyExtractor={(item) => item.id}
            numColumns={COLUMN_NUM}
            contentContainerStyle={styles.listContainer}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
            }
            renderItem={({ item, index }) => (
              <View style={styles.cardContainer}>
                <View className="relative">
                  <ProductCard
                    product={item}
                    onPress={() => handleProductPress(item)}
                  />
                  {/* フィルターがallの場合、Yes/No表示 */}
                  {filter === 'all' && (
                    <View
                      style={[
                        styles.resultBadge,
                        { backgroundColor: index % 2 === 0 ? '#3B82F6' : '#F87171' } // 偶数番目はYes
                      ]}
                    >
                      <Text className="text-white text-xs font-bold">
                        {index % 2 === 0 ? 'Yes' : 'No'}
                      </Text>
                    </View>
                  )}
                  
                  {/* お気に入りに追加ボタン（お気に入りでない場合のみ表示） */}
                  {!isFavorite(item.id) && (
                    <TouchableOpacity
                      style={styles.favoriteButton}
                      onPress={() => handleAddToFavorite(item.id)}
                    >
                      <Ionicons name="heart-outline" size={20} color="#6B7280" />
                    </TouchableOpacity>
                  )}
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
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
});

export default SwipeHistoryScreen;