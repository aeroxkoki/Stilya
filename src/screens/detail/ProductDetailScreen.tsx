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
import { Ionicons } from '@expo/vector-icons';
import { Button } from '@/components/common';
import { RecommendReason, SimilarProducts } from '@/components/recommend';
import { useProductStore } from '@/store/productStore';
import { useAuthStore } from '@/store/authStore';
import { formatPrice, getSimilarProducts } from '@/utils';
import { useRecommendations } from '@/hooks/useRecommendations';
import { useRecordClick } from '@/hooks/useRecordClick';
import { useDeepLinks } from '@/utils/deepLinking';
import { trackShare, trackProductView, EventType, trackEvent } from '@/services/analyticsService';
import { recordProductView, recordProductClick } from '@/services/viewHistoryService';
import { Product, RecommendStackParamList } from '@/types';

type ProductDetailScreenRouteProp = RouteProp<RecommendStackParamList, 'ProductDetail'>;

const { width } = Dimensions.get('window');

const ProductDetailScreen: React.FC = () => {
  const route = useRoute<ProductDetailScreenRouteProp>();
  const navigation = useNavigation();
  const { productId } = route.params;
  const { user } = useAuthStore();
  const { 
    products, 
    loading, 
    error
  } = useProductStore();
  
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
      try {
        // 新しい変数を作成して関数を呼び出す
        const fetchProduct = async (id: string) => {
          if (products && products.length > 0) {
            // 既存の商品データから検索
            const existingProduct = products.find(p => p.id === id);
            if (existingProduct) return existingProduct;
          }
          // 商品データを取得（getState経由でstore内のメソッドにアクセス）
          const productStore = useProductStore.getState();
          // productStore内にfetchProductByIdメソッドがあることを確認
          if (typeof productStore.loadProducts === 'function') {
            await productStore.loadProducts();
            const foundProduct = productStore.products.find(p => p.id === id);
            if (foundProduct) return foundProduct;
          }
        };
        
        const productData = await fetchProduct(productId);
        if (productData) {
          setProduct(productData);
          
          // 類似商品を取得
          const similar = getSimilarProducts(productData, products, 5);
          setSimilarProducts(similar);
          
          // 閲覧履歴に記録（ログインしている場合のみ）
          if (user) {
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
        }
      } catch (error) {
        console.error('Error loading product:', error);
      }
    };
    
    loadProduct();
  }, [productId, products, user]);
  
  // 商品購入へのリンク
  const handleBuyPress = async () => {
    if (!product || !user) return;
    
    // 新しいクリックログ記録フックを使用
    trackClick(product.id, product);

    // 閲覧履歴サービス経由でクリックログも記録
    if (product && user && user.id) {
      recordProductClick(user.id, product.id)
        .catch(err => console.error('Failed to record click:', err));
    }
    
    // アフィリエイトリンクを開く
    try {
      const supported = await Linking.canOpenURL(product.affiliateUrl);
      if (supported) {
        await Linking.openURL(product.affiliateUrl);
      } else {
        console.error('このURLは開けません:', product.affiliateUrl);
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
    // @ts-ignore - タイプエラーを一時的に無視
    navigation.navigate('ProductDetail', { productId: similarProduct.id });
  };
  
  // 戻るボタン
  const handleBackPress = () => {
    navigation.goBack();
  };
  
  // ローディング表示
  if (loading && !product) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-500">商品情報を読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // エラー表示
  if (error && !product) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-red-500 mb-4">エラーが発生しました</Text>
          <Text className="text-gray-700 mb-8 text-center">{error}</Text>
          <Button onPress={handleBackPress}>戻る</Button>
        </View>
      </SafeAreaView>
    );
  }
  
  // 商品が見つからない場合
  if (!product) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-2xl font-bold mb-4">商品が見つかりません</Text>
          <Text className="text-gray-500 text-center mb-8">
            この商品は利用できないか、削除された可能性があります。
          </Text>
          <Button onPress={handleBackPress}>戻る</Button>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        {/* 画像部分 */}
        <View className="relative">
          <Image 
            source={{ uri: product.imageUrl ? product.imageUrl : '' }} 
            style={styles.image} 
            resizeMode="cover"
          />
          
          {/* 戻るボタン */}
          <TouchableOpacity 
            className="absolute top-4 left-4 bg-black/30 rounded-full p-2"
            onPress={handleBackPress}
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          
          {/* シェアボタン */}
          <TouchableOpacity 
            className="absolute top-4 right-4 bg-black/30 rounded-full p-2"
            onPress={handleShare}
          >
            <Ionicons name="share-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
        
        {/* 商品情報 */}
        <View className="p-4">
          {/* 商品タイトルと価格 */}
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-1 mr-2">
              <Text className="text-2xl font-bold" numberOfLines={2}>
                {product.title}
              </Text>
              {product.brand && (
                <Text className="text-gray-600 text-lg">
                  {product.brand}
                </Text>
              )}
            </View>
            <Text className="text-2xl font-bold text-blue-600">
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
            <View className="flex-row flex-wrap mb-4">
              {product.tags.map((tag, index) => (
                <View 
                  key={index} 
                  className="bg-gray-100 px-3 py-1 rounded-full mr-2 mb-2"
                >
                  <Text className="text-gray-800 text-sm">
                    {tag}
                  </Text>
                </View>
              ))}
            </View>
          )}
          
          {/* 購入ボタン */}
          <Button 
            onPress={handleBuyPress}
            className="bg-blue-600 mt-2 mb-6"
          >
            <View className="flex-row items-center justify-center">
              <Ionicons name="cart-outline" size={20} color="white" style={{ marginRight: 8 }} />
              <Text className="text-white font-bold text-lg">購入する</Text>
            </View>
          </Button>
          
          {/* 商品説明（ここでは仮のテキスト） */}
          <View className="mb-6">
            <Text className="text-lg font-bold mb-2">商品情報</Text>
            <Text className="text-gray-700 leading-6">
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
            <View className="mb-4">
              <Text className="text-xs text-gray-400">
                出典: {product.source}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
      
      {/* 下部の購入ボタン（スクロール時も常に表示） */}
      <View className="bg-white border-t border-gray-200 px-4 py-3">
        <Button onPress={handleBuyPress} className="bg-blue-600">
          <View className="flex-row items-center justify-center">
            <Ionicons name="cart-outline" size={20} color="white" style={{ marginRight: 8 }} />
            <Text className="text-white font-bold text-lg">購入する</Text>
          </View>
        </Button>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: width,
  }
});

export default ProductDetailScreen;
