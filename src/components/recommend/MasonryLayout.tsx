import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Text,
  Animated,
  Pressable,
} from 'react-native';
import { Product } from '@/types';
import CachedImage from '@/components/common/CachedImage';
import { useStyle } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useFavorites } from '@/hooks/useFavorites';

// 型定義
interface MasonryLayoutProps {
  products: (Product & { isNewDirection?: boolean })[];
  numColumns?: number;
  spacing?: number;
  onItemPress: (product: Product) => void;
  showPrice?: boolean;
  renderItem?: (item: Product & { isNewDirection?: boolean }) => React.ReactNode;
  onEndReached?: () => void;
  onEndReachedThreshold?: number;
}

interface MasonryItem extends Product {
  isNewDirection?: boolean;
  height: number;
  column: number;
  offsetY: number;
  animationDelay: number;
}

// デザイントークン
const designTokens = {
  spacing: {
    cardGap: 12,
    sectionGap: 24,
    screenPadding: 16,
  },
  animation: {
    springConfig: { friction: 8, tension: 40 },
    fadeInDuration: 400,
    pressScale: 0.95,
  },
  typography: {
    brandName: { fontSize: 12, fontWeight: '600' },
    price: { fontSize: 16, fontWeight: 'bold' },
    badge: { fontSize: 10, fontWeight: '700' },
  },
  borderRadius: [8, 12, 16, 20],
};

// アイテムサイズの型定義
type ItemSize = 'hero' | 'large' | 'medium' | 'small';

const itemHeights = {
  hero: { min: 400, max: 500 },
  large: { min: 320, max: 400 },
  medium: { min: 250, max: 320 },
  small: { min: 180, max: 220 },
};

/**
 * Masonry Layout Component - Pinterest風レイアウト
 * 自前実装で軽量かつカスタマイズ性の高い実装
 */
