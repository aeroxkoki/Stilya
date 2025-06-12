import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '../../types';
import { formatPrice } from '../../utils';
import { useAuth } from '../../hooks/useAuth';
import { savedItemsService } from '../../services/savedItemsService';
import Toast from 'react-native-toast-message';

interface SwipeCardEnhancedProps {
  product: Product;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSave?: () => void;
  onPress?: () => void;
  onLongPress?: () => void;
  testID?: string;
}

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = height * 0.6;

const SwipeCardEnhanced: React.FC<SwipeCardEnhancedProps> = ({ 
  product, 
  onSwipeLeft,
  onSwipeRight,
  onSave,
  onPress,
  onLongPress,
  testID
}) => {
  const { user } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [isLoadingSave, setIsLoadingSave] = useState(false);
  
  // imageUrlとimage_urlの両方の形式に対応
  const imageUrl = product.imageUrl || product.image_url || 'https://via.placeholder.com/350x500?text=No+Image';
  
  // セール情報の計算
  const isOnSale = product.isSale || (product.originalPrice && product.originalPrice > product.price);
  const discountPercentage = product.discountPercentage || 
    (product.originalPrice ? Math.round((1 - product.price / product.originalPrice) * 100) : 0);

  // 保存状態の確認
  useEffect(() => {
    const checkSavedStatus = async () => {
      if (user?.id && product.id) {
        const saved = await savedItemsService.isItemSaved(user.id, product.id);
        setIsSaved(saved);
      }
    };
    checkSavedStatus();
  }, [user?.id, product.id]);

  // 保存ボタンのハンドラー
  const handleSavePress = async () => {
    if (!user?.id) {
      Toast.show({
        type: 'error',
        text1: 'ログインが必要です',
        text2: '保存機能を使うにはログインしてください',
      });
      return;
    }

    setIsLoadingSave(true);
    try {
      if (isSaved) {
        const success = await savedItemsService.unsaveItem(user.id, product.id);
        if (success) {
          setIsSaved(false);
          Toast.show({
            type: 'success',
            text1: '保存を解除しました',
          });
        }
      } else {
        const success = await savedItemsService.saveItem(user.id, product.id);
        if (success) {
          setIsSaved(true);
          Toast.show({
            type: 'success',
            text1: 'アイテムを保存しました',
            text2: '保存リストで確認できます',
          });
        }
      }
      
      if (onSave) {
        onSave();
      }
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'エラーが発生しました',
        text2: 'もう一度お試しください',
      });
    } finally {
      setIsLoadingSave(false);
    }
  };

  return (
    <View style={styles.card} testID={testID || 'swipe-card'}>
      {/* セールバッジ */}
      {isOnSale && (
        <View style={styles.saleBadge}>
          <Text style={styles.saleBadgeText}>SALE -{discountPercentage}%</Text>
        </View>
      )}
      
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
        />
        
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
            <View style={styles.priceContainer}>
              {product.originalPrice && product.originalPrice > product.price ? (
                <>
                  <Text style={styles.originalPrice}>
                    {formatPrice(product.originalPrice)}
                  </Text>
                  <Text style={styles.salePrice}>
                    {formatPrice(product.price)}
                  </Text>
                </>
              ) : (
                <Text style={styles.productPrice}>
                  {formatPrice(product.price)}
                </Text>
              )}
            </View>
          </View>
          
          {/* レビュー評価 */}
          {product.rating !== undefined && (
            <View style={styles.ratingContainer}>
              <Ionicons name="star" size={16} color="#FFC107" />
              <Text style={styles.ratingText}>{product.rating.toFixed(1)}</Text>
              {product.reviewCount !== undefined && (
                <Text style={styles.reviewCount}>({product.reviewCount}件)</Text>
              )}
            </View>
          )}
          
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
        
        {/* アクションボタン（3択） */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.noButton]}
            onPress={onSwipeLeft}
            testID="swipe-left-button"
          >
            <Ionicons name="close" size={32} color="#F87171" />
            <Text style={styles.actionButtonText}>パス</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.saveButton, isSaved && styles.savedButton]}
            onPress={handleSavePress}
            disabled={isLoadingSave}
            testID="save-button"
          >
            <Ionicons 
              name={isSaved ? "bookmark" : "bookmark-outline"} 
              size={28} 
              color={isSaved ? "#FFC107" : "#9CA3AF"} 
            />
            <Text style={[styles.actionButtonText, isSaved && styles.savedButtonText]}>
              {isSaved ? "保存済" : "保存"}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.yesButton]}
            onPress={onSwipeRight}
            testID="swipe-right-button"
          >
            <Ionicons name="heart" size={32} color="#3B82F6" />
            <Text style={styles.actionButtonText}>好き</Text>
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
  saleBadge: {
    position: 'absolute',
    top: 16,
    left: 16,
    backgroundColor: '#F87171',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    zIndex: 10,
  },
  saleBadgeText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
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
  priceContainer: {
    alignItems: 'flex-end',
  },
  productPrice: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  originalPrice: {
    color: '#9CA3AF',
    fontSize: 16,
    textDecorationLine: 'line-through',
  },
  salePrice: {
    color: '#F87171',
    fontSize: 20,
    fontWeight: 'bold',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  ratingText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  reviewCount: {
    color: '#E5E7EB',
    fontSize: 14,
    marginLeft: 4,
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
  actionButtonText: {
    fontSize: 12,
    marginTop: 2,
    color: '#6B7280',
  },
  noButton: {},
  saveButton: {},
  savedButton: {
    backgroundColor: '#FFF9E6',
  },
  savedButtonText: {
    color: '#FFC107',
  },
  yesButton: {},
});

export default SwipeCardEnhanced;
