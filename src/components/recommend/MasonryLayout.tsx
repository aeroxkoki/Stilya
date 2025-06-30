import React, { useMemo, useState, useRef, useEffect } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Text,
  Animated,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  ViewToken,
} from 'react-native';
import { Product } from '@/types';
import CachedImage from '@/components/common/CachedImage';
import { useStyle } from '@/contexts/ThemeContext';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

interface MasonryItem extends Product {
  height: number;
  column: number;
  offsetY: number;
  animationDelay: number;
  isNewDirection?: boolean;
}

interface MasonryLayoutProps {
  products: (Product & { isNewDirection?: boolean })[];
  numColumns?: number;
  spacing?: number;
  onItemPress: (product: Product) => void;
  showPrice?: boolean;
  renderItem?: (item: Product & { isNewDirection?: boolean }) => Product & { isNewDirection?: boolean };
}

/**
 * Masonry Layout Component - Pinterest風レイアウト
 * 自前実装で軽量かつカスタマイズ性の高い実装
 */
const MasonryLayout: React.FC<MasonryLayoutProps> = ({
  products,
  numColumns = 2,
  spacing = 8,
  onItemPress,
  showPrice = true,
  renderItem,
}) => {
  const { theme } = useStyle();
  const fadeAnimations = useRef<Animated.Value[]>([]);
  const [viewableItems, setViewableItems] = useState<Set<string>>(new Set());

  // 各アイテムのアニメーション値を初期化
  useEffect(() => {
    fadeAnimations.current = products.map(() => new Animated.Value(0));
  }, [products.length]);

  // 高さを動的に計算（商品タイプやランダム性を加味）
  const calculateItemHeight = (product: Product, index: number): number => {
    const baseHeight = 200;
    // インデックスと商品IDに基づいて疑似ランダムな高さを生成
    const hash = product.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const variation = ((hash + index) % 4) * 40 + 50; // 50-170の範囲で変動
    return baseHeight + variation;
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
        duration: 400,
        delay: 50,
        useNativeDriver: true,
      }).start();
    }
  };

  // ビューアビリティコールバック
  const onViewableItemsChanged = useRef(({ viewableItems }: { viewableItems: ViewToken[] }) => {
    viewableItems.forEach((viewableItem) => {
      if (viewableItem.isViewable && viewableItem.item) {
        const itemId = viewableItem.item.id;
        if (!viewableItems.has(itemId)) {
          setViewableItems((prev) => new Set(prev).add(itemId));
          const index = products.findIndex(p => p.id === itemId);
          if (index !== -1) {
            animateItem(index);
          }
        }
      }
    });
  }).current;

  // カラムのレンダリング
  const renderColumn = (columnItems: MasonryItem[], columnIndex: number) => {
    return (
      <View key={`column-${columnIndex}`} style={[styles.column, { marginRight: columnIndex < numColumns - 1 ? spacing : 0 }]}>
        {columnItems.map((item, itemIndex) => {
          const globalIndex = products.findIndex(p => p.id === item.id);
          const animatedOpacity = fadeAnimations.current[globalIndex] || new Animated.Value(0);
          
          return (
            <Animated.View
              key={item.id}
              style={[
                styles.itemContainer,
                {
                  height: item.height,
                  marginBottom: spacing,
                  opacity: animatedOpacity,
                  transform: [{
                    translateY: animatedOpacity.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  }],
                },
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => onItemPress(item)}
                style={styles.touchable}
              >
                <View style={[styles.imageContainer, { backgroundColor: theme.colors.surface }]}>
                  {item.imageUrl && item.imageUrl.trim() !== '' && !item.imageUrl.includes('placehold.co') ? (
                    <CachedImage
                      source={{ uri: item.imageUrl }}
                      style={styles.image}
                      contentFit="cover"
                    />
                  ) : (
                    <View style={styles.placeholderContainer}>
                      <Ionicons name="image-outline" size={40} color={theme.colors.text.secondary} />
                    </View>
                  )}
                  
                  {/* New Directionバッジ */}
                  {item.isNewDirection && (
                    <View style={[styles.newDirectionBadge, { backgroundColor: theme.colors.primary }]}>
                      <Ionicons name="sparkles" size={14} color="#ffffff" />
                      <Text style={styles.newDirectionText}>New</Text>
                    </View>
                  )}
                  
                  {showPrice && (
                    <View style={[styles.priceContainer, { backgroundColor: theme.colors.background + 'F0' }]}>
                      <Text style={[styles.priceText, { color: theme.colors.text.primary }]}>
                        ¥{item.price.toLocaleString()}
                      </Text>
                    </View>
                  )}
                  
                  {item.isUsed && (
                    <View style={[styles.usedLabel, { backgroundColor: theme.colors.status?.warning || 'rgba(245, 158, 11, 0.9)' }]}>
                      <Text style={styles.usedLabelText}>中古</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
      </View>
    );
  };

  // 初回アニメーション
  useEffect(() => {
    // 最初の6個をアニメーション
    distributeItemsToColumns.slice(0, 6).forEach((item, index) => {
      setTimeout(() => {
        const globalIndex = products.findIndex(p => p.id === item.id);
        animateItem(globalIndex);
      }, index * 100);
    });
  }, [distributeItemsToColumns, products]);

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      scrollEventThrottle={16}
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
    paddingHorizontal: 16,
  },
  column: {
    flex: 1,
    flexDirection: 'column',
  },
  itemContainer: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  touchable: {
    flex: 1,
  },
  imageContainer: {
    flex: 1,
    borderRadius: 12,
    overflow: 'hidden',
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
  priceContainer: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '600',
  },
  usedLabel: {
    position: 'absolute',
    top: 8,
    left: 8,
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
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    gap: 4,
  },
  newDirectionText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
});

export default MasonryLayout;
