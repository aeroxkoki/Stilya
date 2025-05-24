import React from 'react';
import { View, Text, FlatList, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import { ProductCard } from '@/components/common';
import { Product } from '@/types';

interface RecommendListProps {
  title: string;
  products: Product[];
  loading: boolean;
  error: string | null;
  onProductPress: (product: Product) => void;
  emptyMessage?: string;
}

const { width } = Dimensions.get('window');
const COLUMN_NUM = 2;
const CARD_WIDTH = (width - 24 - 8 * (COLUMN_NUM - 1)) / COLUMN_NUM; // Padding + Gap

const RecommendList: React.FC<RecommendListProps> = ({
  title,
  products,
  loading,
  error,
  onProductPress,
  emptyMessage = 'おすすめの商品がありません'
}) => {
  // ローディング表示
  if (loading) {
    return (
      <View className="py-4">
        <Text className="text-lg font-bold mb-3 px-4">{title}</Text>
        <View className="items-center justify-center py-12">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-500">商品を読み込み中...</Text>
        </View>
      </View>
    );
  }
  
  // エラー表示
  if (error) {
    return (
      <View className="py-4">
        <Text className="text-lg font-bold mb-3 px-4">{title}</Text>
        <View className="items-center justify-center py-12">
          <Text className="text-red-500 mb-2">エラーが発生しました</Text>
          <Text className="text-gray-700 text-center">{error}</Text>
        </View>
      </View>
    );
  }
  
  // 商品がない場合
  if (products.length === 0) {
    return (
      <View className="py-4">
        <Text className="text-lg font-bold mb-3 px-4">{title}</Text>
        <View className="items-center justify-center py-12">
          <Text className="text-gray-500">{emptyMessage}</Text>
        </View>
      </View>
    );
  }
  
  return (
    <View className="py-4">
      <Text className="text-lg font-bold mb-3 px-4">{title}</Text>
      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        numColumns={COLUMN_NUM}
        renderItem={({ item }) => (
          <View style={styles.cardContainer}>
            <ProductCard
              product={item}
              onPress={() => onProductPress(item)}
              showTags={true}
            />
          </View>
        )}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 12,
  },
  cardContainer: {
    width: CARD_WIDTH,
    margin: 4,
  }
});

export default RecommendList;