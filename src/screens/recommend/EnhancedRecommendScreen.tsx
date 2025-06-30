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
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RecommendScreenProps } from '@/navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import { useStyle } from '@/contexts/ThemeContext';
import { 
  getEnhancedRecommendations
} from '@/services/integratedRecommendationService';
import { Product } from '@/types';
import { FilterOptions } from '@/services/productService';
import { MasonryLayout } from '@/components/recommend';

const { width, height } = Dimensions.get('window');

type NavigationProp = RecommendScreenProps<'RecommendHome'>['navigation'];

const EnhancedRecommendScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { theme } = useStyle();
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // 状態管理
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [heroProduct, setHeroProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filters] = useState<FilterOptions>({
    includeUsed: false
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const ITEMS_PER_PAGE = 20;
  
  // アニメーション値
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // データ読み込み
  const loadData = useCallback(async (isRefresh = false) => {
    if (!user) return;
    
    try {
      if (isRefresh) {
        setIsLoading(true);
        setPage(1);
        setHasMore(true);
        setDisplayedProducts([]);
      }
      
      setError(null);
      
      const [recommendationResults] = await Promise.all([
        getEnhancedRecommendations(
          user.id, 
          100,  // 一度に多くの商品を取得
          [], 
          filters
        )
      ]);
      
      // 重複を除外しながら商品を結合
      const productMap = new Map<string, Product>();
      
      // 優先順位: recommended > forYou > trending
      [...recommendationResults.recommended,
       ...recommendationResults.forYou,
       ...recommendationResults.trending
      ].forEach(product => {
        if (!productMap.has(product.id)) {
          productMap.set(product.id, product);
        }
      });
      
      const uniqueProducts = Array.from(productMap.values());
      
      if (uniqueProducts.length > 0) {
        if (isRefresh) {
          // ヒーロープロダクト（最も推薦度の高いもの）
          setHeroProduct(uniqueProducts[0]);
          setAllProducts(uniqueProducts.slice(1));
          // 初期表示
          setDisplayedProducts(uniqueProducts.slice(1, ITEMS_PER_PAGE + 1));
        }
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
      setError(err.message || 'Failed to load recommendations');
    } finally {
      setIsLoading(false);
      setIsLoadingMore(false);
    }
  }, [user, filters, fadeAnim, slideAnim]);
  
  // 初回読み込み
  useEffect(() => {
    loadData(true);
  }, []);
  
  // 商品タップハンドラー
  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };
  
  // 追加読み込み
  const loadMoreProducts = useCallback(() => {
    if (!hasMore || isLoadingMore || isLoading) return;
    
    setIsLoadingMore(true);
    
    const startIndex = page * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const newProducts = allProducts.slice(startIndex, endIndex);
    
    if (newProducts.length > 0) {
      setDisplayedProducts(prev => [...prev, ...newProducts]);
      setPage(prev => prev + 1);
    } else {
      setHasMore(false);
    }
    
    setIsLoadingMore(false);
  }, [allProducts, page, hasMore, isLoadingMore, isLoading]);
  
  // ヘッダーの透明度アニメーション
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  
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
            onRefresh={() => loadData(true)} 
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
              {heroProduct.imageUrl && heroProduct.imageUrl.trim() !== '' && !heroProduct.imageUrl.includes('placehold.co') ? (
                <Image
                  source={{ uri: heroProduct.imageUrl }}
                  style={styles.heroImage}
                  onError={(error) => {
                    console.error('[HeroImage] Failed to load:', heroProduct.imageUrl);
                    console.error('[HeroImage] Error:', error.nativeEvent.error);
                  }}
                  onLoad={() => {
                    console.log('[HeroImage] Successfully loaded:', heroProduct.imageUrl);
                  }}
                />
              ) : (
                <View style={[styles.heroImage, styles.placeholderContainer]}>
                  <Ionicons name="image-outline" size={60} color="#666" />
                  <Text style={styles.placeholderText}>Loading...</Text>
                </View>
              )}
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
        
        {/* メインコンテンツ */}
        <View style={styles.mainContent}>
          <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
            Recommended for you
          </Text>
          
          <MasonryLayout
            products={displayedProducts}
            numColumns={2}
            spacing={12}
            onItemPress={handleProductPress}
            showPrice={true}
            onEndReached={loadMoreProducts}
            onEndReachedThreshold={0.8}
          />
          
          {/* 追加読み込み中のインジケーター */}
          {isLoadingMore && (
            <View style={styles.loadingMoreContainer}>
              <ActivityIndicator size="small" color={theme.colors.primary} />
            </View>
          )}
          
          {/* 全て読み込み完了 */}
          {!hasMore && displayedProducts.length > 0 && (
            <TouchableOpacity 
              style={styles.exploreMoreButton}
              onPress={() => {
                const parentNavigation = navigation.getParent();
                if (parentNavigation) {
                  parentNavigation.navigate('Swipe');
                }
              }}
            >
              <Text style={[styles.exploreMoreText, { color: theme.colors.text.secondary }]}>
                Explore more
              </Text>
              <Ionicons name="arrow-forward" size={18} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          )}
        </View>
        
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
    flexWrap: 'wrap',
    gap: 12,
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
  mainContent: {
    marginTop: 24,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 16,
    marginBottom: 16,
    opacity: 0.8,
  },
  loadingMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
  },
  exploreMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 32,
    gap: 8,
  },
  exploreMoreText: {
    fontSize: 14,
    fontWeight: '500',
  },
  placeholderContainer: {
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
});

export default EnhancedRecommendScreen;
