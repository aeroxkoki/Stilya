import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  Image, 
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
import { RecommendReason, SimilarProducts } from '@/components/recommend';
import { useProductStore } from '@/store/productStore';
import { useAuth } from '@/hooks/useAuth';
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
  const { 
    products, 
    loading, 
    error
  } = useProductStore();
  
  // 商品IDが存在しない場合の早期リターン
  if (!productId) {
    console.error('[ProductDetailScreen] No productId provided in route params');
    return (
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
          <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 8 }}>エラーが発生しました</Text>
          <Text style={{ fontSize: 14, color: '#666', textAlign: 'center', marginBottom: 16 }}>
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
      
      // iOSの場合のみurlを追加
      if (Platform.OS === 'ios' && product.affiliateUrl) {
        shareContent.url = product.affiliateUrl;
      }
      
      await Share.share(shareContent);
      
      // シェアイベントを記録
      if (user && user.id) {
        trackShare(product.id, Platform.OS, user.id)
          .catch(err => console.error('Failed to track share:', err));
      }
    } catch (error) {
      console.error('シェアに失敗しました:', error);
    }
  };
  
  // 類似商品のタップ
  const handleSimilarProductPress = (similarProduct: Product) => {
    navigation.push('ProductDetail', { productId: similarProduct.id });
  };
  
  // 戻るボタン
  const handleBackPress = () => {
    navigation.goBack();
  };
  
  // ローディング表示
  if (loading && !product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text style={styles.loadingText}>商品情報を読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // エラー表示
  if (error && !product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>エラーが発生しました</Text>
          <Text style={styles.errorText}>{error}</Text>
          <Button onPress={handleBackPress}>戻る</Button>
        </View>
      </SafeAreaView>
    );
  }
  
  // 商品が見つからない場合
  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.notFoundContainer}>
          <Text style={styles.notFoundTitle}>商品が見つかりません</Text>
          <Text style={styles.notFoundText}>
            この商品は利用できないか、削除された可能性があります。
          </Text>
          <Button onPress={handleBackPress}>戻る</Button>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        {/* 画像部分 */}
        <View style={styles.imageContainer}>
          <Image 
            source={{ uri: product.imageUrl ? product.imageUrl : '' }} 
            style={styles.image} 
            resizeMode="cover"
          />
          
          {/* 戻るボタン */}
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          {/* シェアボタン */}
          <TouchableOpacity 
            style={styles.shareButton}
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* 商品情報 */}
        <View style={styles.contentContainer}>
          {/* 商品タイトルと価格 */}
          <View style={styles.productHeader}>
            <View style={styles.productInfo}>
              <Text style={styles.productTitle} numberOfLines={2}>
                {product.title}
              </Text>
              {product.brand && (
                <Text style={styles.brandName}>
                  {product.brand}
                </Text>
              )}
            </View>
            <Text style={styles.price}>
              {formatPrice(product.price)}
            </Text>
          </View>
          
          {/* おすすめ理由（ログイン済みユーザーのみ） */}
          {user && userPreference && (
            <RecommendReason
              product={product}
              userPreference={userPreference}
            />
          )}
          
          {/* タグ */}
          {product.tags && product.tags.length > 0 && (
            <View style={styles.tagsContainer}>
              {product.tags.map((tag, index) => (
                <View 
                  key={index} 
                  style={styles.tag}
                >
                  <Text style={styles.tagText}>
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          )}
          
          {/* 購入ボタン */}
          <Button 
            onPress={handleBuyPress}
            style={styles.buyButton}
          >
            <View style={styles.buyButtonContent}>
              <Ionicons name="cart-outline" size={20} color="white" style={{ marginRight: 8 }} />
              <Text style={styles.buyButtonText}>購入する</Text>
            </View>
          </Button>
          
          {/* 商品説明（ここでは仮のテキスト） */}
          <View style={styles.descriptionSection}>
            <Text style={styles.sectionTitle}>商品情報</Text>
            <Text style={styles.descriptionText}>
              この商品の詳細情報を確認するには、「購入する」ボタンをタップして販売サイトをご覧ください。
              {'\n\n'}
              ※ 価格や送料、在庫状況などは販売サイトにて最新の情報をご確認ください。
            </Text>
          </View>
          
          {/* 類似商品（コンポーネント化） */}
          {similarProducts.length > 0 && (
            <SimilarProducts
              products={similarProducts}
              onProductPress={handleSimilarProductPress}
              title="類似アイテム"
            />
          )}
          
          {/* 出典情報 */}
          {product.source && (
            <View style={styles.sourceContainer}>
              <Text style={styles.sourceText}>
                出典: {product.source}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* 下部の購入ボタン（スクロール時も常に表示） */}
      <View style={styles.bottomBar}>
        <Button onPress={handleBuyPress} style={styles.bottomBuyButton}>
          <View style={styles.bottomBuyButtonContent}>
            <Ionicons name="cart-outline" size={20} color="white" style={{ marginRight: 8 }} />
            <Text style={styles.buyButtonText}>購入する</Text>
          </View>
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: width,
  },
  backButton: {
    position: 'absolute',
    top: 50,
    left: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  shareButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    padding: 20,
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  productInfo: {
    flex: 1,
    marginRight: 10,
  },
  productTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#1a1a1a',
  },
  brandName: {
    fontSize: 14,
    color: '#666',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3B82F6',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginVertical: 15,
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  buyButton: {
    marginTop: 20,
  },
  buyButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  descriptionSection: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1a1a1a',
  },
  descriptionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#666',
  },
  sourceContainer: {
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    alignItems: 'center',
  },
  sourceText: {
    fontSize: 12,
    color: '#999',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingVertical: 10,
    paddingBottom: 30,
  },
  bottomBuyButton: {
    width: '100%',
  },
  bottomBuyButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1a1a1a',
  },
  errorText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  notFoundContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  notFoundTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#1a1a1a',
  },
  notFoundText: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
});

export default ProductDetailScreen;
