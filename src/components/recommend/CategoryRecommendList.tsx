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
      <View >
        <Text >カテゴリ別おすすめ</Text>
        <View >
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text >商品を読み込み中...</Text>
        </View>
      </View>
    );
  }
  
  // エラー表示
  if (error) {
    return (
      <View >
        <Text >カテゴリ別おすすめ</Text>
        <View >
          <Text >エラーが発生しました</Text>
          <Text >{error}</Text>
        </View>
      </View>
    );
  }
  
  // カテゴリがない場合
  if (Object.keys(categories).length === 0) {
    return (
      <View >
        <Text >カテゴリ別おすすめ</Text>
        <View >
          <Text >おすすめアイテムがありません</Text>
        </View>
      </View>
    );
  }
  
  return (
    <View >
      <Text >カテゴリ別おすすめ</Text>
      <ScrollView>
        {Object.entries(categories).map(([category, products]) => {
          if (products.length === 0) return null;
          
          return (
            <View key={category} >
              <Text >
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
