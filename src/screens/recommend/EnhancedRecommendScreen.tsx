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
  Modal,
  Pressable,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RecommendScreenProps } from '@/navigation/types';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
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
import * as Haptics from 'expo-haptics';

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
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);
  const [showStyleDetail, setShowStyleDetail] = useState(false);
  const [animatedValues, setAnimatedValues] = useState<Record<string, Animated.Value>>({});
  
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
      globalFilters.categories.length > 0 ||
      globalFilters.includeUsed === false
    );
  };
  
  // スタイル説明データ
  const styleDescriptions: Record<string, { description: string; icon: string; color: string }> = {
    'カジュアル': {
      description: 'リラックスした日常着。デニムやTシャツなど、気軽に着こなせるスタイル',
      icon: 'shirt-outline',
      color: '#3B82F6'
    },
    'モード': {
      description: '洗練された都会的スタイル。最新トレンドを取り入れた、アート性の高いファッション',
      icon: 'glasses-outline',
      color: '#8B5CF6'
    },
    'ストリート': {
      description: 'ストリートカルチャー由来のスタイル。スニーカーやオーバーサイズなアイテムが特徴',
      icon: 'walk-outline',
      color: '#EF4444'
    },
    'キレイめ': {
      description: 'エレガントで上品なスタイル。ビジネスカジュアルにも適した、きちんと感のあるファッション',
      icon: 'business-outline',
      color: '#10B981'
    },
    'ナチュラル': {
      description: '自然体で優しい印象のスタイル。アースカラーやリネン素材など、素材感を活かしたファッション',
      icon: 'leaf-outline',
      color: '#22C55E'
    },
    'フェミニン': {
      description: '女性らしい柔らかなスタイル。フレアスカートや花柄など、優雅で可愛らしいアイテム',
      icon: 'flower-outline',
      color: '#EC4899'
    },
    'クラシック': {
      description: '時代を超えた定番スタイル。トラッドやプレッピーなど、伝統的で品のあるファッション',
      icon: 'bowtie-outline',
      color: '#F59E0B'
    }
  };
  
  // ユーザーのスタイルプロファイルを取得（アニメーション付き）
  const loadUserStyleProfile = useCallback(async () => {
    if (!user) return;
    
    try {
      const profile = await getUserStyleProfile(user.id);
      setUserStyleProfile(profile);
      
      // アニメーション値を初期化
      if (profile && profile.preferredStyles) {
        const newAnimatedValues: Record<string, Animated.Value> = {};
        Object.keys(profile.preferredStyles).forEach(style => {
          newAnimatedValues[style] = new Animated.Value(0);
        });
        setAnimatedValues(newAnimatedValues);
        
        // アニメーションを実行
        setTimeout(() => {
          Object.entries(profile.preferredStyles).forEach(([style, percentage]) => {
            if (newAnimatedValues[style]) {
              Animated.timing(newAnimatedValues[style], {
                toValue: percentage as number,
                duration: 1000,
                useNativeDriver: false,
              }).start();
            }
          });
        }, 500);
      }
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
    
    // 画像URLを正しく取得（imageUrlフィールドが正しいマッピング）
    const imageUrl = heroProduct.imageUrl || '';
    
    // デバッグ情報を詳細に出力
    console.log('[EnhancedRecommendScreen] Hero product debug:', {
      id: heroProduct.id,
      title: heroProduct.title,
      imageUrl: imageUrl,
      hasImageUrl: !!imageUrl,
      imageUrlLength: imageUrl?.length,
      brand: heroProduct.brand,
      price: heroProduct.price
    });
    
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
          {imageUrl && imageUrl.trim() !== '' ? (
            <CachedImage
              source={{ uri: imageUrl }}
              style={styles.heroImage}
              contentFit="cover"
              debugMode={__DEV__} // 開発モードでのみデバッグを有効化
              productTitle={heroProduct.title} // 商品タイトルを追加
              silentFallback={true} // サイレントフォールバック
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
  
  // スタイルプロファイルの表示（改善版）
  const renderStyleProfile = () => {
    if (!userStyleProfile || !userStyleProfile.preferredStyles) return null;
    
    // スワイプ数に基づくレベル計算
    const swipeCount = userStyleProfile.totalSwipes || 0;
    const level = Math.min(Math.floor(swipeCount / 10) + 1, 10);
    const levelProgress = (swipeCount % 10) * 10;
    const nextLevelSwipes = level < 10 ? 10 - (swipeCount % 10) : 0;
    
    // 全スタイルデータを準備（パーセンテージ降順）
    const allStyles = Object.entries(userStyleProfile.preferredStyles)
      .sort(([, a], [, b]) => (b as number) - (a as number));
    
    // 最大値を取得（グラフのスケール用）
    const maxPercentage = allStyles.length > 0 ? Math.max(...allStyles.map(([, p]) => p as number)) : 100;
    
    return (
      <View style={[styles.styleProfileContainer, { 
        backgroundColor: theme.colors.surface || '#ffffff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 12,
        elevation: 5,
      }]}>
        {/* ヘッダー部分 */}
        <LinearGradient
          colors={[theme.colors.primary + '15', 'transparent']}
          style={styles.styleProfileGradientHeader}
        >
          <View style={styles.styleProfileHeader}>
            <View style={styles.styleProfileTitleSection}>
              <Text style={[styles.styleProfileTitle, { color: theme.colors.text.primary }]}>
                スタイル分析
              </Text>
              <View style={styles.levelBadge}>
                <Ionicons name="trophy" size={14} color="#FFD700" />
                <Text style={styles.levelText}>Lv.{level}</Text>
              </View>
            </View>
            <TouchableOpacity
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                loadUserStyleProfile();
              }}
              style={styles.refreshButton}
            >
              <Ionicons name="refresh-outline" size={20} color={theme.colors.text.secondary} />
            </TouchableOpacity>
          </View>
          
          {/* レベル進捗バー */}
          <View style={styles.levelProgressContainer}>
            <View style={styles.levelProgressBar}>
              <Animated.View 
                style={[
                  styles.levelProgressFill,
                  { 
                    width: `${levelProgress}%`,
                    backgroundColor: '#FFD700'
                  }
                ]}
              />
            </View>
            {nextLevelSwipes > 0 && (
              <Text style={[styles.levelProgressText, { color: theme.colors.text.secondary }]}>
                次のレベルまであと{nextLevelSwipes}回
              </Text>
            )}
          </View>
        </LinearGradient>
        
        {/* 縦型棒グラフ */}
        <View style={styles.verticalChartContainer}>
          <Text style={[styles.chartTitle, { color: theme.colors.text.primary }]}>
            あなたの好みの傾向
          </Text>
          
          {/* グラフエリア */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.chartScrollView}
            contentContainerStyle={styles.chartContent}
          >
            <View style={styles.chartWrapper}>
              {/* Y軸ラベル */}
              <View style={styles.yAxisLabels}>
                <Text style={styles.axisLabel}>100%</Text>
                <Text style={styles.axisLabel}>75%</Text>
                <Text style={styles.axisLabel}>50%</Text>
                <Text style={styles.axisLabel}>25%</Text>
                <Text style={styles.axisLabel}>0%</Text>
              </View>
              
              {/* グラフ本体 */}
              <View style={styles.barsContainer}>
                {allStyles.map(([style, percentage], index) => {
                  const styleInfo = styleDescriptions[style] || {
                    description: '',
                    icon: 'help-outline',
                    color: '#666'
                  };
                  const barHeight = ((percentage as number) / 100) * 180; // グラフの高さを180pxに設定
                  const isTopStyle = index === 0;
                  
                  return (
                    <TouchableOpacity
                      key={style}
                      style={styles.barWrapper}
                      onPress={() => {
                        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                        setSelectedStyle(style);
                        setShowStyleDetail(true);
                      }}
                      activeOpacity={0.8}
                    >
                      {/* パーセンテージ表示 */}
                      <Text style={[
                        styles.barPercentage,
                        { color: isTopStyle ? theme.colors.primary : theme.colors.text.secondary }
                      ]}>
                        {percentage}%
                      </Text>
                      
                      {/* バーコンテナ */}
                      <View style={styles.barContainer}>
                        <Animated.View 
                          style={[
                            styles.bar,
                            { 
                              height: animatedValues[style] ? 
                                animatedValues[style].interpolate({
                                  inputRange: [0, 100],
                                  outputRange: [0, 180]
                                }) : barHeight,
                              backgroundColor: styleInfo.color,
                            },
                            isTopStyle && styles.topBar
                          ]}
                        >
                          {/* トップスタイルには王冠アイコン */}
                          {isTopStyle && (
                            <View style={styles.crownIcon}>
                              <Ionicons name="star" size={16} color="#fff" />
                            </View>
                          )}
                        </Animated.View>
                      </View>
                      
                      {/* スタイル名とアイコン */}
                      <View style={styles.barLabelContainer}>
                        <View style={[styles.barIcon, { backgroundColor: styleInfo.color + '20' }]}>
                          <Ionicons 
                            name={styleInfo.icon as any} 
                            size={16} 
                            color={styleInfo.color} 
                          />
                        </View>
                        <Text 
                          style={[
                            styles.barLabel,
                            { color: theme.colors.text.primary },
                            isTopStyle && styles.topBarLabel
                          ]}
                          numberOfLines={2}
                        >
                          {style}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          </ScrollView>
          
          {/* インサイトカード */}
          <View style={[styles.insightCard, { backgroundColor: theme.colors.primary + '10' }]}>
            <View style={styles.insightIcon}>
              <Ionicons name="bulb" size={20} color={theme.colors.primary} />
            </View>
            <View style={styles.insightContent}>
              <Text style={[styles.insightTitle, { color: theme.colors.text.primary }]}>
                あなたの傾向
              </Text>
              <Text style={[styles.insightText, { color: theme.colors.text.secondary }]}>
                {allStyles[0] && allStyles[1] ? 
                  `「${allStyles[0][0]}」と「${allStyles[1][0]}」を組み合わせたスタイルがお好みです` :
                  'もう少しスワイプすると、より詳しい分析ができます'
                }
              </Text>
            </View>
          </View>
        </View>
        
        {/* アクションボタン */}
        <View style={styles.styleActions}>
          <TouchableOpacity
            style={[styles.primaryActionButton, { backgroundColor: theme.colors.primary }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              if (allStyles[0]) {
                // トップスタイルでフィルタリング
                console.log('Filter by top style:', allStyles[0][0]);
                // TODO: フィルター適用のロジック
              }
            }}
          >
            <MaterialIcons name="filter-list" size={20} color="#fff" />
            <Text style={styles.primaryActionText}>
              {allStyles[0] ? `「${allStyles[0][0]}」の商品を見る` : 'スタイルで絞り込む'}
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.secondaryActionButton, { 
              borderColor: theme.colors.primary,
            }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              // スタイル診断画面へ遷移
              navigation.navigate('StyleQuiz' as never);
            }}
          >
            <Ionicons name="analytics" size={20} color={theme.colors.primary} />
            <Text style={[styles.secondaryActionText, { color: theme.colors.primary }]}>
              詳細な分析を見る
            </Text>
          </TouchableOpacity>
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
              // imageUrlフィールドを正しく使用
              const imageUrl = product.imageUrl || '';
              
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
                    productTitle={product.title}
                    silentFallback={true}
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
    
    // 品質スコアに基づいて高品質商品を大きく表示
    const isHighQuality = item.qualityScore && item.qualityScore >= 80;
    const isSpecialItem = isHighQuality || (item.popularityScore && item.popularityScore >= 70);
    
    // 特別な商品は大きめのサイズ
    const baseHeight = isSpecialItem ? 220 : 180;
    const hash = item.id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const normalizedHash = (hash % 100) / 100;
    const itemHeight = baseHeight + normalizedHash * (isSpecialItem ? 40 : 80);
    
    // imageUrlフィールドを正しく使用
    const imageUrl = item.imageUrl || '';
    
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
          },
          isSpecialItem && styles.specialProductCard
        ]}
      >
        <View style={[
          styles.productImageContainer, 
          { backgroundColor: theme.colors.surface },
          isSpecialItem && styles.specialImageContainer
        ]}>
          {imageUrl && imageUrl.trim() !== '' ? (
            <CachedImage
              source={{ uri: imageUrl }}
              style={styles.productImage}
              contentFit="cover"
              silentFallback={true}
            />
          ) : (
            <View style={styles.productPlaceholder}>
              <Ionicons name="image-outline" size={40} color={theme.colors.text.secondary} />
            </View>
          )}
          
          {/* 品質スコアバッジ（改善版） */}
          {item.qualityScore && item.qualityScore >= 70 && (
            <View style={[
              styles.qualityScoreBadge, 
              { 
                backgroundColor: item.qualityScore >= 90 
                  ? theme.colors.primary 
                  : item.qualityScore >= 80 
                    ? theme.colors.status?.success || '#10B981'
                    : theme.colors.status?.info || '#3B82F6'
              }
            ]}>
              <Ionicons name="star" size={12} color="#fff" />
              <Text style={styles.qualityScoreText}>{item.qualityScore}点</Text>
            </View>
          )}
          
          {/* 人気度バッジ */}
          {item.popularityScore && item.popularityScore >= 70 && (
            <View style={[styles.popularityBadge, { backgroundColor: '#FF6B6B' }]}>
              <Ionicons name="flame" size={12} color="#fff" />
              <Text style={styles.popularityText}>人気</Text>
            </View>
          )}
          
          {/* 価格タグ（シンプル版） */}
          <View style={[styles.priceTag, { backgroundColor: theme.colors.background + 'F5' }]}>
            <Text style={[styles.priceText, { color: theme.colors.text.primary, fontSize: 16 }]}>
              ¥{item.price.toLocaleString()}
            </Text>
          </View>
          
          <TouchableOpacity
            style={[styles.favoriteButton, { backgroundColor: theme.colors.background + 'E6' }]}
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
              <Text style={styles.usedText}>中古</Text>
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
      
      {/* スタイル詳細モーダル */}
      <Modal
        visible={showStyleDetail}
        transparent
        animationType="fade"
        onRequestClose={() => setShowStyleDetail(false)}
      >
        <Pressable 
          style={styles.modalBackdrop}
          onPress={() => setShowStyleDetail(false)}
        >
          <Pressable style={[styles.styleDetailModal, { backgroundColor: theme.colors.background }]}>
            {selectedStyle && styleDescriptions[selectedStyle] && (
              <>
                <View style={styles.styleDetailHeader}>
                  <View style={[styles.styleDetailIcon, { 
                    backgroundColor: styleDescriptions[selectedStyle].color + '20' 
                  }]}>
                    <Ionicons 
                      name={styleDescriptions[selectedStyle].icon as any} 
                      size={32} 
                      color={styleDescriptions[selectedStyle].color} 
                    />
                  </View>
                  <TouchableOpacity
                    style={styles.modalCloseButton}
                    onPress={() => setShowStyleDetail(false)}
                  >
                    <Ionicons name="close" size={24} color={theme.colors.text.primary} />
                  </TouchableOpacity>
                </View>
                
                <Text style={[styles.styleDetailTitle, { color: theme.colors.text.primary }]}>
                  {selectedStyle}
                </Text>
                
                <Text style={[styles.styleDetailDescription, { color: theme.colors.text.secondary }]}>
                  {styleDescriptions[selectedStyle].description}
                </Text>
                
                {userStyleProfile && userStyleProfile.preferredStyles[selectedStyle] && (
                  <View style={styles.styleDetailStats}>
                    <View style={[styles.styleDetailStatCard, { 
                      backgroundColor: theme.colors.surface || 'rgba(0,0,0,0.03)' 
                    }]}>
                      <Text style={[styles.styleDetailStatValue, { 
                        color: styleDescriptions[selectedStyle].color 
                      }]}>
                        {userStyleProfile.preferredStyles[selectedStyle]}%
                      </Text>
                      <Text style={[styles.styleDetailStatLabel, { 
                        color: theme.colors.text.secondary 
                      }]}>
                        マッチ度
                      </Text>
                    </View>
                  </View>
                )}
                
                <TouchableOpacity
                  style={[styles.styleDetailButton, { 
                    backgroundColor: styleDescriptions[selectedStyle].color 
                  }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    setShowStyleDetail(false);
                    // スタイルでフィルタリング（後で実装）
                    console.log('Filter by style:', selectedStyle);
                  }}
                >
                  <Text style={styles.styleDetailButtonText}>
                    このスタイルの商品を見る
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
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
    backgroundColor: '#ffffff',
    borderRadius: 20,
    overflow: 'hidden',
  },
  styleProfileGradientHeader: {
    paddingTop: 16,
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  styleProfileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  styleProfileTitleSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  styleProfileTitle: {
    fontSize: 18,
    fontWeight: '700',
  },
  levelBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.15)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  levelText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B8860B',
  },
  refreshButton: {
    padding: 8,
  },
  levelProgressContainer: {
    marginTop: 4,
  },
  levelProgressBar: {
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  levelProgressFill: {
    height: '100%',
    borderRadius: 2,
  },
  levelProgressText: {
    fontSize: 11,
  },
  verticalChartContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  chartTitle: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  chartScrollView: {
    height: 280,
  },
  chartContent: {
    paddingRight: 16,
  },
  chartWrapper: {
    flexDirection: 'row',
  },
  yAxisLabels: {
    width: 40,
    height: 180,
    justifyContent: 'space-between',
    marginRight: 8,
  },
  axisLabel: {
    fontSize: 10,
    color: '#999',
    textAlign: 'right',
  },
  barsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: 180,
    gap: 12,
  },
  barWrapper: {
    alignItems: 'center',
    width: 64,
  },
  barPercentage: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  barContainer: {
    width: 48,
    height: 180,
    justifyContent: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderRadius: 8,
    overflow: 'hidden',
  },
  bar: {
    width: '100%',
    borderRadius: 8,
    position: 'relative',
  },
  topBar: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  crownIcon: {
    position: 'absolute',
    top: 8,
    alignSelf: 'center',
  },
  barLabelContainer: {
    alignItems: 'center',
    marginTop: 8,
    width: '100%',
  },
  barIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  barLabel: {
    fontSize: 11,
    textAlign: 'center',
    width: '100%',
  },
  topBarLabel: {
    fontWeight: '600',
  },
  insightCard: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 12,
    marginTop: 16,
    alignItems: 'flex-start',
  },
  insightIcon: {
    marginRight: 12,
  },
  insightContent: {
    flex: 1,
  },
  insightTitle: {
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  insightText: {
    fontSize: 12,
    lineHeight: 18,
  },
  styleActions: {
    flexDirection: 'row',
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  primaryActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  primaryActionText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    gap: 8,
  },
  secondaryActionText: {
    fontSize: 14,
    fontWeight: '600',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  styleDetailModal: {
    width: width * 0.9,
    maxWidth: 400,
    padding: 24,
    borderRadius: 16,
    alignItems: 'center',
  },
  styleDetailHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  styleDetailIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    padding: 8,
  },
  styleDetailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  styleDetailDescription: {
    fontSize: 14,
    lineHeight: 22,
    textAlign: 'center',
    marginBottom: 24,
  },
  styleDetailStats: {
    width: '100%',
    marginBottom: 24,
  },
  styleDetailStatCard: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  styleDetailStatValue: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  styleDetailStatLabel: {
    fontSize: 12,
  },
  styleDetailButton: {
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  styleDetailButtonText: {
    color: '#fff',
    fontSize: 16,
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
    borderRadius: 12,
    overflow: 'hidden',
  },
  specialProductCard: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  productImageContainer: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  specialImageContainer: {
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.2)',
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
  qualityScoreBadge: {
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
  qualityScoreText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  popularityBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    gap: 4,
  },
  popularityText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  priceTag: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 6,
  },
  priceText: {
    fontSize: 14,
    fontWeight: '800',
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