const MasonryLayout: React.FC<MasonryLayoutProps> = ({
  products,
  numColumns = 2,
  spacing = designTokens.spacing.cardGap,
  onItemPress,
  showPrice = true,
  renderItem,
  onEndReached,
  onEndReachedThreshold = 0.8,
}) => {
  const { theme } = useStyle();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const fadeAnimations = useRef<Animated.Value[]>([]);
  const scaleAnimations = useRef<Animated.Value[]>([]);
  const [viewableItems, setViewableItems] = useState<Set<string>>(new Set());
  const scrollViewRef = useRef<ScrollView>(null);

  // 各アイテムのアニメーション値を初期化
  useEffect(() => {
    fadeAnimations.current = products.map(() => new Animated.Value(0));
    scaleAnimations.current = products.map(() => new Animated.Value(1));
  }, [products.length]);

  // アイテムサイズを動的に決定
  const getItemSize = (index: number, product: Product): ItemSize => {
    // 8商品ごとに1つヒーロー商品
    if (index % 8 === 0) return 'hero';
    
    // カテゴリーに応じたサイズ
    if (product.category === 'outerwear' || product.category === 'dress') {
      return 'large';
    }
    if (product.category === 'accessories') {
      return 'small';
    }
    
    // ランダムでメリハリをつける
    const random = parseInt(product.id.slice(-2), 16) % 3;
    return random === 0 ? 'large' : 'medium';
  };

  // 高さを動的に計算（商品タイプやランダム性を加味）
  const calculateItemHeight = (product: Product, index: number): number => {
    const size = getItemSize(index, product);
    const sizeRange = itemHeights[size];
    const hash = product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const normalizedHash = (hash % 100) / 100;
    return sizeRange.min + (sizeRange.max - sizeRange.min) * normalizedHash;
  };

  // 角丸のバリエーション
  const getBorderRadius = (index: number): number => {
    return designTokens.borderRadius[index % designTokens.borderRadius.length];
  };

  // カラム配置アルゴリズム
  const distributeItemsToColumns = useMemo(() => {
    const columns: number[] = new Array(numColumns).fill(0);
    const masonryItems: MasonryItem[] = [];

    products.forEach((item, index) => {
      // 最も高さが低いカラムを選択
      const shortestColumnIndex = columns.indexOf(Math.min(...columns));
      const itemHeight = calculateItemHeight(item, index);

      masonryItems.push({
        ...item,
        height: itemHeight,
        column: shortestColumnIndex,
        offsetY: columns[shortestColumnIndex],
        animationDelay: index * 50,
      });

      // カラムの高さを更新
      columns[shortestColumnIndex] += itemHeight + spacing;
    });

    return masonryItems;
  }, [products, numColumns, spacing]);

  // カラムごとにアイテムを分類
  const columnData = useMemo(() => {
    const columns: MasonryItem[][] = Array(numColumns).fill(null).map(() => []);
    
    distributeItemsToColumns.forEach((item) => {
      columns[item.column].push(item);
    });

    return columns;
  }, [distributeItemsToColumns, numColumns]);

  // アイテムが表示されたときのアニメーション
  const animateItem = (index: number) => {
    if (fadeAnimations.current[index]) {
      Animated.timing(fadeAnimations.current[index], {
        toValue: 1,
        duration: designTokens.animation.fadeInDuration,
        delay: 50,
        useNativeDriver: true,
      }).start();
    }
  };

  // プレスエフェクト
  const handlePressIn = (index: number) => {
    if (scaleAnimations.current[index]) {
      Animated.spring(scaleAnimations.current[index], {
        toValue: designTokens.animation.pressScale,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = (index: number) => {
    if (scaleAnimations.current[index]) {
      Animated.spring(scaleAnimations.current[index], {
        toValue: 1,
        friction: 3,
        tension: 40,
        useNativeDriver: true,
      }).start();
    }
  };

  // スクロールイベントハンドラー
  const handleScroll = (event: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const paddingToBottom = 20;
    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;
    
    if (isCloseToBottom && onEndReached) {
      onEndReached();
    }
  };

  // カラムのレンダリング
  const renderColumn = (columnItems: MasonryItem[], columnIndex: number) => {
    return (
      <View key={`column-${columnIndex}`} style={[styles.column, { marginRight: columnIndex < numColumns - 1 ? spacing : 0 }]}>
        {columnItems.map((item, itemIndex) => {
          const globalIndex = products.findIndex(p => p.id === item.id);
          const animatedOpacity = fadeAnimations.current[globalIndex] || new Animated.Value(0);
          const animatedScale = scaleAnimations.current[globalIndex] || new Animated.Value(1);
          const borderRadius = getBorderRadius(globalIndex);
          const itemSize = getItemSize(globalIndex, item);
          
          return (
            <Animated.View
              key={item.id}
              style={[
                styles.itemContainer,
                {
                  height: item.height,
                  marginBottom: spacing,
                  opacity: animatedOpacity,
                  transform: [
                    {
                      translateY: animatedOpacity.interpolate({
                        inputRange: [0, 1],
                        outputRange: [20, 0],
                      }),
                    },
                    {
                      scale: animatedScale,
                    },
                  ],
                },
              ]}
            >
              <Pressable
                onPress={() => onItemPress(item)}
                onPressIn={() => handlePressIn(globalIndex)}
                onPressOut={() => handlePressOut(globalIndex)}
                style={[styles.touchable, { borderRadius }]}
              >
                <View style={[styles.imageContainer, { backgroundColor: theme.colors.surface, borderRadius }]}>
                  {item.imageUrl && item.imageUrl.trim() !== '' && !item.imageUrl.includes('placehold.co') ? (
                    <CachedImage
                      source={{ uri: item.imageUrl }}
                      style={[styles.image, { borderRadius }]}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={[styles.placeholderContainer, { borderRadius }]}>
                      <Ionicons name="image-outline" size={40} color={theme.colors.text.secondary} />
                    </View>
                  )}
                  
                  {/* グラデーションオーバーレイ（大サイズ商品のみ） */}
                  {(itemSize === 'hero' || itemSize === 'large') && (
                    <LinearGradient
                      colors={['transparent', 'rgba(0,0,0,0.4)']}
                      style={[styles.gradientOverlay, { borderRadius }]}
                    />
                  )}
                  
                  {/* アイテム情報 */}
                  <View style={styles.itemInfo}>
                    {/* New Directionバッジ */}
                    {item.isNewDirection && (
                      <View style={[styles.newDirectionBadge, { backgroundColor: theme.colors.primary }]}>
                        <Ionicons name="sparkles" size={14} color="#ffffff" />
                        <Text style={styles.newDirectionText}>New</Text>
                      </View>
                    )}
                    
                    {/* 価格（下部） */}
                    {showPrice && (
                      <View style={[styles.priceContainer, { backgroundColor: theme.colors.background + 'F0' }]}>
                        <Text style={[styles.priceText, { 
                          color: theme.colors.text.primary,
                          fontSize: itemSize === 'hero' ? 18 : designTokens.typography.price.fontSize 
                        }]}>
                          ¥{item.price.toLocaleString()}
                        </Text>
                      </View>
                    )}
                    
                    {/* 中古ラベル */}
                    {item.isUsed && (
                      <View style={[styles.usedLabel, { backgroundColor: theme.colors.status?.warning || 'rgba(245, 158, 11, 0.9)' }]}>
                        <Text style={styles.usedLabelText}>Used</Text>
                      </View>
                    )}
                    
                    {/* お気に入りボタン */}
                    <TouchableOpacity
                      style={[styles.favoriteButton, { backgroundColor: theme.colors.background + 'CC' }]}
                      onPress={async (e) => {
                        e.stopPropagation();
                        try {
                          if (isFavorite(item.id)) {
                            await removeFromFavorites(item.id);
                          } else {
                            await addToFavorites(item.id);
                          }
                        } catch (error) {
                          console.error('Error toggling favorite:', error);
                        }
                      }}
                    >
                      <Ionicons 
                        name={isFavorite(item.id) ? "heart" : "heart-outline"} 
                        size={20} 
                        color={isFavorite(item.id) ? theme.colors.primary : theme.colors.text.primary} 
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </Pressable>
            </Animated.View>
          );
        })}
      </View>
    );
  };

  // 初回アニメーション
  useEffect(() => {
    // 全商品をアニメーション（パフォーマンスを考慮して最大20個まで）
    const itemsToAnimate = Math.min(distributeItemsToColumns.length, 20);
    distributeItemsToColumns.slice(0, itemsToAnimate).forEach((item, index) => {
      setTimeout(() => {
        const globalIndex = products.findIndex(p => p.id === item.id);
        animateItem(globalIndex);
      }, index * 50); // アニメーション間隔を短縮
    });
    
    // 20個以降は即座に表示
    if (distributeItemsToColumns.length > 20) {
      setTimeout(() => {
        distributeItemsToColumns.slice(20).forEach((item) => {
          const globalIndex = products.findIndex(p => p.id === item.id);
          if (fadeAnimations.current[globalIndex]) {
            fadeAnimations.current[globalIndex].setValue(1);
          }
        });
      }, 1000); // 1秒後に残りを表示
    }
  }, [distributeItemsToColumns, products]);

  return (
    <ScrollView
      ref={scrollViewRef}
      style={styles.container}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
      onScroll={handleScroll}
    >
      <View style={styles.columnsContainer}>
        {columnData.map((column, index) => renderColumn(column, index))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  columnsContainer: {
    flexDirection: 'row',
    paddingHorizontal: designTokens.spacing.screenPadding,
  },
  column: {
    flex: 1,
    flexDirection: 'column',
  },
  itemContainer: {
    overflow: 'hidden',
  },
  touchable: {
    flex: 1,
  },
  imageContainer: {
    flex: 1,
    overflow: 'hidden',
    position: 'relative',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  gradientOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: '50%',
  },
  itemInfo: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  brandContainer: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  brandName: {
    fontSize: designTokens.typography.brandName.fontSize,
    fontWeight: designTokens.typography.brandName.fontWeight as any,
  },
  priceContainer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priceText: {
    fontSize: designTokens.typography.price.fontSize,
    fontWeight: designTokens.typography.price.fontWeight as any,
  },
  usedLabel: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  usedLabelText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
  },
  newDirectionBadge: {
    position: 'absolute',
    top: 40,
    left: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    gap: 4,
  },
  newDirectionText: {
    color: '#ffffff',
    fontSize: designTokens.typography.badge.fontSize,
    fontWeight: designTokens.typography.badge.fontWeight as any,
  },
  favoriteButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default React.memo(MasonryLayout);
