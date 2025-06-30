import React, { useEffect, useState, useCallback, useRef } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  FlatList, 
  RefreshControl, 
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Animated,
  StatusBar,
  ListRenderItem,
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

const ITEMS_PER_PAGE = 20;

const EnhancedRecommendScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { theme } = useStyle();
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // 状態管理
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [heroProduct, setHeroProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [filters] = useState<FilterOptions>({
    includeUsed: false
  });
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  
  // アニメーション値
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // フラットリストのref
  const flatListRef = useRef<FlatList<Product>>(null);
  
  // データ読み込み
  const loadData = useCallback(async (isRefresh = false) => {
    if (!user) return;
    
    console.log('[EnhancedRecommendScreen] loadData called:', { isRefresh, page });
    
    try {
      if (isRefresh) {
        setIsRefreshing(true);
        setPage(1);
        setHasMore(true);
      }
      
      setError(null);
      
      const [recommendationResults] = await Promise.all([
        getEnhancedRecommendations(
          user.id, 
          100,  // 一度に多くの商品を取得してキャッシュ
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
      
      console.log('[EnhancedRecommendScreen] Loaded products:', {
        total: uniqueProducts.length,
        recommended: recommendationResults.recommended.length,
        forYou: recommendationResults.forYou.length,
        trending: recommendationResults.trending.length,
      });
      
      if (uniqueProducts.length > 0) {
        // ヒーロープロダクト（最も推薦度の高いもの）
        setHeroProduct(uniqueProducts[0]);
        
        if (isRefresh) {
          // リフレッシュ時は完全に置き換え
          setProducts(uniqueProducts.slice(1, ITEMS_PER_PAGE + 1));
          setPage(2);
        } else {
          // 初回読み込み
          setProducts(uniqueProducts.slice(1, ITEMS_PER_PAGE + 1));
          setPage(2);
        }
        
        // まだ表示していない商品があるかチェック
        setHasMore(uniqueProducts.length > ITEMS_PER_PAGE + 1);
        
        // データを一時的に保存（追加読み込み用）
        allProductsRef.current = uniqueProducts.slice(1);
      } else {
        console.warn('[EnhancedRecommendScreen] No products found');
        setProducts([]);
        setHasMore(false);
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
      setIsRefreshing(false);
    }
  }, [user, filters, fadeAnim, slideAnim]);
  
  // 全商品のリファレンス（追加読み込み用）
  const allProductsRef = useRef<Product[]>([]);
  
  // 追加読み込み
  const loadMoreProducts = useCallback(async () => {
    if (!hasMore || isLoadingMore || isLoading || isRefreshing) {
      console.log('[EnhancedRecommendScreen] loadMoreProducts skipped:', {
        hasMore,
        isLoadingMore,
        isLoading,
        isRefreshing
      });
      return;
    }
    
    console.log('[EnhancedRecommendScreen] loadMoreProducts called, current page:', page);
    
    setIsLoadingMore(true);
    
    try {
      const startIndex = (page - 1) * ITEMS_PER_PAGE;
      const endIndex = startIndex + ITEMS_PER_PAGE;
      const newProducts = allProductsRef.current.slice(startIndex, endIndex);
      
      console.log('[EnhancedRecommendScreen] Loading more products:', {
        startIndex,
        endIndex,
        newProductsCount: newProducts.length,
        totalCached: allProductsRef.current.length
      });
      
      if (newProducts.length > 0) {
        setProducts(prev => [...prev, ...newProducts]);
        setPage(prev => prev + 1);
      } else {
        // キャッシュが尽きたら新しいデータを取得
        if (user) {
          const [recommendationResults] = await Promise.all([
            getEnhancedRecommendations(
              user.id, 
              50,  // 追加で50件取得
              products.map(p => p.id), // 既存のIDを除外
              filters
            )
          ]);
          
          const additionalProducts = [
            ...recommendationResults.recommended,
            ...recommendationResults.forYou,
            ...recommendationResults.trending
          ].filter(p => !products.some(existing => existing.id === p.id));
          
          if (additionalProducts.length > 0) {
            setProducts(prev => [...prev, ...additionalProducts]);
            // キャッシュを更新
            allProductsRef.current = [...allProductsRef.current, ...additionalProducts];
          } else {
            setHasMore(false);
          }
        }
      }
      
      // 残りの商品数をチェック
      if (allProductsRef.current.length <= endIndex) {
        setHasMore(false);
      }
      
    } catch (error) {
      console.error('[EnhancedRecommendScreen] Error loading more products:', error);
    } finally {
      setIsLoadingMore(false);
    }
  }, [page, hasMore, isLoadingMore, isLoading, isRefreshing, user, filters, products]);
  
  // 初回読み込み
  useEffect(() => {
    loadData(false);
  }, []);
  
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
  
  // ヒーローセクションのレンダリング
  const renderHeroSection = () => {
    if (!heroProduct) return null;
    
    return (
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
    );
  };
  
  // リストヘッダー
  const ListHeaderComponent = () => (
    <>
      {renderHeroSection()}
      <View style={styles.mainContent}>
        <Text style={[styles.subtitle, { color: theme.colors.text.secondary }]}>
          Recommended for you
        </Text>
      </View>
    </>
  );
  
  // リストフッター
  const ListFooterComponent = () => {
    if (isLoadingMore) {
      return (
        <View style={styles.loadingMoreContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
            Loading more...
          </Text>
        </View>
      );
    }
    
    if (!hasMore && products.length > 0) {
      return (
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
      );
    }
    
    return <View style={{ height: 100 }} />;
  };
  
  // リストアイテムのレンダリング（MasonryLayoutをバッチで使用）
  const renderProducts: ListRenderItem<Product[]> = ({ item: productBatch }) => (
    <MasonryLayout
      products={productBatch}
      numColumns={2}
      spacing={12}
      onItemPress={handleProductPress}
      showPrice={true}
    />
  );
  
  // 商品をバッチに分割（パフォーマンス最適化）
  const productBatches = React.useMemo(() => {
    const batches: Product[][] = [];
    const batchSize = 10; // 一度に10商品ずつレンダリング
    
    for (let i = 0; i < products.length; i += batchSize) {
      batches.push(products.slice(i, i + batchSize));
    }
    
    return batches;
  }, [products]);
  
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
  
  // エラー表示
  if (error) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContainer}>
          <Text style={[styles.errorText, { color: theme.colors.text.primary }]}>
            {error}
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => loadData(true)}
          >
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
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
      
      <FlatList
        ref={flatListRef}
        data={productBatches}
        renderItem={renderProducts}
        keyExtractor={(_, index) => `batch-${index}`}
        ListHeaderComponent={ListHeaderComponent}
        ListFooterComponent={ListFooterComponent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl 
            refreshing={isRefreshing} 
            onRefresh={() => loadData(true)} 
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
        onEndReached={() => {
          console.log('[EnhancedRecommendScreen] onEndReached triggered');
          loadMoreProducts();
        }}
        onEndReachedThreshold={0.5}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        contentContainerStyle={styles.listContent}
      />
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
  listContent: {
    paddingBottom: 20,
  },
  loadingMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
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
  errorText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default EnhancedRecommendScreen;
