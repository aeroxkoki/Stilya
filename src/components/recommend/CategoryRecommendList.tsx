import React from 'react';
import { 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  StyleSheet, 
  Dimensions,
  ScrollView
} from 'react-native';
import { ProductCard } from '@/components/common';
import { Product } from '@/types';

interface CategoryRecommendListProps {
  categories: Record<string, Product[]>;
  loading: boolean;
  error: string | null;
  onProductPress: (product: Product) => void;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.4; // カードは画面の40%幅に

const categoryNameMap: Record<string, string> = {
  'tops': 'トップス',
  'bottoms': 'ボトムス',
  'outerwear': 'アウター',
  'accessories': 'アクセサリー',
  'shoes': 'シューズ',
  'bags': 'バッグ',
  'dresses': 'ワンピース',
  'sets': 'セットアップ'
};

const CategoryRecommendList: React.FC<CategoryRecommendListProps> = ({
  categories,
  loading,
  error,
  onProductPress
}) => {
  // ローディング表示
  if (loading) {
    return (
      <View className="py-4">
        <Text className="text-lg font-bold mb-3 px-4">カテゴリ別おすすめ</Text>
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
        <Text className="text-lg font-bold mb-3 px-4">カテゴリ別おすすめ</Text>
        <View className="items-center justify-center py-12">
          <Text className="text-red-500 mb-2">エラーが発生しました</Text>
          <Text className="text-gray-700 text-center">{error}</Text>
        </View>
      </View>
    );
  }
  
  // カテゴリがない場合
  if (Object.keys(categories).length === 0) {
    return (
      <View className="py-4">
        <Text className="text-lg font-bold mb-3 px-4">カテゴリ別おすすめ</Text>
        <View className="items-center justify-center py-12">
          <Text className="text-gray-500">おすすめアイテムがありません</Text>
        </View>
      </View>
    );
  }
  
  return (
    <View className="py-4">
      <Text className="text-lg font-bold mb-3 px-4">カテゴリ別おすすめ</Text>
      <ScrollView>
        {Object.entries(categories).map(([category, products]) => {
          if (products.length === 0) return null;
          
          return (
            <View key={category} className="mb-6">
              <Text className="text-base font-medium mb-2 px-4">
                {categoryNameMap[category] || category}
              </Text>
              <FlatList
                data={products}
                keyExtractor={(item) => item.id}
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.listContainer}
                renderItem={({ item }) => (
                  <View style={styles.cardContainer}>
                    <ProductCard
                      product={item}
                      onPress={() => onProductPress(item)}
                      showTags={false}
                      compact={true}
                    />
                  </View>
                )}
              />
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  listContainer: {
    paddingHorizontal: 12,
  },
  cardContainer: {
    width: CARD_WIDTH,
    marginHorizontal: 4,
  }
});

export default CategoryRecommendList;
