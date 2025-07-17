import React, { useRef, useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Dimensions, 
  Animated
} from 'react-native';
import CachedImage from '@/components/common/CachedImage';
import { Ionicons } from '@expo/vector-icons';
import { Product } from '@/types';
import { formatPrice } from '@/utils';
import { useStyle } from '@/contexts/ThemeContext';

interface SwipeCardEnhancedProps {
  product: Product;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onPress?: () => void;
  onLongPress?: () => void;
  onSave?: () => void;
  isSaved?: boolean;
  testID?: string;
  animatedStyle?: any; // 親からアニメーションスタイルを受け取る
  swipeDirection?: 'left' | 'right' | null; // 親からスワイプ方向を受け取る
}

const { width, height } = Dimensions.get('window');
const CARD_WIDTH = width * 0.9;
const CARD_HEIGHT = height * 0.65;

const SwipeCardEnhanced: React.FC<SwipeCardEnhancedProps> = ({ 
  product, 
  onSwipeLeft,
  onSwipeRight,
  onPress,
  onLongPress,
  onSave,
  isSaved = false,
  testID,
  animatedStyle,
  swipeDirection
}) => {
  // StyleContextからテーマを取得
  const { theme, styleType } = useStyle();
  
  // カードの透明度アニメーション
  const cardOpacity = useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(cardOpacity, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true
    }).start();
  }, []);
  
  // カードのスケールアニメーション
  const cardScale = useRef(new Animated.Value(0.95)).current;
  React.useEffect(() => {
    Animated.spring(cardScale, {
      toValue: 1,
      friction: 8,
      tension: 40,
      useNativeDriver: true
    }).start();
  }, []);
  
  // スワイプレイヤーの色（方向によって変化）
  const getSwipeOverlayColor = () => {
    if (swipeDirection === 'left') {
      return 'rgba(239, 68, 68, 0.2)'; // 薄い赤
    } else if (swipeDirection === 'right') {
      return 'rgba(59, 130, 246, 0.2)'; // 薄い青
    }
    return 'transparent';
  };
  
  // スワイプインジケーターの表示
  const getSwipeIndicator = () => {
    if (swipeDirection === 'left') {
      return (
        <View style={[styles.swipeIndicator, styles.noIndicator]}>
          <Ionicons name="close" size={80} color="rgba(239, 68, 68, 0.7)" />
        </View>
      );
    } else if (swipeDirection === 'right') {
      return (
        <View style={[styles.swipeIndicator, styles.yesIndicator]}>
          <Ionicons name="heart" size={80} color="rgba(59, 130, 246, 0.7)" />
        </View>
      );
    }
    return null;
  };
  
  // imageUrlを使用
  const imageUrl = product.imageUrl || 'https://via.placeholder.com/350x500?text=No+Image';
  
  // デバッグ: 画像URLの状態を詳細に確認
  React.useEffect(() => {
    if (__DEV__) {
      console.log('[SwipeCardEnhanced] Product Debug:', {
        productId: product.id,
        productTitle: product.title?.substring(0, 30) + '...',
        hasImageUrl: !!product.imageUrl,
        imageUrlValue: product.imageUrl,
        finalImageUrl: imageUrl,
        isPlaceholder: imageUrl.includes('placeholder'),
        source: product.source
      });
    }
  }, [product.id, product.imageUrl, imageUrl]);
  
  // 画像読み込みエラーハンドリング
  const [imageError, setImageError] = useState(false);
  const handleImageError = () => {
    console.log(`[SwipeCardEnhanced] Image load failed for: ${imageUrl}`);
    setImageError(true);
  };

  // 親からアニメーションスタイルが提供されない場合のデフォルトスタイル
  const defaultAnimatedStyle = {
    transform: [
      { scale: cardScale }
    ],
    opacity: cardOpacity,
  };

  return (
    <Animated.View 
      style={[
        styles.container,
        animatedStyle || defaultAnimatedStyle,
        { 
          backgroundColor: theme.colors.card.background,
          borderRadius: theme.radius.l,
          shadowColor: theme.shadows.medium.shadowColor,
          shadowOffset: theme.shadows.medium.shadowOffset,
          shadowOpacity: theme.shadows.medium.shadowOpacity,
          shadowRadius: theme.shadows.medium.shadowRadius,
          elevation: theme.shadows.medium.elevation,
        },
      ]}
      testID={testID || 'swipe-card-enhanced'}
    >
      <TouchableOpacity
        style={styles.cardContent}
        onPress={onPress}
        onLongPress={onLongPress}
        delayLongPress={500}
        activeOpacity={0.95}
        testID="swipe-card-touch"
      >
        {/* 商品画像 */}
        <CachedImage
          source={{ uri: imageError ? 'https://via.placeholder.com/350x500?text=No+Image' : imageUrl }}
          style={styles.image}
          contentFit="cover"
          testID="product-image"
          highQuality={true}
          showLoadingIndicator={false}
          onError={handleImageError}
        />
        
        {/* グラデーションの代わりに暗いオーバーレイを使用 */}
        <View style={styles.darkOverlay} />
        
        {/* 商品情報 */}
        <View style={styles.productInfo}>
          <View style={styles.productHeader}>
            <View style={styles.productDetails}>
              <Text 
                style={[
                  styles.productTitle, 
                  { fontSize: theme.fontSizes.l }
                ]} 
                numberOfLines={1}
              >
                {product.title}
              </Text>
              {product.brand && (
                <Text 
                  style={[
                    styles.productBrand,
                    { fontSize: theme.fontSizes.s }
                  ]} 
                  numberOfLines={1}
                >
                  {product.brand}
                </Text>
              )}
            </View>
            <Text 
              style={[
                styles.productPrice,
                { fontSize: theme.fontSizes.l }
              ]}
            >
              {formatPrice(product.price)}
            </Text>
          </View>
        </View>
        
        {/* スワイプ方向インジケーター */}
        <View 
          style={[
            styles.swipeOverlay,
            { backgroundColor: getSwipeOverlayColor() }
          ]}
        >
          {getSwipeIndicator()}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    overflow: 'hidden',
  },
  cardContent: {
    flex: 1,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  darkOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 120,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  productInfo: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productDetails: {
    flex: 1,
    marginRight: 10,
  },
  productTitle: {
    color: 'white',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  productBrand: {
    color: 'rgba(255, 255, 255, 0.8)',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  productPrice: {
    color: 'white',
    fontWeight: 'bold',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  swipeOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  swipeIndicator: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  noIndicator: {
    transform: [{ rotate: '-10deg' }],
  },
  yesIndicator: {
    transform: [{ rotate: '10deg' }],
  },
});

export default SwipeCardEnhanced;