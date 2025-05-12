import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Feather } from '@expo/vector-icons';
import { fetchRecommendedProducts } from '../services/productService';
import { Product } from '../types/product';
import { useAuth } from '../hooks/useAuth';
import EmptyState from '../components/EmptyState';

type RootStackParamList = {
  ProductDetail: { productId: string };
};

type RecommendationsScreenNavigationProp = StackNavigationProp<RootStackParamList>;

const RecommendationsScreen: React.FC = () => {
  const navigation = useNavigation<RecommendationsScreenNavigationProp>();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // 商品データを取得
  const loadRecommendations = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!user) {
        setError('ログインが必要です。');
        return;
      }

      const recommendedProducts = await fetchRecommendedProducts(user.id);
      setProducts(recommendedProducts);
    } catch (err) {
      setError('おすすめ商品の読み込みに失敗しました。');
      console.error('Error loading recommended products:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // 初回マウント時に商品データを取得
  useEffect(() => {
    loadRecommendations();
  }, [user]);

  // 商品詳細画面に遷移
  const handleProductPress = (productId: string) => {
    navigation.navigate('ProductDetail', { productId });
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
        <Text style={styles.loadingText}>おすすめ商品を読み込んでいます...</Text>
      </View>
    );
  }

  // エラー発生時
  if (error) {
    return (
      <EmptyState
        message={error}
        buttonText="再読み込み"
        onButtonPress={loadRecommendations}
      />
    );
  }

  // 商品がない場合
  if (!products.length) {
    return (
      <EmptyState
        message="おすすめ商品がありません。もっと多くの商品をスワイプしてみましょう！"
        buttonText="スワイプに戻る"
        onButtonPress={() => navigation.navigate('Swipe' as any)}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>あなたへのおすすめ</Text>
      <Text style={styles.subtitle}>あなたの好みに合わせた商品をピックアップしました</Text>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.productCard}
            onPress={() => handleProductPress(item.id)}
          >
            <Image
              source={{ uri: item.imageUrl }}
              style={styles.productImage}
              resizeMode="cover"
            />
            <View style={styles.productInfo}>
              <Text style={styles.productBrand}>{item.brand}</Text>
              <Text style={styles.productTitle}>{item.title}</Text>
              <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>

              <View style={styles.tagsContainer}>
                {item.tags.slice(0, 2).map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                  </View>
                ))}
              </View>
            </View>
          </TouchableOpacity>
        )}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    padding: 16,
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#757575',
    marginBottom: 20,
  },
  listContainer: {
    paddingBottom: 20,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    overflow: 'hidden',
  },
  productImage: {
    width: 120,
    height: 120,
    backgroundColor: '#F5F5F5',
  },
  productInfo: {
    flex: 1,
    padding: 12,
  },
  productBrand: {
    fontSize: 14,
    color: '#757575',
  },
  productTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginVertical: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
    marginBottom: 8,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#757575',
  },
});

export default RecommendationsScreen;
