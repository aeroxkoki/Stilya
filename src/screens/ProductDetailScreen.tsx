import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
  Share,
  FlatList,
  Dimensions,
  Animated,
  Image as RNImage,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
// import { BlurView } from 'expo-blur';
// import * as Haptics from 'expo-haptics';
// これらのモジュールのモック
const BlurView = ({ intensity, style, children }: any) => <View style={style}>{children}</View>;
const Haptics = {
  impactAsync: () => Promise.resolve(),
  ImpactFeedbackStyle: {
    Light: 'light',
    Medium: 'medium',
    Heavy: 'heavy',
  },
};
import { fetchProductById, fetchProductsByTags, recordProductClick } from '../services/productService';
import { toggleFavorite, isFavorite } from '../services/favoriteService';
import { Product } from '../types/product';
import { useAuth } from '../hooks/useAuth';
import ProductCard from '../components/product/ProductCard';

type RootStackParamList = {
  ProductDetail: { productId: string };
};

type ProductDetailScreenRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const ProductDetailScreen: React.FC = () => {
  const route = useRoute<ProductDetailScreenRouteProp>();
  const navigation = useNavigation();
  const { productId } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [isFavorited, setIsFavorited] = useState<boolean>(false);
  const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
  const { user } = useAuth();
  
  const scrollY = useRef(new Animated.Value(0)).current;
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 100, 150],
    outputRange: [0, 0.5, 1],
    extrapolate: 'clamp',
  });

  // 商品データを取得
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const productData = await fetchProductById(productId);
        setProduct(productData);
        
        // お気に入り状態を確認
        if (user && productData) {
          const favorited = await isFavorite(user.id, productData.id);
          setIsFavorited(favorited);
        }
        
        // 関連商品を取得
        if (productData && productData.tags && productData.tags.length > 0) {
          const related = await fetchProductsByTags(
            productData.tags,
            6,
            [productData.id] // 自分自身は除外
          );
          setRelatedProducts(related);
        }
      } catch (err) {
        setError('商品データの読み込みに失敗しました。');
        console.error('Error loading product:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [productId, user]);

  // 外部リンク（購入ページ）を開く
  const handleBuyPress = async () => {
    if (!product) return;

    try {
      // 触覚フィードバック
      await Haptics.impactAsync();
      
      // クリックログを記録
      if (user) {
        await recordProductClick(product.id);
      }

      // 外部リンクを開く
      const canOpen = await Linking.canOpenURL(product.affiliateUrl);
      
      if (canOpen) {
        await Linking.openURL(product.affiliateUrl);
      } else {
        Alert.alert('エラー', 'このリンクを開くことができません。');
      }
    } catch (error) {
      console.error('Error opening link:', error);
      Alert.alert('エラー', 'リンクを開く際にエラーが発生しました。');
    }
  };

  // お気に入り切り替え
  const handleToggleFavorite = useCallback(async () => {
    if (!user || !product) return;
    
    try {
      // 触覚フィードバック
      await Haptics.impactAsync();
      
      // まずUIを先に更新（楽観的更新）
      setIsFavorited(prev => !prev);
      
      // APIでお気に入り状態を切り替え
      await toggleFavorite(user.id, product.id);
    } catch (error) {
      // エラー時は状態を元に戻す
      setIsFavorited(prev => !prev);
      console.error('Error toggling favorite:', error);
      Alert.alert('エラー', 'お気に入りの更新に失敗しました。');
    }
  }, [user, product]);

  // 共有機能
  const handleShare = async () => {
    if (!product) return;
    
    try {
      // 触覚フィードバック
      await Haptics.impactAsync();
      
      await Share.share({
        title: product.title,
        message: `${product.title} - ${product.brand}\n${product.price.toLocaleString('ja-JP')}円\n\n${product.affiliateUrl}`,
      });
    } catch (error) {
      console.error('Error sharing product:', error);
    }
  };

  // 関連商品をタップした時の処理
  const handleRelatedProductPress = (relatedProductId: string) => {
    // 自分自身と同じIDなら何もしない
    if (relatedProductId === productId) return;
    
    // 同じ画面を再利用して新しい商品IDで表示（パラメータを更新）
    navigation.setParams({ productId: relatedProductId } as any);
  };

  // 価格をフォーマット
  const formatPrice = (price: number): string => {
    return price.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' });
  };

  // 複数画像対応（仮実装）
  const getProductImages = (product: Product): string[] => {
    // 本来はAPIから複数画像を取得するが、MVPでは単一画像を複製
    if (!product || !product.imageUrl) return [];
    return [product.imageUrl];
  };

  // ローディング中
  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#3B82F6" />
        <Text style={styles.loadingText}>商品情報を読み込んでいます...</Text>
      </View>
    );
  }

  // エラー発生時
  if (error || !product) {
    return (
      <View style={styles.centerContainer}>
        <Feather name="alert-circle" size={80} color="#E0E0E0" />
        <Text style={styles.errorText}>{error || '商品が見つかりませんでした。'}</Text>
      </View>
    );
  }

  // 商品画像（複数あれば横スクロール）
  const productImages = getProductImages(product);
  
  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* 戻るボタン付きヘッダー（スクロールで表示） */}
      <Animated.View style={[
        styles.header,
        { opacity: headerOpacity }
      ]}>
        <BlurView intensity={80} style={styles.blurHeader}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {product.title}
          </Text>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleToggleFavorite}
          >
            <Feather name={isFavorited ? "heart" : "heart"} size={24} color={isFavorited ? "#F87171" : "#333"} />
          </TouchableOpacity>
        </BlurView>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* 商品画像スライダー */}
        <View style={styles.imageContainer}>
          <FlatList
            data={productImages.length > 0 ? productImages : [product.imageUrl]}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => (
              <RNImage
                source={{ uri: item || '' }}
                style={styles.image}
                resizeMode="cover"
              />
            )}
            keyExtractor={(_, index) => `image-${index}`}
            onMomentumScrollEnd={(event) => {
              const newIndex = Math.round(
                event.nativeEvent.contentOffset.x / SCREEN_WIDTH
              );
              setCurrentImageIndex(newIndex);
            }}
          />
          
          {/* 画像インジケーター（画像が複数ある場合のみ表示） */}
          {productImages.length > 1 && (
            <View style={styles.indicatorContainer}>
              {productImages.map((_, index) => (
                <View
                  key={`indicator-${index}`}
                  style={[
                    styles.indicator,
                    index === currentImageIndex && styles.indicatorActive,
                  ]}
                />
              ))}
            </View>
          )}
          
          {/* 上部アクションボタン */}
          <View style={styles.imageActions}>
            <TouchableOpacity
              style={styles.imageActionButton}
              onPress={() => navigation.goBack()}
            >
              <Feather name="arrow-left" size={24} color="white" />
            </TouchableOpacity>
            
            <View style={styles.imageRightActions}>
              <TouchableOpacity
                style={styles.imageActionButton}
                onPress={handleToggleFavorite}
              >
               <Feather name={isFavorited ? "heart" : "heart"} size={24} color={isFavorited ? "#F87171" : "white"} />
              </TouchableOpacity>
              
              <TouchableOpacity
                style={styles.imageActionButton}
                onPress={handleShare}
              >
                <Feather name="share" size={24} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.contentContainer}>
          {/* 商品基本情報 */}
          <Text style={styles.brand}>{product.brand}</Text>
          <Text style={styles.title}>{product.title}</Text>
          <Text style={styles.price}>{formatPrice(product.price)}</Text>

          <View style={styles.divider} />

          {/* 商品説明 */}
          <Text style={styles.descriptionTitle}>商品詳細</Text>
          <Text style={styles.description}>{product.description || '詳細情報は現在準備中です。'}</Text>

          {/* タグ一覧 */}
          <View style={styles.tagsContainer}>
            {product.tags && product.tags.map((tag, index) => (
              <View key={index} style={styles.tag}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>

          {/* 関連商品 */}
          {relatedProducts.length > 0 && (
            <>
              <Text style={styles.relatedTitle}>関連商品</Text>
              <FlatList
                data={relatedProducts}
                horizontal
                showsHorizontalScrollIndicator={false}
                renderItem={({ item }) => (
                  <ProductCard
                    product={item}
                    onPress={handleRelatedProductPress}
                    style={styles.relatedProductCard}
                    compact
                  />
                )}
                keyExtractor={(item) => `related-${item.id}`}
                contentContainerStyle={styles.relatedProductsContainer}
              />
            </>
          )}

          {/* 購入ボタン */}
          <TouchableOpacity
            style={styles.buyButton}
            onPress={handleBuyPress}
            activeOpacity={0.7}
          >
            <Text style={styles.buyButtonText}>購入サイトへ</Text>
            <Feather name="external-link" size={18} color="white" style={styles.buyButtonIcon} />
          </TouchableOpacity>

          <Text style={styles.disclaimerText}>
            ※外部サイトでの購入となります。商品の在庫状況、価格等は変動する可能性があります。
          </Text>
        </View>
      </Animated.ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#757575',
  },
  errorText: {
    marginTop: 15,
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
  },
  blurHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 60,
    paddingHorizontal: 15,
    paddingTop: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginHorizontal: 10,
  },
  backButton: {
    padding: 8,
  },
  favoriteButton: {
    padding: 8,
  },
  imageContainer: {
    width: '100%',
    height: 450,
    backgroundColor: '#F5F5F5',
  },
  image: {
    width: SCREEN_WIDTH,
    height: 450,
    backgroundColor: '#F5F5F5',
  },
  indicatorContainer: {
    position: 'absolute',
    bottom: 20,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    marginHorizontal: 3,
  },
  indicatorActive: {
    backgroundColor: 'white',
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  imageActions: {
    position: 'absolute',
    top: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
  },
  imageActionButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 5,
  },
  imageRightActions: {
    flexDirection: 'row',
  },
  contentContainer: {
    padding: 20,
  },
  brand: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  price: {
    fontSize: 22,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 15,
  },
  divider: {
    height: 1,
    backgroundColor: '#E0E0E0',
    marginVertical: 15,
  },
  descriptionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
    marginBottom: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 30,
  },
  tag: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  tagText: {
    fontSize: 14,
    color: '#757575',
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  relatedProductsContainer: {
    paddingBottom: 15,
  },
  relatedProductCard: {
    width: 150,
    marginRight: 12,
  },
  buyButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buyButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
  buyButtonIcon: {
    marginLeft: 8,
  },
  disclaimerText: {
    fontSize: 12,
    color: '#9E9E9E',
    textAlign: 'center',
    marginBottom: 20,
  },
});

export default ProductDetailScreen;
