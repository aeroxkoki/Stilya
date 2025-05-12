import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
  Alert,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Feather } from '@expo/vector-icons';
import { fetchProductById, recordProductClick } from '../services/productService';
import { Product } from '../types/product';
import { useAuth } from '../hooks/useAuth';

type RootStackParamList = {
  ProductDetail: { productId: string };
};

type ProductDetailScreenRouteProp = RouteProp<RootStackParamList, 'ProductDetail'>;

const ProductDetailScreen: React.FC = () => {
  const route = useRoute<ProductDetailScreenRouteProp>();
  const { productId } = route.params;
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // 商品データを取得
  useEffect(() => {
    const loadProduct = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const productData = await fetchProductById(productId);
        setProduct(productData);
      } catch (err) {
        setError('商品データの読み込みに失敗しました。');
        console.error('Error loading product:', err);
      } finally {
        setIsLoading(false);
      }
    };

    loadProduct();
  }, [productId]);

  // 外部リンク（購入ページ）を開く
  const handleBuyPress = async () => {
    if (!product) return;

    try {
      // クリックログを記録
      if (user) {
        await recordProductClick(user.id, product.id);
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

  // 価格をフォーマット
  const formatPrice = (price: number): string => {
    return price.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' });
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

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{ uri: product.imageUrl }}
        style={styles.image}
        resizeMode="cover"
      />

      <View style={styles.contentContainer}>
        <Text style={styles.brand}>{product.brand}</Text>
        <Text style={styles.title}>{product.title}</Text>
        <Text style={styles.price}>{formatPrice(product.price)}</Text>

        <View style={styles.divider} />

        <Text style={styles.descriptionTitle}>商品詳細</Text>
        <Text style={styles.description}>{product.description}</Text>

        <View style={styles.tagsContainer}>
          {product.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity
          style={styles.buyButton}
          onPress={handleBuyPress}
        >
          <Text style={styles.buyButtonText}>購入サイトへ</Text>
          <Feather name="external-link" size={18} color="white" style={styles.buyButtonIcon} />
        </TouchableOpacity>

        <Text style={styles.disclaimerText}>
          ※外部サイトでの購入となります。商品の在庫状況、価格等は変動する可能性があります。
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
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
  image: {
    width: '100%',
    height: 400,
    backgroundColor: '#F5F5F5',
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
  buyButton: {
    backgroundColor: '#3B82F6',
    paddingVertical: 15,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
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
