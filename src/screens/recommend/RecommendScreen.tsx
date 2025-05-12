import React, { useEffect, useState } from 'react';
import { View, Text, SafeAreaView, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RecommendList } from '@/components/recommend';
import { Button } from '@/components/common';
import { useProductStore } from '@/store/productStore';
import { useAuthStore } from '@/store/authStore';
import { Product } from '@/types';

const RecommendScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuthStore();
  const { 
    products, 
    fetchProducts, 
    getRecommendedProducts, 
    loading, 
    error 
  } = useProductStore();
  
  // 状態管理
  const [recommendedProducts, setRecommendedProducts] = useState<Product[]>([]);
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loadingRecommended, setLoadingRecommended] = useState<boolean>(false);
  
  // 初回データ読み込み
  useEffect(() => {
    loadData();
  }, []);
  
  // データ読み込み
  const loadData = async () => {
    try {
      if (products.length === 0) {
        await fetchProducts();
      }
      
      // 最新の商品を設定
      setRecentProducts(products.slice(0, 10));
      
      // ユーザーがログインしている場合、おすすめの商品を取得
      if (user) {
        setLoadingRecommended(true);
        const recommended = await getRecommendedProducts(user.id, 20);
        setRecommendedProducts(recommended);
        setLoadingRecommended(false);
      }
    } catch (error) {
      console.error('Recommend screen load error:', error);
      setLoadingRecommended(false);
    }
  };
  
  // リフレッシュハンドラー
  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };
  
  // 商品タップハンドラー
  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail' as never, { productId: product.id } as never);
  };
  
  // スワイプ画面に移動
  const handleGoToSwipe = () => {
    navigation.navigate('Swipe' as never);
  };
  
  // ローディング表示
  if (loading && products.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-500">商品を読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* ヘッダー */}
        <View className="px-4 py-5">
          <Text className="text-2xl font-bold">あなたにおすすめ</Text>
          <Text className="text-gray-500 mt-1">好みに合わせたアイテムを探して見つけよう</Text>
        </View>
        
        {/* ログインしていない場合 */}
        {!user && (
          <View className="bg-blue-50 mx-4 p-4 rounded-lg mb-4">
            <Text className="text-gray-800 mb-2">
              ログインすると、あなたの好みに合わせた商品をおすすめできます。
            </Text>
            <Button 
              onPress={handleGoToSwipe}
              className="bg-blue-600 mt-1"
            >
              まずはスワイプしてみる
            </Button>
          </View>
        )}
        
        {/* おすすめ商品 */}
        {user && (
          <RecommendList
            title="あなたへのおすすめ"
            products={recommendedProducts}
            loading={loadingRecommended}
            error={null}
            onProductPress={handleProductPress}
            emptyMessage="まだおすすめ商品がありません。スワイプしてあなたの好みを教えてください。"
          />
        )}
        
        {/* 最新の商品 */}
        <RecommendList
          title="最新のアイテム"
          products={recentProducts}
          loading={loading && recentProducts.length === 0}
          error={error}
          onProductPress={handleProductPress}
        />
        
        {/* カテゴリ別商品（MVPでは実装しない、将来の拡張用） */}
      </ScrollView>
    </SafeAreaView>
  );
};

export default RecommendScreen;