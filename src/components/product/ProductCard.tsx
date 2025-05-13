import React from 'react';
import { StyleSheet, TouchableOpacity, Text, View, ViewStyle } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';
import { Product } from '@/types/product';

interface ProductCardProps {
  product: Product;
  onPress: (productId: string) => void;
  style?: ViewStyle;
  compact?: boolean; // コンパクトモード（関連商品表示用）
  isFavorite?: boolean;
  onFavoriteToggle?: (productId: string) => void;
}

/**
 * 商品カードコンポーネント
 * 通常版と関連商品用のコンパクト版をサポート
 */
const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  style,
  compact = false,
  isFavorite = false,
  onFavoriteToggle,
}) => {
  // 価格フォーマット
  const formatPrice = (price: number): string => {
    return price.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' });
  };

  // お気に入りボタンのハンドラ
  const handleFavoritePress = (e: any) => {
    e.stopPropagation();
    if (onFavoriteToggle) {
      onFavoriteToggle(product.id);
    }
  };

  // コンパクトモード（関連商品表示用）
  if (compact) {
    return (
      <TouchableOpacity
        style={[styles.compactContainer, style]}
        onPress={() => onPress(product.id)}
        activeOpacity={0.8}
      >
        <View style={styles.compactImageWrapper}>
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.compactImage}
            contentFit="cover"
            transition={200}
          />
        </View>
        
        <View style={styles.compactContent}>
          <Text style={styles.compactBrand} numberOfLines={1}>
            {product.brand}
          </Text>
          <Text style={styles.compactTitle} numberOfLines={2}>
            {product.title}
          </Text>
          <Text style={styles.compactPrice}>
            {formatPrice(product.price)}
          </Text>
        </View>
      </TouchableOpacity>
    );
  }

  // 通常の表示モード
  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={() => onPress(product.id)}
      activeOpacity={0.9}
    >
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: product.imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={300}
        />
        
        {onFavoriteToggle && (
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleFavoritePress}
          >
            <Feather 
              name={isFavorite ? "heart" : "heart"} 
              size={20} 
              color={isFavorite ? "#F87171" : "#FFFFFF"} 
            />
          </TouchableOpacity>
        )}
      </View>
      
      <View style={styles.infoContainer}>
        <Text style={styles.brand} numberOfLines={1}>
          {product.brand}
        </Text>
        <Text style={styles.title} numberOfLines={2}>
          {product.title}
        </Text>
        <Text style={styles.price}>
          {formatPrice(product.price)}
        </Text>
        
        {/* タグ表示（1つだけ表示） */}
        {product.tags && product.tags.length > 0 && (
          <View style={styles.tagContainer}>
            <Text style={styles.tag}>{product.tags[0]}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  // 通常カード用スタイル
  container: {
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 3,
    width: '100%',
    marginBottom: 16,
  },
  imageContainer: {
    position: 'relative',
    height: 220,
    backgroundColor: '#f5f5f5',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  favoriteButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoContainer: {
    padding: 12,
  },
  brand: {
    fontSize: 13,
    color: '#666',
    marginBottom: 4,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
    lineHeight: 20,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: '#3B82F6',
    marginBottom: 8,
  },
  tagContainer: {
    flexDirection: 'row',
  },
  tag: {
    fontSize: 12,
    color: '#666',
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    overflow: 'hidden',
  },
  
  // コンパクトカード用スタイル
  compactContainer: {
    width: 150,
    backgroundColor: 'white',
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  compactImageWrapper: {
    width: '100%',
    height: 170,
    backgroundColor: '#f5f5f5',
  },
  compactImage: {
    width: '100%',
    height: '100%',
  },
  compactContent: {
    padding: 8,
  },
  compactBrand: {
    fontSize: 11,
    color: '#666',
    marginBottom: 2,
  },
  compactTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
    lineHeight: 16,
    height: 32,
  },
  compactPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3B82F6',
  },
});

export default ProductCard;
