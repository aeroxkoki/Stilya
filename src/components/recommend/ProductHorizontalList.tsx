import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, ViewStyle } from 'react-native';
import { Product } from '@/types';

interface ProductHorizontalListProps {
  title: string;
  products: Product[];
  onProductPress: (product: Product) => void;
  onSeeAllPress?: () => void;
  loading?: boolean;
  error?: string | null;
  emptyMessage?: string;
  style?: ViewStyle;
}

const ProductHorizontalList: React.FC<ProductHorizontalListProps> = ({
  title,
  products,
  onProductPress,
  onSeeAllPress,
  loading = false,
  error = null,
  emptyMessage = 'No products available',
  style,
}) => {
  // 商品が無い場合は何も表示しない
  if (!products || products.length === 0) {
    return null;
  }

  return (
    <View style={[styles.container, style]}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {onSeeAllPress && (
          <TouchableOpacity onPress={onSeeAllPress}>
            <Text style={styles.seeAll}>すべて見る</Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {products.map((product) => (
          <TouchableOpacity
            key={product.id}
            style={styles.productItem}
            onPress={() => onProductPress(product)}
          >
            <View style={styles.productCard}>
              <Image
                source={{ uri: product.imageUrl }}
                style={styles.productImage}
                resizeMode="cover"
              />
              <View style={styles.productInfo}>
                <Text style={styles.productBrand} numberOfLines={1}>
                  {product.brand || ''}
                </Text>
                <Text style={styles.productTitle} numberOfLines={2}>
                  {product.title}
                </Text>
                <Text style={styles.productPrice}>
                  ¥{product.price.toLocaleString()}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  seeAll: {
    fontSize: 14,
    color: '#3B82F6',
    fontWeight: '500',
  },
  scrollContent: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  productItem: {
    width: 160,
    marginRight: 12,
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  productImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#f5f5f5',
  },
  productInfo: {
    padding: 12,
  },
  productBrand: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 8,
    height: 40,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
});

export default ProductHorizontalList;
