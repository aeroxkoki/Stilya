import React, { useEffect } from 'react';
import { View, Text, SafeAreaView, ScrollView, RefreshControl, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { RecommendList, CategoryRecommendList } from '@/components/recommend';
import { Button } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';
import { useRecommendations } from '@/hooks/useRecommendations';
import { Product } from '@/types';

const RecommendScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  // レコメンデーションデータ取得
  const { 
    recommendations, 
    categoryRecommendations, 
    userPreference,
    isLoading,
    error,
    refreshRecommendations
  } = useRecommendations();
  
  // 商品タップハンドラー
  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail' as never, { productId: product.id } as never);
  };
  
  // スワイプ画面に移動
  const handleGoToSwipe = () => {
    navigation.navigate('Swipe' as never);
  };
  
  // ローディング表示
  if (isLoading && recommendations.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-white">
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#3B82F6" />
          <Text className="mt-4 text-gray-500">おすすめ商品を読み込み中...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl 
            refreshing={isLoading} 
            onRefresh={refreshRecommendations} 
          />
        }
      >
        {/* ヘッダー */}
        <View className="px-4 py-5">
          <Text className="text-2xl font-bold">あなたにおすすめ</Text>
          <Text className="text-gray-500 mt-1">
            {userPreference 
              ? 'あなたの好みに合わせたアイテムをお届けします' 
              : '好みに合わせたアイテムを探して見つけよう'}
          </Text>
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
        
        {/* スワイプ履歴がない場合 */}
        {user && !userPreference && (
          <View className="bg-blue-50 mx-4 p-4 rounded-lg mb-4">
            <Text className="text-gray-800 mb-2">
              スワイプして「好き」「興味なし」を教えると、AIがあなたの好みを学習します。
            </Text>
            <Button 
              onPress={handleGoToSwipe}
              className="bg-blue-600 mt-1"
            >
              スワイプしてみる
            </Button>
          </View>
        )}
        
        {/* あなたの好みのタグ表示 */}
        {user && userPreference && userPreference.topTags && userPreference.topTags.length > 0 && (
          <View className="mx-4 mb-2">
            <Text className="text-sm text-gray-500 mb-2">あなたの好みの傾向:</Text>
            <View className="flex-row flex-wrap">
              {userPreference.topTags.slice(0, 5).map((tag, index) => (
                <View 
                  key={index} 
                  className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2"
                >
                  <Text className="text-xs text-gray-700">{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
        
        {/* おすすめ商品 */}
        <RecommendList
          title="あなたへのおすすめ"
          products={recommendations}
          loading={isLoading}
          error={error}
          onProductPress={handleProductPress}
          emptyMessage="まだおすすめ商品がありません。スワイプしてあなたの好みを教えてください。"
        />
        
        {/* カテゴリー別おすすめ商品 */}
        {user && Object.keys(categoryRecommendations).length > 0 && (
          <CategoryRecommendList
            categories={categoryRecommendations}
            loading={isLoading}
            error={error}
            onProductPress={handleProductPress}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

export default RecommendScreen;