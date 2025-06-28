import React, { useRef } from 'react';
import {
  TouchableOpacity,
  View,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
  Animated,
  LayoutAnimation,
  Platform,
  UIManager,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useStyle } from '@/contexts/ThemeContext';
import { Product } from '@/types';
import CachedImage from './CachedImage';
import { getProductImageUrl } from '@/utils/imageUtils';

// LayoutAnimationをAndroidで有効化
if (Platform.OS === 'android') {
  if (UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
}

interface ProductCardProps {
  product: Product;
  onPress: (productId: string) => void;
  style?: StyleProp<ViewStyle>;
  showFavoriteButton?: boolean;
  isFavorite?: boolean;
  onFavoritePress?: (productId: string) => void;
  horizontal?: boolean;
  showTags?: boolean;
  compact?: boolean;
}

const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onPress,
  style,
  showFavoriteButton = false,
  isFavorite = false,
  onFavoritePress,
  horizontal = false,
  showTags = true,
  compact = false,
}) => {
  const { theme, isDarkMode } = useStyle();
  const scaleAnim = useRef(new Animated.Value(1)).current;

  // 価格フォーマット
  const formatPrice = (price: number): string => {
    return price.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' });
  };

  // お気に入りボタンのハンドラ
  const handleFavoritePress = () => {
    if (onFavoritePress) {
      // ハートアニメーション
      LayoutAnimation.configureNext(LayoutAnimation.Presets.spring);
      onFavoritePress(product.id);
    }
  };

  // カードのタッチエフェクト
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      friction: 5,
      tension: 150,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <TouchableOpacity
        style={[
          styles.container,
          horizontal ? styles.horizontalContainer : styles.verticalContainer,
          compact && styles.compactContainer,
          { 
            borderRadius: theme.radius.m, 
            backgroundColor: theme.colors.card.background,
            shadowColor: isDarkMode ? '#000' : '#222',
            borderColor: theme.colors.border,
            borderWidth: isDarkMode ? 1 : 0,
          },
          style,
        ]}
        onPress={() => onPress(product.id)}
        activeOpacity={0.9}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={[
          styles.imageContainer, 
          horizontal && styles.horizontalImageContainer,
          compact && styles.compactImageContainer
        ]}>
          <CachedImage
            source={{ uri: getProductImageUrl(product) }}
            style={styles.image}
            resizeMode="cover"
            showLoadingIndicator={true}
          />
          
          {/* 中古品ラベル */}
          {product.isUsed && (
            <View style={[
              styles.usedLabel,
              { backgroundColor: theme.colors.status.warning || 'rgba(245, 158, 11, 0.9)' }
            ]}>
              <Text style={styles.usedLabelText}>中古</Text>
            </View>
          )}
          
          {showFavoriteButton && (
            <TouchableOpacity
              style={[
                styles.favoriteButton,
                { 
                  backgroundColor: isDarkMode 
                    ? 'rgba(0, 0, 0, 0.5)' 
                    : 'rgba(255, 255, 255, 0.8)',
                  borderWidth: 1,
                  borderColor: isFavorite 
                    ? theme.colors.status.error 
                    : 'transparent',
                },
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

        <View style={[styles.infoContainer, compact && styles.compactInfoContainer]}>
          {product.brand && (
            <Text style={[
              styles.brand, 
              compact && styles.compactBrand,
              { color: theme.colors.text.secondary }
            ]}>
              {product.brand}
            </Text>
          )}
          
          <Text
            style={[
              styles.title, 
              compact && styles.compactTitle,
              { color: theme.colors.text.primary }
            ]}
            numberOfLines={compact ? 1 : 2}
            ellipsizeMode="tail"
          >
            {product.title}
          </Text>
          
          <Text style={[
            styles.price, 
            compact && styles.compactPrice,
            { color: theme.colors.primary }
          ]}>
            {formatPrice(product.price)}
          </Text>

          {showTags && product.tags && product.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {product.tags.slice(0, compact ? 1 : (horizontal ? 1 : 2)).map((tag, index) => (
                <View
                  key={index}
                  style={[
                    styles.tag,
                    compact && styles.compactTag,
                    { 
                      backgroundColor: isDarkMode 
                        ? 'rgba(255, 255, 255, 0.1)' 
                        : theme.colors.input.background
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.tagText, 
                      compact && styles.compactTagText,
                      { color: theme.colors.text.secondary }
                    ]}
                    numberOfLines={1}
                  >
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
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
  compactContainer: {
    maxWidth: 160,
  },
  imageContainer: {
    position: 'relative',
    overflow: 'hidden',
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },
  horizontalImageContainer: {
    width: 120,
    height: '100%',
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 8,
  },
  compactImageContainer: {
    height: 140,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    height: undefined,
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
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  usedLabel: {
    position: 'absolute',
    top: 8,
    left: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  usedLabelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoContainer: {
    padding: 12,
    flex: 1,
  },
  compactInfoContainer: {
    padding: 8,
  },
  brand: {
    fontSize: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  compactBrand: {
    fontSize: 10,
    marginBottom: 2,
  },
  title: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    height: 40,
  },
  compactTitle: {
    fontSize: 12,
    marginBottom: 4,
    height: 'auto',
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  compactPrice: {
    fontSize: 14,
    marginBottom: 4,
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
  compactTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 4,
  },
  tagText: {
    fontSize: 10,
  },
  compactTagText: {
    fontSize: 8,
  },
});

export default ProductCard;
