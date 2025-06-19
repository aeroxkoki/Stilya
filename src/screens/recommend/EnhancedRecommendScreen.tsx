import React, { useEffect, useState, useCallback } from 'react';
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
  Image
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RecommendScreenProps } from '@/navigation/types';
import { Ionicons } from '@expo/vector-icons';
import { 
  ProductHorizontalList,
  OutfitRecommendation
} from '@/components/recommend';
import { Button, Card } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';
import { useStyle } from '@/contexts/ThemeContext';
import { 
  getEnhancedRecommendations, 
  getOutfitRecommendations 
} from '@/services/integratedRecommendationService';
import { Product } from '@/types';

const { width } = Dimensions.get('window');

// タブの種類
type TabType = 'all' | 'outfits' | 'forYou' | 'trending';
type NavigationProp = RecommendScreenProps<'RecommendHome'>['navigation'];

const EnhancedRecommendScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const { user } = useAuth();
  const { theme } = useStyle();
  
  // 状態管理
  const [isLoading, setIsLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<{
    recommended: Product[];
    trending: Product[];
    forYou: Product[];
  }>({
    recommended: [],
    trending: [],
    forYou: [],
  });
  
  const [outfits, setOutfits] = useState<Array<{
    top: Product | null;
    bottom: Product | null;
    outerwear?: Product | null;
    accessories?: Product | null;
  }>>([]);
  
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  
  // データ読み込み
  const loadData = useCallback(async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // 並列でデータを取得
      const [recommendationResults, outfitResults] = await Promise.all([
        getEnhancedRecommendations(user.id, 20),
        getOutfitRecommendations(user.id, 5)
      ]);
      
      setRecommendations({
        recommended: recommendationResults.recommended,
        trending: recommendationResults.trending,
        forYou: recommendationResults.forYou,
      });
      
      setOutfits(outfitResults.outfits);
    } catch (err: any) {
      console.error('Failed to load recommendations:', err);
      setError(err.message || 'レコメンデーションの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  }, [user]);
  
  // 初回読み込み
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  // 商品タップハンドラー
  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail', { productId: product.id });
  };
  
  // コーディネートタップハンドラー
  const handleOutfitPress = (outfit: typeof outfits[0]) => {
    // 最初の商品で詳細ページを開く（実際のアプリでは複数商品を表示する専用ページがベター）
    const firstProduct = outfit.top || outfit.bottom || outfit.outerwear || outfit.accessories;
    if (firstProduct) {
      handleProductPress(firstProduct);
    }
  };
  
  // スワイプ画面に移動
  const handleGoToSwipe = () => {
    // タブナビゲーターのスワイプタブに移動
    const parentNavigation = navigation.getParent();
    if (parentNavigation) {
      parentNavigation.navigate('Swipe');
    }
  };
  
  // タブ切り替え
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };
  
  // ローディング表示
  if (isLoading && recommendations.recommended.length === 0 && recommendations.trending.length === 0) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>おすすめ商品を読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        style={{ flex: 1 }}
        refreshControl={
          <RefreshControl 
            refreshing={isLoading} 
            onRefresh={loadData} 
          />
        }
      >
        {/* ヘッダー */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>Stilya</Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.text.secondary }]}>
              あなたにピッタリのアイテム
            </Text>
          </View>
          
          {/* 検索ボタン（実際の機能は省略） */}
          <TouchableOpacity 
            style={[styles.searchButton, { backgroundColor: theme.colors.surface }]}
            onPress={() => {
              // 検索画面へ遷移するコードを追加
              console.log('Search button pressed');
            }}
          >
            <Ionicons name="search-outline" size={22} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>
        
        {/* ログインしていない場合 */}
        {!user && (
          <View style={[styles.promptCard, { backgroundColor: theme.colors.primary + '15' }]}>
            <Text style={[styles.promptText, { color: theme.colors.text.primary }]}>
              ログインすると、あなたの好みに合わせた商品をおすすめできます。
            </Text>
            <Button 
              onPress={handleGoToSwipe}
              style={{ backgroundColor: theme.colors.primary, marginTop: 8 }}
            >
              まずはスワイプしてみる
            </Button>
          </View>
        )}
        
        {/* エラー表示 */}
        {error && (
          <View style={[styles.errorCard, { backgroundColor: theme.colors.error + '15' }]}>
            <Ionicons name="alert-circle-outline" size={24} color={theme.colors.error} />
            <Text style={[styles.errorText, { color: theme.colors.error }]}>{error}</Text>
            <TouchableOpacity 
              style={[styles.retryButton, { backgroundColor: theme.colors.background }]}
              onPress={loadData}
            >
              <Text style={[styles.retryButtonText, { color: theme.colors.error }]}>再読み込み</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* タブナビゲーション */}
        <View style={[styles.tabBar, { backgroundColor: theme.colors.surface }]}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && { backgroundColor: theme.colors.background }]}
            onPress={() => handleTabChange('all')}
          >
            <Text style={[styles.tabText, { color: theme.colors.text.secondary }, activeTab === 'all' && { color: theme.colors.text.primary }]}>すべて</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'outfits' && { backgroundColor: theme.colors.background }]}
            onPress={() => handleTabChange('outfits')}
          >
            <Text style={[styles.tabText, { color: theme.colors.text.secondary }, activeTab === 'outfits' && { color: theme.colors.text.primary }]}>コーデ</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'forYou' && { backgroundColor: theme.colors.background }]}
            onPress={() => handleTabChange('forYou')}
          >
            <Text style={[styles.tabText, { color: theme.colors.text.secondary }, activeTab === 'forYou' && { color: theme.colors.text.primary }]}>あなたへ</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'trending' && { backgroundColor: theme.colors.background }]}
            onPress={() => handleTabChange('trending')}
          >
            <Text style={[styles.tabText, { color: theme.colors.text.secondary }, activeTab === 'trending' && { color: theme.colors.text.primary }]}>トレンド</Text>
          </TouchableOpacity>
        </View>
        
        {/* コンテンツ表示（タブに応じて切り替え） */}
        {activeTab === 'all' && (
          <>
            {/* おすすめコーディネート */}
            {outfits.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>おすすめコーディネート</Text>
                  <TouchableOpacity onPress={() => handleTabChange('outfits')}>
                    <Text style={[styles.seeAllText, { color: theme.colors.primary }]}>すべて見る</Text>
                  </TouchableOpacity>
                </View>
                
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.outfitsContainer}
                >
                  {outfits.slice(0, 3).map((outfit, index) => (
                    <OutfitRecommendation
                      key={`outfit-${index}`}
                      outfit={outfit}
                      onPress={() => handleOutfitPress(outfit)}
                    />
                  ))}
                </ScrollView>
              </View>
            )}
            
            {/* あなたへのおすすめ */}
            {recommendations.forYou.length > 0 && (
              <ProductHorizontalList
                title="あなたへのおすすめ"
                products={recommendations.forYou}
                onProductPress={handleProductPress}
                onSeeAllPress={() => handleTabChange('forYou')}
                style={styles.section}
              />
            )}
            
            {/* あなたにおすすめ（内部DB） */}
            {recommendations.recommended.length > 0 && (
              <ProductHorizontalList
                title="最近の傾向を反映"
                products={recommendations.recommended}
                onProductPress={handleProductPress}
                style={styles.section}
              />
            )}
            
            {/* トレンドアイテム */}
            {recommendations.trending.length > 0 && (
              <ProductHorizontalList
                title="今週のトレンドアイテム"
                products={recommendations.trending}
                onProductPress={handleProductPress}
                onSeeAllPress={() => handleTabChange('trending')}
                style={styles.section}
              />
            )}
          </>
        )}
        
        {/* コーディネートタブ */}
        {activeTab === 'outfits' && (
          <View style={styles.fullWidthSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>おすすめコーディネート</Text>
            {outfits.length > 0 ? (
              outfits.map((outfit, index) => (
                <OutfitRecommendation
                  key={`outfit-full-${index}`}
                  outfit={outfit}
                  onPress={() => handleOutfitPress(outfit)}
                  layout="full"
                  style={styles.fullOutfitItem}
                />
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyStateText, { color: theme.colors.text.secondary }]}>
                  コーディネートがありません。もっとスワイプして好みを教えてください。
                </Text>
                <Button
                  onPress={handleGoToSwipe}
                  style={{ backgroundColor: theme.colors.primary, marginTop: 12 }}
                >
                  スワイプする
                </Button>
              </View>
            )}
          </View>
        )}
        
        {/* あなたへのおすすめタブ */}
        {activeTab === 'forYou' && (
          <View style={styles.gridSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>あなたへのおすすめ</Text>
            
            {recommendations.forYou.length > 0 ? (
              <View style={styles.productGrid}>
                {recommendations.forYou.map((product) => (
                  <TouchableOpacity 
                    key={`for-you-${product.id}`}
                    style={styles.gridItem}
                    onPress={() => handleProductPress(product)}
                  >
                    <Card style={styles.productCard}>
                      <Image
                        source={{ uri: product.imageUrl }}
                        style={styles.productImage}
                      />
                      <View style={styles.productInfo}>
                        <Text style={[styles.productTitle, { color: theme.colors.text.primary }]} numberOfLines={1}>
                          {product.title}
                        </Text>
                        {product.brand && (
                          <Text style={[styles.productBrand, { color: theme.colors.text.secondary }]} numberOfLines={1}>
                            {product.brand}
                          </Text>
                        )}
                        <Text style={[styles.productPrice, { color: theme.colors.text.primary }]}>
                          ¥{product.price.toLocaleString()}
                        </Text>
                      </View>
                    </Card>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyStateText, { color: theme.colors.text.secondary }]}>
                  まだおすすめがありません。スワイプして好みを教えてください。
                </Text>
                <Button
                  onPress={handleGoToSwipe}
                  style={{ backgroundColor: theme.colors.primary, marginTop: 12 }}
                >
                  スワイプする
                </Button>
              </View>
            )}
          </View>
        )}
        
        {/* トレンドタブ */}
        {activeTab === 'trending' && (
          <View style={styles.gridSection}>
            <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>今週のトレンドアイテム</Text>
            
            {recommendations.trending.length > 0 ? (
              <View style={styles.productGrid}>
                {recommendations.trending.map((product) => (
                  <TouchableOpacity 
                    key={`trending-${product.id}`}
                    style={styles.gridItem}
                    onPress={() => handleProductPress(product)}
                  >
                    <Card style={styles.productCard}>
                      <Image
                        source={{ uri: product.imageUrl }}
                        style={styles.productImage}
                      />
                      <View style={styles.productInfo}>
                        <Text style={[styles.productTitle, { color: theme.colors.text.primary }]} numberOfLines={1}>
                          {product.title}
                        </Text>
                        {product.brand && (
                          <Text style={[styles.productBrand, { color: theme.colors.text.secondary }]} numberOfLines={1}>
                            {product.brand}
                          </Text>
                        )}
                        <Text style={[styles.productPrice, { color: theme.colors.text.primary }]}>
                          ¥{product.price.toLocaleString()}
                        </Text>
                      </View>
                    </Card>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={[styles.emptyStateText, { color: theme.colors.text.secondary }]}>
                  トレンドアイテムの読み込みに失敗しました。
                </Text>
                <Button
                  onPress={loadData}
                  style={{ backgroundColor: theme.colors.primary, marginTop: 12 }}
                >
                  再試行
                </Button>
              </View>
            )}
          </View>
        )}
        
        {/* 商品無しの場合 */}
        {activeTab === 'all' && 
         recommendations.recommended.length === 0 && 
         recommendations.trending.length === 0 && 
         recommendations.forYou.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={64} color={theme.colors.text.hint} />
            <Text style={[styles.emptyStateTitle, { color: theme.colors.text.primary }]}>おすすめがありません</Text>
            <Text style={[styles.emptyStateText, { color: theme.colors.text.secondary }]}>
              スワイプして「好き」「興味なし」を教えると、
              AIがあなたの好みを学習します。
            </Text>
            <Button
              onPress={handleGoToSwipe}
              style={{ backgroundColor: theme.colors.primary, marginTop: 16 }}
            >
              スワイプする
            </Button>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
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
  loadingText: {
    marginTop: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    fontSize: 14,
    marginTop: 2,
  },
  searchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  promptText: {
    fontSize: 14,
    lineHeight: 20,
  },
  errorCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  errorText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 14,
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginLeft: 8,
  },
  retryButtonText: {
    fontSize: 12,
    fontWeight: '500',
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  tabText: {
    fontSize: 14,
    fontWeight: '500',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 16,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    fontWeight: '500',
  },
  outfitsContainer: {
    paddingLeft: 16,
    paddingRight: 8,
  },
  fullWidthSection: {
    paddingTop: 8,
    paddingBottom: 24,
  },
  fullOutfitItem: {
    marginHorizontal: 16,
    marginBottom: 16,
  },
  gridSection: {
    padding: 16,
  },
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  gridItem: {
    width: (width - 48) / 2,
    marginBottom: 16,
  },
  productCard: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: 180,
    resizeMode: 'cover',
  },
  productInfo: {
    padding: 12,
  },
  productTitle: {
    fontSize: 13,
    fontWeight: '500',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 11,
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  emptyStateText: {
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default EnhancedRecommendScreen;
