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
import { Ionicons } from '@expo/vector-icons';
import { 
  ProductHorizontalList,
  OutfitRecommendation
} from '@/components/recommend';
import { Button, Card } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';
import { 
  getEnhancedRecommendations, 
  getOutfitRecommendations 
} from '@/services/integratedRecommendationService';
import { Product } from '@/types';

const { width } = Dimensions.get('window');

// タブの種類
type TabType = 'all' | 'outfits' | 'forYou' | 'trending';

const EnhancedRecommendScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  
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
    // @ts-ignore
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
    // @ts-ignore
    navigation.navigate('Swipe');
  };
  
  // タブ切り替え
  const handleTabChange = (tab: TabType) => {
    setActiveTab(tab);
  };
  
  // ローディング表示
  if (isLoading && recommendations.recommended.length === 0 && recommendations.trending.length === 0) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={{ marginTop: 16, color: '#666' }}>おすすめ商品を読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
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
            <Text style={styles.headerTitle}>Stilya</Text>
            <Text style={styles.headerSubtitle}>
              あなたにピッタリのアイテム
            </Text>
          </View>
          
          {/* 検索ボタン（実際の機能は省略） */}
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => {
              // 検索画面へ遷移するコードを追加
              console.log('Search button pressed');
            }}
          >
            <Ionicons name="search-outline" size={22} color="#333" />
          </TouchableOpacity>
        </View>
        
        {/* ログインしていない場合 */}
        {!user && (
          <View style={styles.promptCard}>
            <Text style={styles.promptText}>
              ログインすると、あなたの好みに合わせた商品をおすすめできます。
            </Text>
            <Button 
              onPress={handleGoToSwipe}
              style={{ backgroundColor: '#3B82F6', marginTop: 8 }}
            >
              まずはスワイプしてみる
            </Button>
          </View>
        )}
        
        {/* エラー表示 */}
        {error && (
          <View style={styles.errorCard}>
            <Ionicons name="alert-circle-outline" size={24} color="#EF4444" />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={loadData}
            >
              <Text style={styles.retryButtonText}>再読み込み</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* タブナビゲーション */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'all' && styles.activeTab]}
            onPress={() => handleTabChange('all')}
          >
            <Text style={[styles.tabText, activeTab === 'all' && styles.activeTabText]}>すべて</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'outfits' && styles.activeTab]}
            onPress={() => handleTabChange('outfits')}
          >
            <Text style={[styles.tabText, activeTab === 'outfits' && styles.activeTabText]}>コーデ</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'forYou' && styles.activeTab]}
            onPress={() => handleTabChange('forYou')}
          >
            <Text style={[styles.tabText, activeTab === 'forYou' && styles.activeTabText]}>あなたへ</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === 'trending' && styles.activeTab]}
            onPress={() => handleTabChange('trending')}
          >
            <Text style={[styles.tabText, activeTab === 'trending' && styles.activeTabText]}>トレンド</Text>
          </TouchableOpacity>
        </View>
        
        {/* コンテンツ表示（タブに応じて切り替え） */}
        {activeTab === 'all' && (
          <>
            {/* おすすめコーディネート */}
            {outfits.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>おすすめコーディネート</Text>
                  <TouchableOpacity onPress={() => handleTabChange('outfits')}>
                    <Text style={styles.seeAllText}>すべて見る</Text>
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
            <Text style={styles.sectionTitle}>おすすめコーディネート</Text>
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
                <Text style={styles.emptyStateText}>
                  コーディネートがありません。もっとスワイプして好みを教えてください。
                </Text>
                <Button
                  onPress={handleGoToSwipe}
                  style={{ backgroundColor: '#3B82F6', marginTop: 12 }}
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
            <Text style={styles.sectionTitle}>あなたへのおすすめ</Text>
            
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
                        <Text style={styles.productTitle} numberOfLines={1}>
                          {product.title}
                        </Text>
                        {product.brand && (
                          <Text style={styles.productBrand} numberOfLines={1}>
                            {product.brand}
                          </Text>
                        )}
                        <Text style={styles.productPrice}>
                          ¥{product.price.toLocaleString()}
                        </Text>
                      </View>
                    </Card>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  まだおすすめがありません。スワイプして好みを教えてください。
                </Text>
                <Button
                  onPress={handleGoToSwipe}
                  style={{ backgroundColor: '#3B82F6', marginTop: 12 }}
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
            <Text style={styles.sectionTitle}>今週のトレンドアイテム</Text>
            
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
                        <Text style={styles.productTitle} numberOfLines={1}>
                          {product.title}
                        </Text>
                        {product.brand && (
                          <Text style={styles.productBrand} numberOfLines={1}>
                            {product.brand}
                          </Text>
                        )}
                        <Text style={styles.productPrice}>
                          ¥{product.price.toLocaleString()}
                        </Text>
                      </View>
                    </Card>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>
                  トレンドアイテムの読み込みに失敗しました。
                </Text>
                <Button
                  onPress={loadData}
                  style={{ backgroundColor: '#3B82F6', marginTop: 12 }}
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
            <Ionicons name="heart-outline" size={64} color="#9CA3AF" />
            <Text style={styles.emptyStateTitle}>おすすめがありません</Text>
            <Text style={styles.emptyStateText}>
              スワイプして「好き」「興味なし」を教えると、
              AIがあなたの好みを学習します。
            </Text>
            <Button
              onPress={handleGoToSwipe}
              style={{ backgroundColor: '#3B82F6', marginTop: 16 }}
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
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  searchButton: {
    width: 40,
    height: 40,
    backgroundColor: '#F3F4F6',
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  promptCard: {
    backgroundColor: '#EBF5FF',
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 12,
  },
  promptText: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
  },
  errorCard: {
    backgroundColor: '#FEF2F2',
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
    color: '#B91C1C',
  },
  retryButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: 'white',
    borderRadius: 16,
    marginLeft: 8,
  },
  retryButtonText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '500',
  },
  tabBar: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 6,
  },
  activeTab: {
    backgroundColor: 'white',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  tabText: {
    fontSize: 14,
    color: '#6B7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#111827',
    fontWeight: '600',
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
    color: '#111827',
    marginLeft: 16,
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: '#3B82F6',
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
    color: '#1F2937',
    marginBottom: 4,
  },
  productBrand: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginVertical: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default EnhancedRecommendScreen;
