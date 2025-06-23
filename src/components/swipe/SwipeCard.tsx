import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '@/types';
import { formatPrice } from '@/utils';
import { useStyle } from '@/contexts/ThemeContext';

interface SwipeCardProps {
  product: Product;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onPress?: () => void;
  onLongPress?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
  testID?: string;
}

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = height * 0.6;

const SwipeCard: React.FC<SwipeCardProps> = ({ 
  product, 
  onSwipeLeft,
  onSwipeRight,
  onPress,
  onLongPress,
  onSave,
  isSaved = false,
  testID
}) => {
  const { theme } = useStyle();
  // imageUrlとimage_urlの両方の形式に対応
  const imageUrl = product.imageUrl || product.image_url || 'https://via.placeholder.com/350x500?text=No+Image';
  
  // デバッグ情報
  console.log('[SwipeCard] Product:', {
    id: product.id,
    title: product.title,
    imageUrl: imageUrl,
    originalImageUrl: product.imageUrl,
    originalImageUrl2: product.image_url
  });

  return (
    <View style={styles.card} testID={testID || 'swipe-card'}>
      <TouchableOpacity
        style={styles.cardContent}
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={500}
        testID="swipe-card-touch"
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
          testID="product-image"
          priority="high"
          cachePolicy="memory-disk"
          transition={300}
          placeholder={{ uri: 'https://via.placeholder.com/50x50?text=Loading' }}
        />
        
        {/* 中古品ラベル */}
        {product.isUsed && (
          <View style={styles.usedLabel}>
            <Text style={styles.usedLabelText}>中古</Text>
          </View>
        )}
        
        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <View style={styles.productDetails}>
              <Text style={styles.productTitle} numberOfLines={1}>
                {product.title}
              </Text>
              {product.brand && (
                <Text style={styles.productBrand} numberOfLines={1}>
                  {product.brand}
                </Text>
              )}
            </View>
            <Text style={styles.productPrice}>
              {formatPrice(product.price)}
            </Text>
          </View>
          
          {product.tags && product.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {product.tags.slice(0, 3).map((tag, index) => (
                <View key={index} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
          
          {/* 長押しインストラクション */}
          <View style={styles.instructionContainer}>
            <Ionicons name="finger-print-outline" size={14} color="rgba(255, 255, 255, 0.6)" />
            <Text style={styles.instructionText}>長押しでクイックビュー</Text>
          </View>
        </View>
        
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.noButton]}
            onPress={onSwipeLeft}
            testID="swipe-left-button"
          >
            <Ionicons name="close" size={32} color="#F87171" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.saveButton]}
            onPress={onSave}
            testID="save-button"
          >
            <Ionicons 
              name={isSaved ? "bookmark" : "bookmark-outline"} 
              size={28} 
              color={isSaved ? "#10B981" : "#6B7280"} 
            />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.yesButton]}
            onPress={onSwipeRight}
            testID="swipe-right-button"
          >
            <Ionicons name="heart" size={32} color="#3B82F6" />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 12,
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  cardContent: {
    flex: 1,
    borderRadius: 12,
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
    backgroundColor: 'rgba(245, 158, 11, 0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  usedLabelText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  productInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 16,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productDetails: {
    flex: 1,
  },
  productTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  productBrand: {
    color: '#E5E7EB',
    fontSize: 16,
  },
  productPrice: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    marginTop: 8,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 4,
    marginBottom: 4,
  },
  tagText: {
    color: 'white',
    fontSize: 12,
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    opacity: 0.8,
  },
  instructionText: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 12,
    marginLeft: 4,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 120,
    left: 16,
    right: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  noButton: {},
  yesButton: {},
  saveButton: {},
});

export default SwipeCard;