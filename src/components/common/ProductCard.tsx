import React from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../../contexts/ThemeContext';
import { Product } from '../../types/product';
import CachedImage from './CachedImage';

interface ProductCardProps {
  product: Product;
  onPress: (productId: string) => void;
  style?: StyleProp<ViewStyle>;
  showFavoriteButton?: boolean;
  isFavorite?: boolean;
  onFavoritePress?: (productId: string) => void;
  horizontal?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  style,
  showFavoriteButton = false,
  isFavorite = false,
  onFavoritePress,
  horizontal = false,
}) => {
  const { theme } = useTheme();

  // 価格フォーマット
  const formatPrice = (price: number): string => {
    return price.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' });
  };

  // お気に入りボタンのハンドラ
  const handleFavoritePress = () => {
    if (onFavoritePress) {
      onFavoritePress(product.id);
    }
  };

  return (
    <TouchableOpacity
      style={[
        styles.container,
        horizontal ? styles.horizontalContainer : styles.verticalContainer,
        { borderRadius: theme.radius.m, backgroundColor: theme.colors.background.card },
        style,
      ]}
      onPress={() => onPress(product.id)}
      activeOpacity={0.7}
    >
      <View style={[styles.imageContainer, horizontal && styles.horizontalImageContainer]}>
        <CachedImage
          uri={product.imageUrl}
          style={styles.image}
          resizeMode="cover"
        />
        
        {showFavoriteButton && (
          <TouchableOpacity
            style={[
              styles.favoriteButton,
              { backgroundColor: theme.colors.background.main },
            ]}
            onPress={handleFavoritePress}
            hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
          >
            <Feather
              name={isFavorite ? 'heart' : 'heart'}
              size={16}
              color={isFavorite ? theme.colors.status.error : theme.colors.text.hint}
            />
          </TouchableOpacity>
        )}
      </View>

      <View style={styles.infoContainer}>
        <Text style={[styles.brand, { color: theme.colors.text.secondary }]}>
          {product.brand}
        </Text>
        
        <Text
          style={[styles.title, { color: theme.colors.text.primary }]}
          numberOfLines={2}
          ellipsizeMode="tail"
        >
          {product.title}
        </Text>
        
        <Text style={[styles.price, { color: theme.colors.primary }]}>
          {formatPrice(product.price)}
        </Text>

        <View style={styles.tagsContainer}>
          {product.tags.slice(0, horizontal ? 1 : 2).map((tag, index) => (
            <View
              key={index}
              style={[
                styles.tag,
                { backgroundColor: theme.colors.background.input },
              ]}
            >
              <Text
                style={[styles.tagText, { color: theme.colors.text.secondary }]}
                numberOfLines={1}
              >
                {tag}
              </Text>
            </View>
          ))}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  verticalContainer: {
    width: '100%',
    maxWidth: 180,
  },
  horizontalContainer: {
    flexDirection: 'row',
    width: '100%',
    height: 120,
  },
  imageContainer: {
    position: 'relative',
  },
  horizontalImageContainer: {
    width: 120,
    height: '100%',
  },
  image: {
    width: '100%',
    aspectRatio: horizontal ? undefined : 1,
    height: horizontal ? '100%' : undefined,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  infoContainer: {
    padding: 12,
    flex: 1,
  },
  brand: {
    fontSize: 12,
    marginBottom: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    height: 40,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 10,
  },
});

export default ProductCard;
