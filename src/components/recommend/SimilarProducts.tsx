import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  Dimensions 
} from 'react-native';
import { Product } from '@/types';
import { formatPrice } from '@/utils';

interface SimilarProductsProps {
  products: Product[];
  onProductPress: (product: Product) => void;
  title?: string;
  loading?: boolean;
}

const { width } = Dimensions.get('window');
const CARD_WIDTH = width / 2.5;
const IMAGE_HEIGHT = CARD_WIDTH;

const SimilarProducts: React.FC<SimilarProductsProps> = ({ 
  products, 
  onProductPress, 
  title = '類似アイテム',
  loading = false
}) => {
  if (products.length === 0 && !loading) {
    return null;
  }
  
  return (
    <View className="mb-6">
      <Text className="text-lg font-bold mb-3 px-4">{title}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {products.map(product => (
          <TouchableOpacity
            key={product.id}
            style={styles.card}
            className="mr-4 bg-white rounded-lg shadow-sm overflow-hidden"
            onPress={() => onProductPress(product)}
          >
            <Image
              source={{ uri: product.imageUrl }}
              style={styles.image}
              resizeMode="cover"
            />
            <View className="p-2">
              {product.brand && (
                <Text className="text-xs text-gray-600" numberOfLines={1}>
                  {product.brand}
                </Text>
              )}
              <Text className="text-sm font-medium mt-1" numberOfLines={2}>
                {product.title}
              </Text>
              <Text className="text-sm font-bold text-blue-600 mt-1">
                {formatPrice(product.price)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
        
        {/* 最後に空のView（右側の余白） */}
        {products.length > 0 && <View style={{ width: 12 }} />}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    paddingLeft: 16,
    paddingVertical: 8
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 8,
  },
  image: {
    width: CARD_WIDTH,
    height: IMAGE_HEIGHT,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  }
});

export default SimilarProducts;
