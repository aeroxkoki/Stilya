import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity, 
  SafeAreaView, 
  ActivityIndicator, 
  StyleSheet, 
  Dimensions, 
  Linking, 
  Share,
  Platform
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/common';
import CachedImage from '@/components/common/CachedImage';
import { RecommendReason, SimilarProducts } from '@/components/recommend';
import { useProductStore } from '@/store/productStore';
import { useAuth } from '@/hooks/useAuth';
import { useStyle } from '@/contexts/ThemeContext';
import { formatPrice, getSimilarProducts } from '@/utils';
import { useRecommendations } from '@/hooks/useRecommendations';
import { useRecordClick } from '@/hooks/useRecordClick';
import { useDeepLinks } from '@/utils/deepLinking';
import { trackShare, trackProductView, EventType, trackEvent } from '@/services/analyticsService';
import { recordProductView, recordProductClick } from '@/services/viewHistoryService';
import { Product, RecommendStackParamList, ProfileStackParamList, SwipeStackParamList } from '@/types';

// ProductDetailは複数のナビゲーターから呼ばれるため、ユニオン型で定義
type ProductDetailParams = 
  | RecommendStackParamList
  | ProfileStackParamList
  | SwipeStackParamList;

type ProductDetailScreenRouteProp = RouteProp<ProductDetailParams, 'ProductDetail'>;
type ProductDetailScreenNavigationProp = StackNavigationProp<ProductDetailParams, 'ProductDetail'>;

const { width } = Dimensions.get('window');

