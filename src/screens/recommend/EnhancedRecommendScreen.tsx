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
  const [heroProduct, setHeroProduct] = useState<Product | null>(null);
  const [gridItems, setGridItems] = useState<Product[]>([]);
  const [surpriseItems, setSurpriseItems] = useState<Product[]>([]);
  const [mixedProducts, setMixedProducts] = useState<(Product & { isNewDirection?: boolean })[]>([]);
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
        getEnhancedRecommendations(user.id, 50, [], filters)
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
        
        // ヒーロープロダクト（最も推薦度の高いもの）
        setHeroProduct(allProducts[0]);
        
        // 通常商品とNew Direction商品を準備
        const normalProducts = allProducts.slice(1, 11); // 2-11番目（10個）
        const newDirectionProducts = allProducts.slice(11); // 12番目以降
        
        // 商品を混ぜる（交互またはランダム）
        const mixed: (Product & { isNewDirection?: boolean })[] = [];
        const maxLength = Math.max(normalProducts.length, newDirectionProducts.length);
        
        // 交互に配置する方式
        for (let i = 0; i < maxLength; i++) {
          // 通常商品を2個追加
          if (i * 2 < normalProducts.length) {
            mixed.push({ ...normalProducts[i * 2], isNewDirection: false });
          }
          if (i * 2 + 1 < normalProducts.length) {
            mixed.push({ ...normalProducts[i * 2 + 1], isNewDirection: false });
          }
          
          // New Direction商品を1個追加
          if (i < newDirectionProducts.length) {
            mixed.push({ ...newDirectionProducts[i], isNewDirection: true });
          }
        }
        
        // 残りの商品を追加
        normalProducts.slice(maxLength * 2).forEach(p => {
          mixed.push({ ...p, isNewDirection: false });
        });
        
        setMixedProducts(mixed);
        
        // 旧実装の互換性のため残す（後で削除可能）
        setGridItems(normalProducts);
        setSurpriseItems(newDirectionProducts.slice(0, 4));
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
                    <Text style={styles.heroPrice}>
                      ¥{heroProduct.price.toLocaleString()}
                    </Text>
                  </View>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        )}
        
        {/* 統合されたマスonry レイアウト */}
        <View style={styles.sectionContainer}>
          <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>
            Discover
          </Text>
          
          {/* Mixed Masonry Layout */}
          <MasonryLayout
            products={mixedProducts}
            numColumns={2}
            spacing={8}
            onItemPress={handleProductPress}
            showPrice={true}
            renderItem={(item: Product & { isNewDirection?: boolean }) => {
              // New Direction商品には特別なバッジを表示（MasonryLayout内でカスタマイズ可能）
              return item;
            }}
          />
        </View>
        
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
