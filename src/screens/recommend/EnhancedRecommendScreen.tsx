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
  SectionList,
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

interface Section {
  title: string;
  key: 'forYou' | 'newDiscovery' | 'trending';
  data: (Product & { isNewDirection?: boolean })[];
}

const EnhancedRecommendScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { theme } = useStyle();
  const scrollY = useRef(new Animated.Value(0)).current;
  
  // 状態管理
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [heroProduct, setHeroProduct] = useState<Product | null>(null);
  const [sections, setSections] = useState<Section[]>([]);
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
      }
      
      setError(null);
      
      const [recommendationResults] = await Promise.all([
        getEnhancedRecommendations(
          user.id, 
          isRefresh ? 50 : ITEMS_PER_PAGE, 
          [], 
          filters
        )
      ]);
      
      // 重複を除外しながら商品を結合
      const productMap = new Map<string, Product>();
      
      // 重複検出のためのカウンター（デバッグ用）
      let duplicateCount = 0;
      
      // 優先順位: recommended > forYou > trending
      [...recommendationResults.recommended,
       ...recommendationResults.forYou,
       ...recommendationResults.trending
      ].forEach(product => {
        if (!productMap.has(product.id)) {
          productMap.set(product.id, product);
        } else {
          duplicateCount++;
          console.log('[EnhancedRecommendScreen] Duplicate product removed:', product.id);
        }
      });
      
      const allProducts = Array.from(productMap.values());
      
      // デバッグ: 重複除外の結果
      console.log('[EnhancedRecommendScreen] Duplicate removal stats:', {
        originalTotal: recommendationResults.recommended.length + 
                      recommendationResults.forYou.length + 
                      recommendationResults.trending.length,
        uniqueTotal: allProducts.length,
        duplicatesRemoved: duplicateCount
      });
      
      if (allProducts.length > 0) {
        // デバッグ: 最初の商品の詳細情報をログ出力
        console.log('[EnhancedRecommendScreen] Total products:', allProducts.length);
        console.log('[EnhancedRecommendScreen] First 3 products:', 
          allProducts.slice(0, 3).map(p => ({
            id: p.id,
            title: p.title,
            originalImageUrl: p.imageUrl,
            source: p.source
          }))
        );
        
        if (isRefresh) {
          // ヒーロープロダクト（最も推薦度の高いもの）
          setHeroProduct(allProducts[0]);
          
          // セクション構成の実装
          const forYouProducts = allProducts.slice(1, Math.ceil(allProducts.length * 0.4));
          const newDiscoveryProducts = allProducts.slice(
            Math.ceil(allProducts.length * 0.4),
            Math.ceil(allProducts.length * 0.7)
          );
          const trendingProducts = allProducts.slice(Math.ceil(allProducts.length * 0.7));
          
          // New Directionフラグの設定
          const newDiscoveryWithFlag = newDiscoveryProducts.map(p => ({
            ...p,
            isNewDirection: true
          }));
          
          setSections([
            {
              title: "あなたへのおすすめ",
              key: "forYou",
              data: forYouProducts,
            },
            {
              title: "新しい発見",
              key: "newDiscovery",
              data: newDiscoveryWithFlag,
            },
            {
              title: "人気アイテム",
              key: "trending",
              data: trendingProducts,
            }
          ]);
        } else {
          // 追加読み込み時の処理
          if (allProducts.length < ITEMS_PER_PAGE) {
            setHasMore(false);
          }
          
          // 既存のセクションに追加
          setSections(prevSections => {
            const newSections = [...prevSections];
            // 追加データを各セクションに配分
            const additionalForYou = allProducts.slice(0, Math.ceil(allProducts.length * 0.4));
            const additionalNewDiscovery = allProducts.slice(
              Math.ceil(allProducts.length * 0.4),
              Math.ceil(allProducts.length * 0.7)
            ).map(p => ({ ...p, isNewDirection: true }));
            const additionalTrending = allProducts.slice(Math.ceil(allProducts.length * 0.7));
            
            newSections[0].data = [...newSections[0].data, ...additionalForYou];
            newSections[1].data = [...newSections[1].data, ...additionalNewDiscovery];
            newSections[2].data = [...newSections[2].data, ...additionalTrending];
            
            return newSections;
          });
          
          setPage(prev => prev + 1);
        }
        
        console.log('[EnhancedRecommendScreen] Sections distribution:', {
          forYou: sections[0]?.data.length || 0,
          newDiscovery: sections[1]?.data.length || 0,
          trending: sections[2]?.data.length || 0,
        });
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
      setIsLoadingMore(false);
    }
  }, [user, filters, fadeAnim, slideAnim, page, sections]);
  
  // 初回読み込み
  useEffect(() => {
    loadData(true);
  }, []);
  
  // 商品タップハンドラー
  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };
  
  // 追加読み込み
  const loadMoreProducts = async () => {
    if (!hasMore || isLoadingMore || isLoading) return;
    
    setIsLoadingMore(true);
    await loadData(false);
  };
  
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
  
  // セクションのレンダリング
  const renderSection = (section: Section) => {
    return (
      <View key={section.key} style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            {section.title}
          </Text>
          {section.key === 'newDiscovery' && (
            <View style={[styles.sectionBadge, { backgroundColor: theme.colors.primary + '20' }]}>
              <Ionicons name="sparkles" size={14} color={theme.colors.primary} />
              <Text style={[styles.sectionBadgeText, { color: theme.colors.primary }]}>
                New Style
              </Text>
            </View>
          )}
        </View>
        
        <MasonryLayout
          products={section.data}
          numColumns={2}
          spacing={12}
          onItemPress={handleProductPress}
          showPrice={true}
          onEndReached={section.key === 'trending' ? loadMoreProducts : undefined}
          onEndReachedThreshold={0.8}
        />
      </View>
    );
  };
  
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
                  <Text style={styles.placeholderText}>画像を読み込み中...</Text>
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
                    {heroProduct.brand && (
                      <Text style={styles.heroBrand}>{heroProduct.brand}</Text>
                    )}
                    <Text style={styles.heroPrice}>
                      ¥{heroProduct.price.toLocaleString()}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}
        
        {/* セクション別のMasonry Layout */}
        {sections.map(section => renderSection(section))}
        
        {/* 追加読み込み中のインジケーター */}
        {isLoadingMore && (
          <View style={styles.loadingMoreContainer}>
            <ActivityIndicator size="small" color={theme.colors.primary} />
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
  heroBrand: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  heroPrice: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  sectionContainer: {
    marginTop: 32,
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
  },
  sectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 6,
  },
  sectionBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  loadingMoreContainer: {
    paddingVertical: 20,
    alignItems: 'center',
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
