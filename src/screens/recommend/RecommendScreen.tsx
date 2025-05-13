import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  RefreshControl, 
  ActivityIndicator,
  TouchableOpacity
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { 
  RecommendList, 
  CategoryRecommendList, 
  FilterModal, 
  StyleTypeDisplay
} from '@/components/recommend';
import { Button } from '@/components/common';
import { useAuth } from '@/hooks/useAuth';
import { useRecommendations } from '@/hooks/useRecommendations';
import { FilterOptions } from '@/components/recommend/FilterModal';
import { Product } from '@/types';

const RecommendScreen: React.FC = () => {
  const navigation = useNavigation();
  const { user } = useAuth();
  
  // フィルターモーダルの表示状態
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterOptions>({
    categories: [],
    priceRange: [0, Infinity],
    selectedTags: []
  });
  
  // フィルター適用状態
  const [isFiltered, setIsFiltered] = useState(false);
  
  // レコメンデーションデータ取得
  const { 
    recommendations, 
    categoryRecommendations, 
    userPreference,
    isLoading,
    error,
    refreshRecommendations,
    getFilteredRecommendations
  } = useRecommendations();
  
  // フィルター適用済みの商品リスト
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  // 利用可能なタグのリスト（フィルター用）
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  // 初回ロード時に利用可能なタグを集める
  useEffect(() => {
    if (recommendations.length > 0 || Object.keys(categoryRecommendations).length > 0) {
      const allTags = new Set<string>();
      
      // レコメンド商品からタグを抽出
      recommendations.forEach(product => {
        if (product.tags) {
          product.tags.forEach(tag => allTags.add(tag));
        }
      });
      
      // カテゴリー別商品からもタグを抽出
      Object.values(categoryRecommendations).forEach(products => {
        products.forEach(product => {
          if (product.tags) {
            product.tags.forEach(tag => allTags.add(tag));
          }
        });
      });
      
      setAvailableTags(Array.from(allTags));
    }
  }, [recommendations, categoryRecommendations]);
  
  // フィルター適用
  useEffect(() => {
    if (isFiltered) {
      const filtered = getFilteredRecommendations(activeFilters);
      setFilteredProducts(filtered);
    }
  }, [isFiltered, activeFilters, getFilteredRecommendations]);
  
  // 商品タップハンドラー
  const handleProductPress = (product: Product) => {
    navigation.navigate('ProductDetail' as never, { productId: product.id } as never);
  };
  
  // スワイプ画面に移動
  const handleGoToSwipe = () => {
    navigation.navigate('Swipe' as never);
  };
  
  // フィルターモーダルを開く
  const openFilterModal = () => {
    setFilterModalVisible(true);
  };
  
  // フィルターを適用
  const applyFilters = (filters: FilterOptions) => {
    setActiveFilters(filters);
    setIsFiltered(true);
  };
  
  // フィルターをクリア
  const clearFilters = () => {
    setActiveFilters({
      categories: [],
      priceRange: [0, Infinity],
      selectedTags: []
    });
    setIsFiltered(false);
  };
  
  // フィルター適用中のバッジカウント
  const getFilterBadgeCount = (): number => {
    let count = 0;
    if (activeFilters.categories.length > 0) count += 1;
    if (activeFilters.priceRange[0] > 0 || activeFilters.priceRange[1] < Infinity) count += 1;
    if (activeFilters.selectedTags.length > 0) count += 1;
    return count;
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
        {/* ヘッダー（フィルターボタン付き） */}
        <View className="px-4 py-5 flex-row justify-between items-center">
          <View>
            <Text className="text-2xl font-bold">あなたにおすすめ</Text>
            <Text className="text-gray-500 mt-1">
              {userPreference 
                ? 'あなたの好みに合わせたアイテムをお届けします' 
                : '好みに合わせたアイテムを探して見つけよう'}
            </Text>
          </View>
          
          {/* フィルターボタン */}
          <TouchableOpacity 
            className="bg-gray-100 p-2 rounded-full relative"
            onPress={openFilterModal}
          >
            <Ionicons name="options-outline" size={24} color="#333" />
            {getFilterBadgeCount() > 0 && (
              <View className="absolute -top-1 -right-1 bg-blue-500 rounded-full w-5 h-5 items-center justify-center">
                <Text className="text-white text-xs font-bold">{getFilterBadgeCount()}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
        
        {/* フィルター適用中の表示 */}
        {isFiltered && (
          <View className="flex-row justify-between items-center mx-4 mb-4 p-3 bg-blue-50 rounded-lg">
            <Text className="text-gray-700">
              {filteredProducts.length} 件の商品が見つかりました
            </Text>
            <TouchableOpacity 
              className="px-3 py-1 bg-white border border-gray-300 rounded-full"
              onPress={clearFilters}
            >
              <Text className="text-sm text-gray-700">クリア</Text>
            </TouchableOpacity>
          </View>
        )}
        
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
          <View className="mx-4 mb-4">
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
        
        {/* スタイルタイプ表示（ユーザーの好みに基づく） */}
        {user && userPreference && (
          <StyleTypeDisplay userPreference={userPreference} />
        )}
        
        {/* フィルター適用済み商品表示 */}
        {isFiltered ? (
          <RecommendList
            title="検索結果"
            products={filteredProducts}
            loading={isLoading}
            error={error}
            onProductPress={handleProductPress}
            emptyMessage="条件に一致する商品が見つかりませんでした。フィルターを変更してください。"
          />
        ) : (
          <>
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
          </>
        )}
      </ScrollView>
      
      {/* フィルターモーダル */}
      <FilterModal 
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={applyFilters}
        initialFilters={activeFilters}
        availableTags={availableTags}
      />
    </SafeAreaView>
  );
};

export default RecommendScreen;
