import React, { useRef, useEffect, useState } from 'react';
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
  const heartScaleAnim = useRef(new Animated.Value(1)).current;
  const heartOpacityAnim = useRef(new Animated.Value(0)).current;
  
  // ダブルタップ検出用
  const [lastTap, setLastTap] = useState<number | null>(null);
  const DOUBLE_TAP_DELAY = 300;

  // バリューコマースadTag処理（準備のみ - 現在は無効）
  useEffect(() => {
    // VALUECOMMERCE_ENABLEDがtrueの場合のみ実行
    const valueCommerceEnabled = false; // TODO: 環境変数から読み込む
    
    if (valueCommerceEnabled && product.source === 'valuecommerce' && product.adTag) {
      // React NativeではWebViewを使用してadタグを処理する必要がある
      // 現在は実装準備のみ
      console.log('[ProductCard] ValueCommerce adTag ready for:', product.id);
      
      // 将来的な実装例：
      // - WebViewを使用してadタグを実行
      // - またはネイティブHTTP requestでトラッキング
    }
  }, [product]);

  // 価格フォーマット（改善版）
  const formatPrice = (price: number): string => {
    return `¥${price.toLocaleString('ja-JP')}`;
  };

  // ハートアニメーションの実行
  const animateHeart = () => {
    Animated.parallel([
      Animated.sequence([
        Animated.spring(heartScaleAnim, {
          toValue: 1.5,
          friction: 3,
          tension: 200,
          useNativeDriver: true,
        }),
        Animated.spring(heartScaleAnim, {
          toValue: 1,
          friction: 5,
          tension: 100,
          useNativeDriver: true,
        })
      ]),
      Animated.sequence([
        Animated.timing(heartOpacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(heartOpacityAnim, {
          toValue: 0,
          duration: 500,
          delay: 300,
          useNativeDriver: true,
        })
      ])
    ]).start();
  };

  // お気に入りボタンのハンドラ
  const handleFavoritePress = () => {
    if (onFavoritePress) {
      animateHeart();
      onFavoritePress(product.id);
    }
  };

  // ダブルタップ処理
  const handleDoubleTap = () => {
    const now = Date.now();
    if (lastTap && (now - lastTap) < DOUBLE_TAP_DELAY) {
      // ダブルタップ検出
      if (onFavoritePress && !isFavorite) {
        animateHeart();
        onFavoritePress(product.id);
      }
    } else {
      setLastTap(now);
      // シングルタップ
      setTimeout(() => {
        if (lastTap === now) {
          onPress(product.id);
        }
      }, DOUBLE_TAP_DELAY);
    }
  };

  // カードのタッチエフェクト（改善版）
  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.94,  // より強いフィードバック
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
            borderRadius: 12,  // 統一された角丸
            backgroundColor: theme.colors.card.background,
            shadowColor: isDarkMode ? '#000' : '#222',
            borderColor: theme.colors.border,
            borderWidth: isDarkMode ? 1 : 0,
          },
          style,
        ]}
        onPress={showFavoriteButton ? handleDoubleTap : () => onPress(product.id)}
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
          
          {/* ダブルタップハートアニメーション */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.animatedHeart,
              {
                opacity: heartOpacityAnim,
                transform: [{ scale: heartScaleAnim }]
              }
            ]}
          >
            <Feather name="heart" size={50} color={theme.colors.primary} />
          </Animated.View>
          
          {/* 品質スコアバッジ（高品質商品のみ表示） */}
          {product.qualityScore && product.qualityScore >= 80 && (
            <View style={[styles.qualityBadge, { backgroundColor: theme.colors.primary + 'F0' }]}>
              <Feather name="award" size={12} color="#fff" />
              <Text style={styles.qualityBadgeText}>高品質</Text>
            </View>
          )}
          
          {/* セールバッジ */}
          {product.isSale && product.discountPercentage && (
            <View style={[styles.saleBadge, { backgroundColor: theme.colors.status.error }]}>
              <Text style={styles.saleBadgeText}>-{product.discountPercentage}%</Text>
            </View>
          )}
          
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
                    : 'rgba(255, 255, 255, 0.9)',
                  borderWidth: 1,
                  borderColor: isFavorite 
                    ? theme.colors.primary 
                    : 'transparent',
                },
              ]}
              onPress={handleFavoritePress}
              hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
            >
              <Feather
                name="heart"
                size={18}
                color={isFavorite ? theme.colors.primary : theme.colors.text.hint}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.infoContainer, compact && styles.compactInfoContainer]}>
          {/* ブランド名を最上部に配置 */}
          {product.brand && (
            <Text style={[
              styles.brand, 
              compact && styles.compactBrand,
              { color: theme.colors.text.hint, opacity: 0.8 }
            ]} numberOfLines={1}>
              {product.brand.toUpperCase()}
            </Text>
          )}
          
          {/* 商品名を1行に制限 */}
          <Text
            style={[
              styles.title, 
              compact && styles.compactTitle,
              { color: theme.colors.text.primary }
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {product.title}
          </Text>
          
          {/* 価格を大きく強調 */}
          <View style={styles.priceContainer}>
            <Text style={[
              styles.price, 
              compact && styles.compactPrice,
              { color: theme.colors.primary }
            ]}>
              {formatPrice(product.price)}
            </Text>
            {product.originalPrice && product.originalPrice > product.price && (
              <Text style={[styles.originalPrice, { color: theme.colors.text.hint }]}>
                {formatPrice(product.originalPrice)}
              </Text>
            )}
          </View>

          {/* タグを最大2個に制限 */}
          {showTags && product.tags && product.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {product.tags.slice(0, 2).map((tag, index) => (
                <View
                  key={index}
                  style={[
                    styles.tag,
                    compact && styles.compactTag,
                    { 
                      backgroundColor: isDarkMode 
                        ? 'rgba(255, 255, 255, 0.08)' 
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
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
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
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  horizontalImageContainer: {
    width: 120,
    height: '100%',
    borderTopRightRadius: 0,
    borderBottomLeftRadius: 12,
  },
  compactImageContainer: {
    height: 140,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    height: undefined,
  },
  animatedHeart: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -25,
    marginLeft: -25,
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  qualityBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  qualityBadgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
  },
  saleBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  saleBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  usedLabel: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  usedLabelText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
  },
  infoContainer: {
    padding: 12,
    flex: 1,
  },
  compactInfoContainer: {
    padding: 8,
  },
  brand: {
    fontSize: 11,
    marginBottom: 2,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  compactBrand: {
    fontSize: 9,
    marginBottom: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 6,
    height: 18,
    lineHeight: 18,
  },
  compactTitle: {
    fontSize: 11,
    marginBottom: 4,
    height: 'auto',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
    marginBottom: 8,
  },
  price: {
    fontSize: 20,
    fontWeight: '800',
  },
  compactPrice: {
    fontSize: 16,
  },
  originalPrice: {
    fontSize: 14,
    textDecorationLine: 'line-through',
    opacity: 0.6,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  compactTag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '500',
  },
  compactTagText: {
    fontSize: 8,
  },
});

export default ProductCard;