const ProductDetailScreen: React.FC = () => {
  const route = useRoute<ProductDetailScreenRouteProp>();
  const navigation = useNavigation<ProductDetailScreenNavigationProp>();
  const { productId } = route.params || {};
  const { user } = useAuth();
  const { theme } = useStyle();
  const { 
    products, 
    loading, 
    error
  } = useProductStore();
  
  // 商品IDが存在しない場合の早期リターン
  if (!productId) {
    console.error('[ProductDetailScreen] No productId provided in route params');
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContainer}>
          <Text style={[styles.errorTitle, { color: theme.colors.text.primary }]}>エラーが発生しました</Text>
          <Text style={[styles.errorMessage, { color: theme.colors.text.secondary }]}>
            商品情報が正しく読み込まれませんでした
          </Text>
          <Button onPress={() => navigation.goBack()}>戻る</Button>
        </View>
      </SafeAreaView>
    );
  }
  
  // レコメンデーション関連の情報取得
  const { userPreference } = useRecommendations();
  
  // クリック記録フック
  const { recordProductClick: trackClick } = useRecordClick(user?.id);
  
  // ディープリンク
  const { generateProductLink } = useDeepLinks();
  
  // 商品データ
  const [product, setProduct] = useState<Product | null>(null);
  const [similarProducts, setSimilarProducts] = useState<Product[]>([]);
  
  // 商品データの取得
  useEffect(() => {
    const loadProduct = async () => {
      if (!productId) {
        console.error('[ProductDetailScreen] No productId to load');
        return;
      }
      
      try {
        console.log('[ProductDetailScreen] Loading product:', productId);
        
        // まず既存の商品データから検索
        if (products && products.length > 0) {
          const existingProduct = products.find(p => p.id === productId);
          if (existingProduct) {
            console.log('[ProductDetailScreen] Found product in existing data:', existingProduct);
            setProduct(existingProduct);
            
            // 類似商品を取得
            const similar = getSimilarProducts(existingProduct, products, 5);
            setSimilarProducts(similar);
            return; // 既存データで見つかったので、APIコールは不要
          }
        }
        
        // 商品データがない場合は、fetchProductByIdを使用
        const productStore = useProductStore.getState();
        const productData = await productStore.fetchProductById(productId);
        
        if (productData) {
          console.log('[ProductDetailScreen] Fetched product from API:', productData);
          setProduct(productData);
          
          // productsが空の場合は商品データをロード
          if (products.length === 0) {
            await productStore.loadProducts();
          }
          
          // 類似商品を取得
          const allProducts = useProductStore.getState().products;
          const similar = getSimilarProducts(productData, allProducts, 5);
          setSimilarProducts(similar);
          
          // 閲覧履歴に記録（ログインしている場合のみ）
          if (user && productData.id) {
            // viewアクションをclick_logsテーブルに記録
            recordProductView(user.id, productData.id)
              .catch(err => console.error('Failed to record view:', err));
              
            // 商品閲覧イベントの記録（アナリティクス）
            trackProductView(productData.id, {
              title: productData.title,
              brand: productData.brand,
              price: productData.price,
              category: productData.category,
              source: productData.source,
            }, user.id).catch(err => console.error('Failed to track view:', err));
            
            // 画面表示イベントの記録
            trackEvent(EventType.SCREEN_VIEW, {
              screen_name: 'ProductDetail',
              product_id: productData.id,
            }, user.id).catch(err => console.error('Failed to track screen view:', err));
          }
        } else {
          console.error('[ProductDetailScreen] Product not found for ID:', productId);
        }
      } catch (error) {
        console.error('[ProductDetailScreen] Error loading product:', error);
      }
    };
    
    loadProduct();
  }, [productId, products, user]);
  
  // 商品購入へのリンク
  const handleBuyPress = async () => {
    if (!product || !user) return;
    
    // クリックログ記録フックを使用（click_logsテーブルへの記録とアナリティクスを統合）
    await trackClick(product.id, product);
    
    // アフィリエイトリンクを開く
    try {
      const affiliateUrl = product.affiliateUrl || '';
      const supported = await Linking.canOpenURL(affiliateUrl);
      if (supported) {
        await Linking.openURL(affiliateUrl);
      } else {
        console.error('このURLは開けません:', affiliateUrl);
      }
    } catch (error) {
      console.error('リンクを開く際にエラーが発生しました:', error);
    }
  };
  
  // シェア機能
  const handleShare = async () => {
    if (!product) return;
    
    try {
      // ディープリンク形式のURLを生成
      const deepLink = generateProductLink(product.id);
      const shareMessage = `${product.title} - ${formatPrice(product.price)} | Stilyaで見つけたアイテムです ${deepLink}`;
      
      const shareContent: { message: string; url?: string } = {
        message: shareMessage
      };
      
      if (Platform.OS === 'ios') {
        shareContent.url = deepLink;
      }
      
      const result = await Share.share(shareContent, {
        dialogTitle: '商品をシェア',
      });
      
      if (result.action === Share.sharedAction) {
        // シェアイベントの記録
        await trackShare(product.id, 'share_button', user?.id || '');
      }
    } catch (error) {
      console.error('シェアエラー:', error);
    }
  };
  
  // お気に入りに追加
  const handleFavoritePress = () => {
    // TODO: お気に入り機能の実装
    console.log('お気に入りに追加');
  };
  
  // 類似商品を選択
  const handleSimilarProductPress = (similarProduct: Product) => {
    navigation.push('ProductDetail', { productId: similarProduct.id });
  };
  
  // ローディング表示
  if (loading || !product) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text.secondary }]}>
            商品情報を読み込み中...
          </Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // エラー表示
  if (error && !product) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <View style={styles.centerContainer}>
          <Text style={[styles.errorTitle, { color: theme.colors.text.primary }]}>エラーが発生しました</Text>
          <Text style={[styles.errorMessage, { color: theme.colors.text.secondary }]}>{error}</Text>
          <Button onPress={() => navigation.goBack()}>戻る</Button>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* ヘッダー */}
      <View style={[styles.header, { borderBottomColor: theme.colors.border }]}>
        <TouchableOpacity
          style={styles.headerButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, { color: theme.colors.text.primary }]}>商品詳細</Text>
        
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleFavoritePress}
          >
            <Ionicons name="heart-outline" size={24} color={theme.colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 商品画像 */}
        <View style={[styles.imageContainer, { backgroundColor: theme.colors.surface }]}>
          <CachedImage
            source={{ uri: product.imageUrl }}
            style={styles.productImage}
            contentFit="cover"
            highQuality={true}
            showLoadingIndicator={false}
          />
        </View>
        
        {/* 商品情報 */}
        <View style={styles.infoContainer}>
          {product.brand && (
            <Text style={[styles.brand, { color: theme.colors.text.secondary }]}>{product.brand}</Text>
          )}
          <Text style={[styles.title, { color: theme.colors.text.primary }]}>{product.title}</Text>
          <Text style={[styles.price, { color: theme.colors.primary }]}>{formatPrice(product.price)}</Text>
          
          {/* タグ */}
          {product.tags && product.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {product.tags.map((tag, index) => (
                <View
                  key={index}
                  style={[styles.tag, { backgroundColor: theme.colors.surface }]}
                >
                  <Text style={[styles.tagText, { color: theme.colors.text.secondary }]}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
          
          {/* 商品説明 */}
          {product.description && (
            <View style={styles.descriptionContainer}>
              <Text style={[styles.sectionTitle, { color: theme.colors.text.primary }]}>商品説明</Text>
              <Text style={[styles.description, { color: theme.colors.text.secondary }]}>
                {product.description}
              </Text>
            </View>
          )}
        </View>
        
        {/* レコメンド理由 */}
        {userPreference && (
          <RecommendReason
            product={product}
            userPreference={userPreference}
          />
        )}
        
        {/* 類似商品 */}
        {similarProducts.length > 0 && (
          <SimilarProducts
            products={similarProducts}
            onProductPress={handleSimilarProductPress}
          />
        )}
      </ScrollView>
      
      {/* 購入ボタン */}
      <View style={[styles.bottomContainer, { 
        backgroundColor: theme.colors.background,
        borderTopColor: theme.colors.border 
      }]}>
        <Button
          onPress={handleBuyPress}
          fullWidth
          size="large"
          style={styles.buyButton}
        >
          購入サイトで見る
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  errorMessage: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 16,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  headerRight: {
    flexDirection: 'row',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: width,
    height: width,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  infoContainer: {
    padding: 16,
  },
  brand: {
    fontSize: 14,
    marginBottom: 4,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
  },
  descriptionContainer: {
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    lineHeight: 20,
  },
  bottomContainer: {
    padding: 16,
    borderTopWidth: 1,
  },
  buyButton: {
    marginBottom: Platform.OS === 'ios' ? 0 : 16,
  },
});

export default ProductDetailScreen;
