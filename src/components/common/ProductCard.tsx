import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Product } from '@/types';
import { formatPrice } from '@/utils';

export interface ProductCardProps {
  product: Product;
  onPress?: () => void;
  showTags?: boolean;
  withBorderRadius?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  showTags = true,
  withBorderRadius = true,
}) => {
  return (
    <TouchableOpacity
      className={`bg-white overflow-hidden ${withBorderRadius ? 'rounded-lg' : ''} shadow-sm border border-gray-100`}
      activeOpacity={0.7}
      onPress={onPress}
    >
      <Image
        source={{ uri: product.imageUrl }}
        className="w-full h-64"
        style={styles.image}
      />
      <View className="p-3">
        <View className="flex-row justify-between items-start">
          <View className="flex-1">
            <Text className="text-gray-900 font-medium text-base mb-1" numberOfLines={1}>
              {product.title}
            </Text>
            {product.brand && (
              <Text className="text-gray-500 text-sm mb-1" numberOfLines={1}>
                {product.brand}
              </Text>
            )}
          </View>
          <Text className="text-primary font-bold text-base">
            {formatPrice(product.price)}
          </Text>
        </View>
        
        {showTags && product.tags && product.tags.length > 0 && (
          <View className="flex-row flex-wrap mt-2">
            {product.tags.slice(0, 3).map((tag, index) => (
              <View
                key={index}
                className="bg-gray-100 px-2 py-1 rounded-md mr-1 mb-1"
              >
                <Text className="text-gray-600 text-xs">{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  image: {
    resizeMode: 'cover',
  },
});

export default ProductCard;
