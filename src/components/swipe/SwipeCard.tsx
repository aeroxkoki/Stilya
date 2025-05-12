import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '@/types';
import { formatPrice } from '@/utils';

export interface SwipeCardProps {
  product: Product;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onPress?: () => void;
}

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = height * 0.6;

const SwipeCard: React.FC<SwipeCardProps> = ({ product, onPress }) => {
  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="bg-white rounded-xl shadow-lg overflow-hidden"
      style={styles.card}
    >
      <Image
        source={{ uri: product.imageUrl }}
        style={styles.image}
        className="w-full"
      />
      
      <View className="absolute bottom-0 left-0 right-0 bg-black/50 p-4">
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <Text className="text-white font-bold text-xl" numberOfLines={1}>
              {product.title}
            </Text>
            {product.brand && (
              <Text className="text-gray-200 text-base" numberOfLines={1}>
                {product.brand}
              </Text>
            )}
          </View>
          <Text className="text-white font-bold text-xl ml-2">
            {formatPrice(product.price)}
          </Text>
        </View>
        
        {product.tags && product.tags.length > 0 && (
          <View className="flex-row flex-wrap mt-2">
            {product.tags.slice(0, 4).map((tag, index) => (
              <View
                key={index}
                className="bg-black/30 px-2 py-1 rounded-full mr-1 mb-1"
              >
                <Text className="text-white text-xs">{tag}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
      
      {/* スワイプアクションボタン（プレースホルダー） */}
      <View className="absolute bottom-28 left-4 right-4 flex-row justify-between">
        <TouchableOpacity className="w-16 h-16 bg-white rounded-full items-center justify-center shadow-md">
          <Ionicons name="close" size={32} color="#F87171" />
        </TouchableOpacity>
        
        <TouchableOpacity className="w-16 h-16 bg-white rounded-full items-center justify-center shadow-md">
          <Ionicons name="heart" size={32} color="#3B82F6" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  }
});

export default SwipeCard;
