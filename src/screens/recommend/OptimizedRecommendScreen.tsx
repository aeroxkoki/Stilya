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
  Animated,
  StatusBar,
  ListRenderItem,
  ScrollView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RecommendScreenProps } from '@/navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/hooks/useAuth';
import { useStyle } from '@/contexts/ThemeContext';
import { getEnhancedRecommendations } from '@/services/integratedRecommendationService';
import { Product } from '@/types';
import CachedImage from '@/components/common/CachedImage';
import { useFavorites } from '@/hooks/useFavorites';
import { SimpleFilterModal } from '@/components/common';
import { useFilters } from '@/contexts/FilterContext';
import { optimizeImageUrl } from '@/utils/imageUtils';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');
const COLUMN_WIDTH = (width - 48) / 2;

type NavigationProp = RecommendScreenProps<'RecommendHome'>['navigation'];

const OptimizedRecommendScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { theme } = useStyle();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const { globalFilters } = useFilters();
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // 状態管理（シンプル化）
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [heroProduct, setHeroProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [trendingProducts, setTrendingProducts] = useState<Product[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [showFilterModal, setShowFilterModal] = useState(false);
  
  // アニメーション値（最小限）
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  // データ読み込み（最適化版）
  const loadData = useCallback(async (isRefresh = false) => {
    if (!user) {
      setError('ログインが必要です');
      setIsLoading(false);
      return;
    }
    
    try {
      if (isRefresh) {
        setIsRefreshing(true);
      }
      
      setError(null);
      
      // タイムアウト設定で高速化
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('読み込みタイムアウト')), 5000)
      );
      
      const dataPromise = getEnhancedRecommendations(
        user.id, 
        50, // 必要最小限の数に削減
        [], 
        globalFilters
      );
      
      const result = await Promise.race([dataPromise, timeoutPromise]) as any;
      
      // データ設定（シンプル化）
      if (result.recommended?.length > 0) {
        setHeroProduct(result.recommended[0]);
        setProducts(result.recommended.slice(1, 21)); // 最大20件に制限
      }
      
      if (result.trending?.length > 0) {
        setTrendingProducts(result.trending.slice(0, 6)); // トレンド6件のみ
      }
      
      // シンプルなフェードイン
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
      
    } catch (err: any) {
      console.error('Failed to load recommendations:', err);
      setError('商品の読み込みに失敗しました');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user, globalFilters, fadeAnim]);
  
  // 初回読み込み
  useEffect(() => {
    loadData(false);
  }, []);
  
  // フィルター変更時の再読み込み
  useEffect(() => {
    if (!isLoading) {
      loadData(false);
    }
  }, [globalFilters]);
  
  // 商品タップハンドラー
  const handleProductPress = useCallback((product: Product) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    navigation.navigate('ProductDetail', { productId: product.id });
  }, [navigation]);
  
  // お気に入りトグル
  const handleFavoriteToggle = useCallback(async (productId: string, e: any) => {
    e.stopPropagation();
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      if (isFavorite(productId)) {
        await removeFromFavorites(productId);
      } else {
        await addToFavorites(productId);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  }, [isFavorite, addToFavorites, removeFromFavorites]);
  
  // ヘッダーの透明度
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });
  
  // ヒーローセクション（シンプル化）
  const renderHeroSection = () => {
    if (!heroProduct) return null;
    
    const imageUrl = optimizeImageUrl(heroProduct.imageUrl || '');
    
    return (
      <Animated.View style={[styles.heroSection, { opacity: fadeAnim }]}>
        <TouchableOpacity 
          activeOpacity={0.95}
          onPress={() => handleProductPress(heroProduct)}
        >
          <View style={styles.heroImageWrapper}>
            <CachedImage
              source={{ uri: imageUrl }}
              style={styles.heroImage}
              contentFit="cover"
              showLoadingIndicator={false}
              productTitle={heroProduct.title}
              silentFallback={true}
            />
            
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.7)']}
              style={styles.heroGradient}
            >
              <View style={styles.heroContent}>
                <Text style={styles.heroTitle} numberOfLines={2}>
                  {heroProduct.title}
                </Text>
                
                <View style={styles.heroInfo}>
                  <Text style={styles.heroPrice}>
                    ¥{heroProduct.price.toLocaleString()}
                  </Text>
                  
                  <TouchableOpacity
                    style={styles.heroBuyButton}
                    onPress={() => handleProductPress(heroProduct)}
                  >
                    <Text style={styles.heroBuyText}>購入する</Text>
                    <Ionicons name="arrow-forward" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            </LinearGradient>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };
  
  // トレンディングセクション（シンプル化）
  const renderTrendingSection = () => {
    if (trendingProducts.length === 0) return null;
    
    return (
      <View style={styles.sectionContainer}>
        <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
          今人気の商品
        </Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalScrollContent}
        >
          {trendingProducts.map((product) => (
            <TouchableOpacity
              key={product.id}
              style={styles.trendingCard}
              onPress={() => handleProductPress(product)}
            >
              <CachedImage
                source={{ uri: optimizeImageUrl(product.imageUrl || '') }}
                style={styles.trendingImage}
                contentFit="cover"
                productTitle={product.title}
                silentFallback={true}
              />
              <Text style={styles.trendingPrice}>
                ¥{product.price.toLocaleString()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };
  
  // 商品カード（最適化版）
  const renderProduct: ListRenderItem<Product> = ({ item, index }) => {
    const isLeftColumn = index % 2 === 0;
    const imageUrl = optimizeImageUrl(item.imageUrl || '');
    
    return (
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={() => handleProductPress(item)}
        style={[
          styles.productCard,
          {
            marginLeft: isLeftColumn ? 16 : 8,
            marginRight: isLeftColumn ? 8 : 16,
          }
        ]}
      >
        <View style={styles.productImageContainer}>
          <CachedImage
            source={{ uri: imageUrl }}
            style={styles.productImage}
            contentFit="cover"
            silentFallback={true}
          />
          
          {/* シンプルな価格表示 */}
          <View style={styles.priceContainer}>
            <Text style={styles.priceText}>
              ¥{item.price.toLocaleString()}
            </Text>
          </View>
          
          {/* お気に入りボタン */}
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={(e) => handleFavoriteToggle(item.id, e)}
          >
            <Ionicons 
              name={isFavorite(item.id) ? "heart" : "heart-outline"} 
              size={20} 
              color={isFavorite(item.id) ? theme.colors.primary : '#fff'} 
            />
          </TouchableOpacity>
          
          {/* 中古表示（必要な場合のみ） */}
          {item.isUsed && (
            <View style={styles.usedBadge}>
              <Text style={styles.usedText}>中古</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };
  
  // ローディング表示（シンプル）
  if (isLoading && !heroProduct) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }
  
  // エラー表示（改善版）
  if (error && products.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContainer}>
          <Ionicons name="alert-circle-outline" size={60} color={theme.colors.text.secondary} />
          <Text style={[styles.errorText, { color: theme.colors.text.primary }]}>
            {error}
          </Text>
          <TouchableOpacity 
            style={[styles.retryButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => loadData(true)}
          >
            <Text style={styles.retryButtonText}>再読み込み</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  // メインビュー
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      <FlatList
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {renderHeroSection()}
            {renderTrendingSection()}
            <View style={styles.mainContent}>
              <Text style={[styles.subtitle, { color: theme.colors.text.primary }]}>
                おすすめ商品
              </Text>
            </View>
          </>
        }
        numColumns={2}
        columnWrapperStyle={styles.columnWrapper}
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
        removeClippedSubviews={true}
        maxToRenderPerBatch={8}
        windowSize={10}
        initialNumToRender={6}
        contentContainerStyle={styles.listContent}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={[styles.emptyText, { color: theme.colors.text.secondary }]}>
              商品を準備中です...
            </Text>
          </View>
        }
      />
      
      {/* 固定ヘッダー（シンプル化） */}
      <Animated.View 
        style={[
          styles.header, 
          { 
            backgroundColor: theme.colors.background,
            opacity: headerOpacity 
          }
        ]}
      >
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>
            おすすめ
          </Text>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <Ionicons name="options-outline" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>
      </Animated.View>
      
      {/* フィルターモーダル */}
      <SimpleFilterModal
        visible={showFilterModal}
        onClose={() => setShowFilterModal(false)}
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
    padding: 20,
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
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  filterButton: {
    padding: 8,
  },
  heroSection: {
    width: width,
    height: height * 0.55,
    marginBottom: 16,
  },
  heroImageWrapper: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 180,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  heroContent: {
    gap: 12,
  },
  heroTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '600',
    lineHeight: 26,
  },
  heroInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  heroPrice: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  heroBuyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20,
    gap: 8,
  },
  heroBuyText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  sectionContainer: {
    marginVertical: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginHorizontal: 16,
    marginBottom: 12,
  },
  horizontalScrollContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  trendingCard: {
    width: 120,
    marginRight: 12,
  },
  trendingImage: {
    width: 120,
    height: 160,
    borderRadius: 8,
    marginBottom: 8,
  },
  trendingPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  mainContent: {
    marginTop: 8,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: COLUMN_WIDTH,
    height: 220,
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  productImageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: '#f5f5f5',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  priceContainer: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#000',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  usedBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  usedText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 16,
    marginTop: 16,
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
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
  },
});

export default OptimizedRecommendScreen;