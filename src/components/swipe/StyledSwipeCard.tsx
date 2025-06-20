import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Animated } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '@/types';
import { formatPrice } from '@/utils';
import { useAuth } from '@/hooks/useAuth';
import { useStyle } from '@/contexts/ThemeContext';
import { savedItemsService } from '@/services/savedItemsService';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';

interface StyledSwipeCardProps {
  product: Product;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSave?: () => void;
  onPress?: () => void;
  onLongPress?: () => void;
  testID?: string;
  isSaved?: boolean;
}

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = height * 0.65;

const StyledSwipeCard: React.FC<StyledSwipeCardProps> = ({ 
  product, 
  onSwipeLeft,
  onSwipeRight,
  onSave,
  onPress,
  onLongPress,
  testID,
  isSaved: propIsSaved
}) => {
  const { user } = useAuth();
  const { theme, styleType } = useStyle();
  const [isSaved, setIsSaved] = useState(propIsSaved || false);
  const [isLoadingSave, setIsLoadingSave] = useState(false);
  
  // Animation values
  const scaleAnim = useRef(new Animated.Value(1)).current;
  
  // imageUrlとimage_urlの両方の形式に対応
  const imageUrl = product.imageUrl || product.image_url || 'https://via.placeholder.com/350x500?text=No+Image';

  // 初期アニメーション
  useEffect(() => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.97,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true
      })
    ]).start();
  }, []);

  // 保存状態の確認
  useEffect(() => {
    // propIsSavedが渡されていたらそれを使う
    if (propIsSaved !== undefined) {
      setIsSaved(propIsSaved);
      return;
    }
    
    const checkSavedStatus = async () => {
      if (user?.id && product.id) {
        const saved = await savedItemsService.isItemSaved(user.id, product.id);
        setIsSaved(saved);
      }
    };
    checkSavedStatus();
  }, [user?.id, product.id, propIsSaved]);

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

    // ボタンプレスアニメーション
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        useNativeDriver: true
      })
    ]).start();

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
    <Animated.View 
      style={[
        styles.card, 
        { 
          borderRadius: theme.radius.l,
          backgroundColor: theme.colors.card.background,
          shadowColor: theme.colors.card.shadow || '#000', // テーマの影の色を使用
          transform: [{ scale: scaleAnim }]
        }
      ]} 
      testID={testID || 'swipe-card'}
    >
      <TouchableOpacity
        style={[
          styles.cardContent,
          { borderRadius: theme.radius.l }
        ]}
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={500}
        activeOpacity={0.95}
        testID="swipe-card-touch"
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          contentFit="cover"
          transition={300}
          testID="product-image"
        />
        
        {/* グラデーションオーバーレイ */}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        />
        
        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <View style={styles.productDetails}>
              <Text 
                style={[
                  styles.productTitle,
                  { fontSize: styleType === 'natural' ? 22 : 20 }
                ]} 
                numberOfLines={1}
              >
                {product.title}
              </Text>
              {product.brand && (
                <Text style={styles.productBrand} numberOfLines={1}>
                  {product.brand}
                </Text>
              )}
            </View>
            <View style={styles.priceContainer}>
              <Text 
                style={[
                  styles.productPrice,
                  { fontSize: styleType === 'bold' ? 22 : 20 }
                ]}
              >
                {formatPrice(product.price)}
              </Text>
            </View>
          </View>
          
          {/* 長押しインストラクション */}
          <View style={styles.instructionContainer}>
            <Ionicons 
              name="finger-print-outline" 
              size={14} 
              color="rgba(255, 255, 255, 0.8)" 
            />
            <Text style={styles.instructionText}>長押しでクイックビュー</Text>
          </View>
        </View>
        
        {/* アクションボタン（3択） */}
        <View style={styles.actionButtons}>
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              {
                borderRadius: styleType === 'natural' ? 40 : 32,
                width: styleType === 'natural' ? 70 : 64,
                height: styleType === 'natural' ? 70 : 64,
                shadowColor: theme.colors.card.shadow || '#000', // テーマの影の色を使用
              }
            ]}
            onPress={onSwipeLeft}
            activeOpacity={0.7}
            testID="swipe-left-button"
          >
            <Ionicons 
              name="close" 
              size={32} 
              color={theme.colors.error} 
            />
            <Text style={styles.actionButtonText}>パス</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.actionButton, 
              isSaved && styles.savedButton,
              {
                borderRadius: styleType === 'natural' ? 40 : 32,
                width: styleType === 'natural' ? 70 : 64,
                height: styleType === 'natural' ? 70 : 64,
                backgroundColor: isSaved ? `${theme.colors.warning}20` : 'white',
                borderWidth: isSaved ? 1 : 0,
                borderColor: isSaved ? theme.colors.warning : 'transparent',
                shadowColor: theme.colors.card.shadow || '#000', // テーマの影の色を使用
              }
            ]}
            onPress={handleSavePress}
            disabled={isLoadingSave}
            activeOpacity={0.7}
            testID="save-button"
          >
            <Ionicons 
              name={isSaved ? "bookmark" : "bookmark-outline"} 
              size={28} 
              color={isSaved ? theme.colors.warning : "#9CA3AF"} 
            />
            <Text 
              style={[
                styles.actionButtonText, 
                { 
                  color: isSaved ? theme.colors.warning : '#6B7280'
                }
              ]}
            >
              {isSaved ? "保存済" : "保存"}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.actionButton,
              {
                borderRadius: styleType === 'natural' ? 40 : 32,
                width: styleType === 'natural' ? 70 : 64,
                height: styleType === 'natural' ? 70 : 64,
                shadowColor: theme.colors.card.shadow || '#000', // テーマの影の色を使用
              }
            ]}
            onPress={onSwipeRight}
            activeOpacity={0.7}
            testID="swipe-right-button"
          >
            <Ionicons 
              name="heart" 
              size={32} 
              color={theme.colors.success} 
            />
            <Text style={styles.actionButtonText}>好き</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  cardContent: {
    flex: 1,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '45%',
  },
  productInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  productDetails: {
    flex: 1,
    marginRight: 10,
  },
  productTitle: {
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 4,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  productBrand: {
    color: '#E5E7EB',
    fontSize: 16,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  priceContainer: {
    alignItems: 'flex-end',
  },
  productPrice: {
    color: 'white',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 3,
  },
  instructionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    opacity: 0.9,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  instructionText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 13,
    marginLeft: 6,
  },
  actionButtons: {
    position: 'absolute',
    bottom: 120,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  actionButton: {
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
  },
  actionButtonText: {
    fontSize: 13,
    marginTop: 3,
    fontWeight: '500',
    color: '#6B7280',
  },
  savedButton: {},
  savedButtonText: {},
});

export default StyledSwipeCard;