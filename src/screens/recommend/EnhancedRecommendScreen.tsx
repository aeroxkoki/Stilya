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
  ScrollView,
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
import CachedImage from '@/components/common/CachedImage';
import { useFavorites } from '@/hooks/useFavorites';
import { useRecommendations } from '@/hooks/useRecommendations';
import { SimpleFilterModal } from '@/components/common';
import { useFilters } from '@/contexts/FilterContext';
import { getUserStyleProfile } from '@/services/userPreferenceService';

const { width, height } = Dimensions.get('window');

type NavigationProp = RecommendScreenProps<'RecommendHome'>['navigation'];

const ITEMS_PER_PAGE = 20;
const COLUMN_WIDTH = (width - 48) / 2;

// セクションタイプ
type SectionType = 'hero' | 'categories' | 'trending' | 'forYou' | 'newArrivals';

interface Section {
  type: SectionType;
  title?: string;
  data: Product[];
}

const EnhancedRecommendScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { theme } = useStyle();
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites();
  const { globalFilters } = useFilters();
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // 状態管理
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [heroProduct, setHeroProduct] = useState<Product | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [userStyleProfile, setUserStyleProfile] = useState<any>(null);
  
  // アニメーション値
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  
  // フラットリストのref
  const flatListRef = useRef<FlatList<Product>>(null);
  
  // フィルターがアクティブかどうかを判定
  const isFilterActive = (): boolean => {
    return (
      globalFilters.priceRange[0] > 0 ||
      globalFilters.priceRange[1] < 50000 ||
      (globalFilters.style && globalFilters.style !== 'すべて') ||
      globalFilters.moods.length > 0
    );
  };
  
  // ユーザーのスタイルプロファイルを取得
  const loadUserStyleProfile = useCallback(async () => {
    if (!user) return;
    
    try {
      const profile = await getUserStyleProfile(user.id);
      setUserStyleProfile(profile);
    } catch (error) {
      console.error('Failed to load user style profile:', error);
    }
  }, [user]);
  
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
          100,
          [], 
          globalFilters
        )
      ]);
      
      // セクション分けしてデータを整理
      const newSections: Section[] = [];
      
      // ヒーロー商品
      if (recommendationResults.recommended.length > 0) {
        setHeroProduct(recommendationResults.recommended[0]);
      }
      
      // トレンディング商品
      if (recommendationResults.trending.length > 0) {
        newSections.push({
          type: 'trending',
          title: '今人気の商品 🔥',
          data: recommendationResults.trending.slice(0, 6)
        });
      }
      
      // パーソナライズされた商品
      if (recommendationResults.forYou.length > 0) {
        newSections.push({
          type: 'forYou',
          title: 'あなたへのおすすめ ❤️',
          data: recommendationResults.forYou
        });
      }
      
      // 新着商品（最新の商品をシミュレート）
      const recentProducts = recommendationResults.recommended
        .filter(p => !recommendationResults.forYou.includes(p))
        .slice(0, 6);
      
      if (recentProducts.length > 0) {
        newSections.push({
          type: 'newArrivals',
          title: '新着アイテム ✨',
          data: recentProducts
        });
      }
      
      setSections(newSections);
      
      // フラットな商品リストも保持（既存の表示形式用）
      const uniqueProducts = Array.from(new Map(
        [...recommendationResults.recommended,
         ...recommendationResults.forYou,
         ...recommendationResults.trending]
        .map(p => [p.id, p])
      ).values());
      
      setProducts(uniqueProducts.slice(1)); // ヒーロー商品を除く
      
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
  }, [user, globalFilters, fadeAnim, slideAnim]);
  
  // 初回読み込み
  useEffect(() => {
    loadData(false);
    loadUserStyleProfile();
  }, []);
  
  // グローバルフィルターの変更を監視
  useEffect(() => {
    loadData(false);
  }, [globalFilters]);
  
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
    
    // デバッグ情報
    console.log('[EnhancedRecommendScreen] Hero product:', {
      id: heroProduct.id,
      title: heroProduct.title,
      imageUrl: heroProduct.imageUrl,
      brand: heroProduct.brand,
      price: heroProduct.price
    });
    
    // imageUrlを使用
    const imageUrl = heroProduct.imageUrl;
    
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
          {imageUrl && imageUrl.trim() !== '' && !imageUrl.includes('placehold.co') ? (
            <CachedImage
              source={{ uri: imageUrl }}
              style={styles.heroImage}
              contentFit="cover"
              debugMode={true} // デバッグモードを有効化
            />
          ) : (
            <View style={[styles.heroImage, styles.placeholderContainer]}>
              <Ionicons name="image-outline" size={60} color="#666" />
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.heroGradient}
          >
            <View style={styles.heroContent}>
              <Text style={styles.heroLabel}>Today's Pick for You</Text>
              <View style={styles.heroInfo}>
                <View style={styles.matchBadge}>
                  <Ionicons name="heart" size={14} color="#fff" />
                  <Text style={styles.matchText}>95% Match</Text>
                </View>
                <Text style={styles.heroPrice}>
                  ¥{heroProduct.price.toLocaleString()}
                </Text>
              </View>
              {heroProduct.tags && heroProduct.tags.length > 0 && (
                <View style={styles.heroTags}>
                  {heroProduct.tags.slice(0, 3).map((tag, index) => (
                    <View key={index} style={styles.heroTag}>
                      <Text style={styles.heroTagText}>{tag}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </LinearGradient>
        </TouchableOpacity>
      </Animated.View>
    );
  };
  
  // スタイルプロファイルの表示
  const renderStyleProfile = () => {
    if (!userStyleProfile || !userStyleProfile.preferredStyles) return null;
    
    return (
      <View style={styles.styleProfileContainer}>
        <Text style={[styles.styleProfileTitle, { color: theme.colors.text.primary }]}>
          あなたの好みのスタイル
        </Text>
        <View style={styles.styleProfileContent}>
          {Object.entries(userStyleProfile.preferredStyles)
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .slice(0, 3)
            .map(([style, percentage]) => (
              <View key={style} style={styles.styleItem}>
                <Text style={[styles.styleItemName, { color: theme.colors.text.primary }]}>
                  {style}
                </Text>
                <View style={styles.styleItemBar}>
                  <View 
                    style={[
                      styles.styleItemProgress,
                      { 
                        width: `${percentage}%`,
                        backgroundColor: theme.colors.primary 
                      }
                    ]} 
                  />
                </View>
                <Text style={[styles.styleItemPercentage, { color: theme.colors.text.secondary }]}>
                  {percentage}%
                </Text>
              </View>
            ))}
        </View>
      </View>
    );
  };
  
  // セクションのレンダリング
  const renderSection = (section: Section) => {
    if (section.type === 'trending') {
      return (
        <View key={section.type} style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            {section.title}
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScrollContent}
          >
            {section.data.map((product) => {
              // imageUrlとimage_urlの両方をチェック
              const imageUrl = product.imageUrl || product.image_url;
              
              return (
                <TouchableOpacity
                  key={product.id}
                  style={styles.trendingCard}
                  onPress={() => handleProductPress(product)}
                >
                  <CachedImage
                    source={{ uri: imageUrl }}
                    style={styles.trendingImage}
                    contentFit="cover"
                  />
                  <View style={styles.trendingInfo}>
                    <Text style={styles.trendingPrice}>
                      ¥{product.price.toLocaleString()}
                    </Text>
                    {product.brand && (
                      <Text style={styles.trendingBrand} numberOfLines={1}>
                        {product.brand}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      );
    }
    
    return null;
  };
  
  // リストヘッダー
  const ListHeaderComponent = () => (
    <>
      {renderHeroSection()}
      {renderStyleProfile()}
      
      {sections.map(section => renderSection(section))}
      
      <View style={styles.mainContent}>
        <Text style={[styles.subtitle, { color: theme.colors.text.primary }]}>
          すべてのおすすめ
        </Text>
      </View>
    </>
  );
  
  // リストアイテムのレンダリング
  const renderProduct: ListRenderItem<Product> = ({ item, index }) => {
    const isLeftColumn = index % 2 === 0;
    const hash = item.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const normalizedHash = (hash % 100) / 100;
    const itemHeight = 180 + normalizedHash * 120;
    
    // imageUrlとimage_urlの両方をチェック
    const imageUrl = item.imageUrl || item.image_url;
    
    return (
      <TouchableOpacity
        activeOpacity={0.95}
        onPress={() => handleProductPress(item)}
        style={[
          styles.productCard,
          {
            marginLeft: isLeftColumn ? 16 : 8,
            marginRight: isLeftColumn ? 8 : 16,
            height: itemHeight,
          }
        ]}
      >
        <View style={[styles.productImageContainer, { backgroundColor: theme.colors.surface }]}>
          {imageUrl && imageUrl.trim() !== '' && !imageUrl.includes('placehold.co') ? (
            <CachedImage
              source={{ uri: imageUrl }}
              style={styles.productImage}
              contentFit="cover"
            />
          ) : (
            <View style={styles.productPlaceholder}>
              <Ionicons name="image-outline" size={40} color={theme.colors.text.secondary} />
            </View>
          )}
          
          <View style={[styles.priceTag, { backgroundColor: theme.colors.background + 'F0' }]}>
            <Text style={[styles.priceText, { color: theme.colors.text.primary }]}>
              ¥{item.price.toLocaleString()}
            </Text>
          </View>
          
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
          
          {item.isUsed && (
            <View style={[styles.usedBadge, { backgroundColor: theme.colors.status?.warning || '#F59E0B' }]}>
              <Text style={styles.usedText}>Used</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };
  
  // ローディング表示
  if (isLoading && !heroProduct) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
            あなたへのおすすめを準備中...
          </Text>
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
            <Text style={styles.retryButtonText}>もう一度試す</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <StatusBar barStyle="light-content" />
      
      <FlatList
        ref={flatListRef}
        data={products}
        renderItem={renderProduct}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={ListHeaderComponent}
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
        maxToRenderPerBatch={10}
        windowSize={10}
        initialNumToRender={10}
        contentContainerStyle={styles.listContent}
      />
      
      {/* 固定ヘッダー */}
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
            For You
          </Text>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilterModal(true)}
          >
            <View>
              <Ionicons name="options-outline" size={24} color={theme.colors.text.primary} />
              {isFilterActive() && (
                <View style={[styles.activeFilterDot, { backgroundColor: theme.colors.primary }]} />
              )}
            </View>
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
    height: height * 0.65,
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
    height: 250,
    justifyContent: 'flex-end',
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  heroContent: {
    gap: 12,
  },
  heroLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
    fontSize: 24,
    fontWeight: 'bold',
  },
  heroTags: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  heroTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  heroTagText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '500',
  },
  styleProfileContainer: {
    marginHorizontal: 16,
    marginTop: 24,
    marginBottom: 16,
    padding: 16,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 12,
  },
  styleProfileTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  styleProfileContent: {
    gap: 8,
  },
  styleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  styleItemName: {
    fontSize: 14,
    width: 80,
  },
  styleItemBar: {
    flex: 1,
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  styleItemProgress: {
    height: '100%',
    borderRadius: 4,
  },
  styleItemPercentage: {
    fontSize: 12,
    width: 40,
    textAlign: 'right',
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
    width: 150,
    marginRight: 12,
  },
  trendingImage: {
    width: 150,
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
  },
  trendingInfo: {
    gap: 4,
  },
  trendingPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  trendingBrand: {
    fontSize: 12,
    color: '#666',
  },
  mainContent: {
    marginTop: 24,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    marginHorizontal: 16,
    marginBottom: 16,
  },
  listContent: {
    paddingBottom: 20,
  },
  columnWrapper: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: COLUMN_WIDTH,
    marginBottom: 12,
    borderRadius: 8,
    overflow: 'hidden',
  },
  productImageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    overflow: 'hidden',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  priceTag: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  priceText: {
    fontSize: 14,
    fontWeight: 'bold',
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
  usedBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  usedText: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '600',
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
  loadingText: {
    marginTop: 12,
    fontSize: 14,
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
  activeFilterDot: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});

export default EnhancedRecommendScreen;
