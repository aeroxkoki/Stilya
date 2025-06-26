import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  RefreshControl, 
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
  StatusBar
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RecommendScreenProps } from '@/navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import { useStyle } from '@/contexts/ThemeContext';
import { 
  getEnhancedRecommendations, 
  getOutfitRecommendations 
} from '@/services/integratedRecommendationService';
import { Product } from '@/types';
import { FilterOptions } from '@/services/productService';

const { width, height } = Dimensions.get('window');

type NavigationProp = RecommendScreenProps<'RecommendHome'>['navigation'];

// グリッドアイテムのサイズタイプ
type GridItemSize = 'large' | 'medium' | 'small';

interface GridItem extends Product {
  size: GridItemSize;
  animationDelay: number;
}

const EnhancedRecommendScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { theme } = useStyle();
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // 状態管理
  const [isLoading, setIsLoading] = useState(true);
  const [heroProduct, setHeroProduct] = useState<Product | null>(null);
  const [gridItems, setGridItems] = useState<GridItem[]>([]);
  const [surpriseItems, setSurpriseItems] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filters] = useState<FilterOptions>({
    includeUsed: false
  });
  
  // アニメーション値
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // データ読み込み
  const loadData = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      const [recommendationResults] = await Promise.all([
        getEnhancedRecommendations(user.id, 30, [], filters)
      ]);
      
      const allProducts = [
        ...recommendationResults.recommended,
        ...recommendationResults.forYou,
        ...recommendationResults.trending
      ];
      
      if (allProducts.length > 0) {
        // ヒーロープロダクト（最も推薦度の高いもの）
        setHeroProduct(allProducts[0]);
        
        // グリッドアイテムの準備（2-16番目）
        const gridProducts = allProducts.slice(1, 16);
        const processedGridItems: GridItem[] = gridProducts.map((product, index) => {
          let size: GridItemSize;
          if (index === 0 || index === 5) {
            size = 'large';
          } else if (index % 3 === 0) {
            size = 'medium';
          } else {
            size = 'small';
          }
          
          return {
            ...product,
            size,
            animationDelay: index * 50
          };
        });
        
        setGridItems(processedGridItems);
        
        // サプライズアイテム（17-20番目）
        setSurpriseItems(allProducts.slice(16, 20));
      }
      
      // フェードインアニメーション
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        })
      ]).start();
      
    } catch (err: any) {
      console.error('Failed to load recommendations:', err);
      setError(err.message || 'レコメンデーションの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [user, filters, fadeAnim, slideAnim]);
  
  // 初回読み込み
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  // 商品タップハンドラー
  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };
  
  // ヘッダーの透明度アニメーション
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  
  // グリッドアイテムのサイズ計算
  const getItemDimensions = (size: GridItemSize) => {
    const padding = 16;
    const spacing = 8;
    
    switch (size) {
      case 'large':
        return {
          width: width - padding * 2,
          height: 400
        };
      case 'medium':
        return {
          width: (width - padding * 2 - spacing) * 0.6,
          height: 280
        };
      case 'small':
        return {
          width: (width - padding * 2 - spacing * 2) / 3,
          height: 160
        };
    }
  };
  
  // ローディング表示
  if (isLoading && !heroProduct) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      {/* アニメーションヘッダー */}
      <Animated.View 
        style={[
          styles.header, 
          { 
            backgroundColor: theme.colors.background,
            opacity: headerOpacity 
          }
        ]}
      >
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
          For You
        </Text>
      </Animated.View>
      
      <Animated.ScrollView
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={isLoading} 
            onRefresh={loadData} 
          />
        }
      >
        {/* ヒーローセクション：Today's Pick */}
        {heroProduct && (
          <Animated.View 
            style={[
              styles.heroSection,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            <TouchableOpacity 
              activeOpacity={0.95}
              onPress={() => handleProductPress(heroProduct)}
            >
              <Image
                source={{ uri: heroProduct.imageUrl }}
                style={styles.heroImage}
              />
              <LinearGradient
                colors={['transparent', 'rgba(0,0,0,0.6)']}
                style={styles.heroGradient}
              >
                <View style={styles.heroContent}>
                  <Text style={styles.heroLabel}>Today's Pick</Text>
                  <View style={styles.heroInfo}>
                    <View style={styles.matchBadge}>
                      <Ionicons name="heart" size={14} color="#fff" />
                      <Text style={styles.matchText}>For You</Text>
                    </View>
                    <Text style={styles.heroPrice}>
                      ¥{heroProduct.price.toLocaleString()}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}
        
        {/* Your Style セクション */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Your Style
          </Text>
          
          {/* ダイナミックグリッド */}
          <View style={styles.dynamicGrid}>
            {gridItems.map((item, index) => {
              const dimensions = getItemDimensions(item.size);
              return (
                <Animated.View
                  key={item.id}
                  style={[
                    styles.gridItem,
                    dimensions,
                    {
                      opacity: fadeAnim,
                      transform: [{
                        translateY: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [30, 0],
                        })
                      }]
                    }
                  ]}
                >
                  <TouchableOpacity 
                    activeOpacity={0.9}
                    onPress={() => handleProductPress(item)}
                    style={styles.gridItemTouchable}
                  >
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={[styles.gridItemImage, { height: dimensions.height }]}
                    />
                    {item.size === 'large' && (
                      <LinearGradient
                        colors={['transparent', 'rgba(0,0,0,0.4)']}
                        style={styles.gridItemGradient}
                      >
                        <View style={styles.gridItemInfo}>
                          <Text style={styles.gridItemPrice}>
                            ¥{item.price.toLocaleString()}
                          </Text>
                        </View>
                      </LinearGradient>
                    )}
                    {item.size !== 'large' && (
                      <View style={styles.smallItemInfo}>
                        <Text style={styles.smallItemPrice}>
                          ¥{item.price.toLocaleString()}
                        </Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </View>
        
        {/* ビジュアルブレイク：New Direction */}
        {surpriseItems.length > 0 && (
          <View style={styles.visualBreak}>
            <LinearGradient
              colors={[theme.colors.primary + '20', theme.colors.primary + '05']}
              style={styles.gradientBreak}
            >
              <Text style={[styles.breakTitle, { color: theme.colors.primary }]}>
                New Direction
              </Text>
            </LinearGradient>
          </View>
        )}
        
        {/* サプライズセクション */}
        {surpriseItems.length > 0 && (
          <View style={styles.surpriseSection}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.surpriseScroll}
            >
              {surpriseItems.map((item, index) => (
                <Animated.View
                  key={item.id}
                  style={[
                    styles.surpriseItem,
                    {
                      opacity: fadeAnim,
                      transform: [{
                        rotateY: fadeAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['90deg', '0deg'],
                        })
                      }]
                    }
                  ]}
                >
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => handleProductPress(item)}
                  >
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.surpriseImage}
                    />
                    <View style={styles.surpriseInfo}>
                      <View style={styles.newBadge}>
                        <Text style={styles.newBadgeText}>New Discovery</Text>
                      </View>
                      <Text style={[styles.surprisePrice, { color: theme.colors.text.primary }]}>
                        ¥{item.price.toLocaleString()}
                      </Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </ScrollView>
          </View>
        )}
        
        {/* スワイプ促進（控えめ） */}
        <TouchableOpacity 
          style={styles.moreButton}
          onPress={() => {
            const parentNavigation = navigation.getParent();
            if (parentNavigation) {
              parentNavigation.navigate('Swipe');
            }
          }}
        >
          <Text style={[styles.moreButtonText, { color: theme.colors.text.secondary }]}>
            もっと見る
          </Text>
          <Text style={[styles.moreButtonSubtext, { color: theme.colors.primary }]}>
            スワイプでもっと正確に ›
          </Text>
        </TouchableOpacity>
        
        {/* 下部の余白 */}
        <View style={{ height: 100 }} />
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  heroSection: {
    width: width,
    height: height * 0.8,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroContent: {
    gap: 12,
  },
  heroLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
    opacity: 0.9,
  },
  heroInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  matchBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  matchText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  heroPrice: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  dynamicGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridItem: {
    marginBottom: 8,
    borderRadius: 12,
    overflow: 'hidden',
  },
  gridItemTouchable: {
    flex: 1,
  },
  gridItemImage: {
    width: '100%',
    resizeMode: 'cover',
  },
  gridItemGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    justifyContent: 'flex-end',
    padding: 12,
  },
  gridItemInfo: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  gridItemPrice: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  smallItemInfo: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  smallItemPrice: {
    fontSize: 12,
    fontWeight: '600',
  },
  visualBreak: {
    marginTop: 48,
    marginBottom: 24,
  },
  gradientBreak: {
    height: 120,
    marginHorizontal: 16,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  breakTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  surpriseSection: {
    marginBottom: 24,
  },
  surpriseScroll: {
    paddingHorizontal: 16,
    gap: 12,
  },
  surpriseItem: {
    width: width * 0.6,
    borderRadius: 16,
    overflow: 'hidden',
  },
  surpriseImage: {
    width: '100%',
    height: 280,
    resizeMode: 'cover',
  },
  surpriseInfo: {
    padding: 12,
  },
  newBadge: {
    backgroundColor: 'rgba(0,0,0,0.05)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  newBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#666',
  },
  surprisePrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  moreButton: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  moreButtonText: {
    fontSize: 14,
  },
  moreButtonSubtext: {
    fontSize: 12,
    marginTop: 4,
  },
});

export default EnhancedRecommendScreen;
