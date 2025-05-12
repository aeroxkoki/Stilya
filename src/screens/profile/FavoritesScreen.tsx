import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  FlatList, 
  TouchableOpacity, 
  ActivityIndicator, 
  StyleSheet,
  Dimensions
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

const FavoritesScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { 
    favorites, 
    getFavorites, 
    removeFromFavorites, 
    loading 
  } = useProductStore();
  
  // 初回表示時にデータを取得
  useEffect(() => {
    const loadFavorites = async () => {
      if (user) {
        await getFavorites(user.id);
      }
    };
    
    loadFavorites();
  }, [user]);
  
  // 商品タップハンドラー
  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail' as never, { productId: product.id } as never);
  };
  
  // お気に入り削除ハンドラー
  const handleRemoveFavorite = (productId: string) => {
    if (user) {
      removeFromFavorites(user.id, productId);
    }
  };
  
  // 戻るボタン
  const handleBackPress = () => {
    navigation.goBack();
  };
  
  // ローディング表示
  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-row justify-between items-center px-6 pt-10 pb-4">
          <TouchableOpacity onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text className="text-xl font-bold ml-2">お気に入り</Text>
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
      <View className="flex-row justify-between items-center px-6 pt-10 pb-4">
        <TouchableOpacity onPress={handleBackPress}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <View className="flex-row items-center">
          <Text className="text-xl font-bold ml-2">お気に入り</Text>
          <Text className="text-gray-500 ml-2">({favorites.length})</Text>
        </View>
        <View style={{ width: 24 }} /> {/* バランス用の空のビュー */}
      </View>
      
      {/* 商品リスト */}
      <View className="flex-1 px-4">
        {favorites.length === 0 ? (
          <View className="flex-1 items-center justify-center">
            <Ionicons name="heart-outline" size={64} color="#E5E7EB" />
            <Text className="mt-4 text-gray-400 text-lg">お気に入りはまだありません</Text>
            <Text className="mt-2 text-gray-400 text-sm text-center px-10">
              スワイプ画面で「いいね」した商品や詳細画面でお気に入り登録した商品がここに表示されます
            </Text>
          </View>
        ) : (
          <FlatList
            data={favorites}
            keyExtractor={(item) => item.id}
            numColumns={COLUMN_NUM}
            contentContainerStyle={styles.listContainer}
            renderItem={({ item }) => (
              <View style={styles.cardContainer}>
                <View className="relative">
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
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
});

export default FavoritesScreen;