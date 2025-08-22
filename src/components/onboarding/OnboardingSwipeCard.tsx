import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import CachedImage from '@/components/common/CachedImage';
import { Product } from '@/types';
import { formatPrice } from '@/utils';
import { getProductImageUrl } from '@/utils/imageUtils';

interface OnboardingSwipeCardProps {
  product: Product;
  testID?: string;
}

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.88;
const CARD_HEIGHT = height * 0.6;

const OnboardingSwipeCard: React.FC<OnboardingSwipeCardProps> = ({ 
  product, 
  testID
}) => {
  // 統一された画像URL取得関数を使用
  const imageUrl = getProductImageUrl(product);

  return (
    <View style={styles.card} testID={testID || 'onboarding-swipe-card'}>
      <View style={styles.cardContent}>
        <CachedImage
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
          testID="product-image"
          showLoadingIndicator={true}
          debugMode={false}
        />
        
        {/* 中古品ラベル */}
        {product.isUsed && (
          <View style={styles.usedLabel}>
            <Text style={styles.usedLabelText}>中古</Text>
          </View>
        )}
        
        {/* グラデーションオーバーレイ */}
        <View style={styles.gradientOverlay} />
        
        {/* 商品情報 */}
        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <View style={styles.productDetails}>
              <Text style={styles.productTitle} numberOfLines={2}>
                {product.title}
              </Text>
              {product.brand && (
                <Text style={styles.productBrand} numberOfLines={1}>
                  {product.brand}
                </Text>
              )}
            </View>
          </View>
          
          <Text style={styles.productPrice}>
            {formatPrice(product.price)}
          </Text>
          
          {product.tags && product.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {product.tags.slice(0, 3).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
  cardContent: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    flex: 1,
  },
  usedLabel: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: 'rgba(251, 146, 60, 0.95)',
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
  },
  usedLabelText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '700',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: CARD_HEIGHT * 0.5,
    backgroundColor: 'transparent',
    // グラデーション効果を作成
    // React Native doesn't support linear-gradient directly, but we can simulate it
    // with multiple views or use expo-linear-gradient if needed
  },
  productInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 20,
    paddingBottom: 24,
  },
  productHeader: {
    marginBottom: 8,
  },
  productDetails: {
    flex: 1,
  },
  productTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: 4,
  },
  productBrand: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 17,
    fontWeight: '500',
  },
  productPrice: {
    color: 'white',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
  },
});

export default OnboardingSwipeCard;
