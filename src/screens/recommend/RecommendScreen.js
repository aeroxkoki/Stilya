"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var native_1 = require("@react-navigation/native");
var vector_icons_1 = require("@expo/vector-icons");
var recommend_1 = require("@/components/recommend");
var common_1 = require("@/components/common");
var useAuth_1 = require("@/hooks/useAuth");
var useRecommendations_1 = require("@/hooks/useRecommendations");
var RecommendScreen = function () {
    var navigation = (0, native_1.useNavigation)();
    var user = (0, useAuth_1.useAuth)().user;
    // フィルターモーダルの表示状態
    var _a = (0, react_1.useState)(false), filterModalVisible = _a[0], setFilterModalVisible = _a[1];
    var _b = (0, react_1.useState)({
        categories: [],
        priceRange: [0, Infinity],
        selectedTags: []
    }), activeFilters = _b[0], setActiveFilters = _b[1];
    // フィルター適用状態
    var _c = (0, react_1.useState)(false), isFiltered = _c[0], setIsFiltered = _c[1];
    // レコメンデーションデータ取得
    var _d = (0, useRecommendations_1.useRecommendations)(), recommendations = _d.recommendations, categoryRecommendations = _d.categoryRecommendations, userPreference = _d.userPreference, isLoading = _d.isLoading, error = _d.error, refreshRecommendations = _d.refreshRecommendations, getFilteredRecommendations = _d.getFilteredRecommendations;
    // フィルター適用済みの商品リスト
    var _e = (0, react_1.useState)([]), filteredProducts = _e[0], setFilteredProducts = _e[1];
    // 利用可能なタグのリスト（フィルター用）
    var _f = (0, react_1.useState)([]), availableTags = _f[0], setAvailableTags = _f[1];
    // 初回ロード時に利用可能なタグを集める
    (0, react_1.useEffect)(function () {
        if (recommendations.length > 0 || Object.keys(categoryRecommendations).length > 0) {
            var allTags_1 = new Set();
            // レコメンド商品からタグを抽出
            recommendations.forEach(function (product) {
                if (product.tags) {
                    product.tags.forEach(function (tag) { return allTags_1.add(tag); });
                }
            });
            // カテゴリー別商品からもタグを抽出
            Object.values(categoryRecommendations).forEach(function (products) {
                products.forEach(function (product) {
                    if (product.tags) {
                        product.tags.forEach(function (tag) { return allTags_1.add(tag); });
                    }
                });
            });
            setAvailableTags(Array.from(allTags_1));
        }
    }, [recommendations, categoryRecommendations]);
    // フィルター適用
    (0, react_1.useEffect)(function () {
        if (isFiltered) {
            var filtered = getFilteredRecommendations(activeFilters);
            setFilteredProducts(filtered);
        }
    }, [isFiltered, activeFilters, getFilteredRecommendations]);
    // 商品タップハンドラー
    var handleProductPress = function (product) {
        // @ts-ignore
        navigation.navigate('ProductDetail', { productId: product.id });
    };
    // スワイプ画面に移動
    var handleGoToSwipe = function () {
        // @ts-ignore
        navigation.navigate('Swipe');
    };
    // フィルターモーダルを開く
    var openFilterModal = function () {
        setFilterModalVisible(true);
    };
    // フィルターを適用
    var applyFilters = function (filters) {
        setActiveFilters(filters);
        setIsFiltered(true);
    };
    // フィルターをクリア
    var clearFilters = function () {
        setActiveFilters({
            categories: [],
            priceRange: [0, Infinity],
            selectedTags: []
        });
        setIsFiltered(false);
    };
    // フィルター適用中のバッジカウント
    var getFilterBadgeCount = function () {
        var count = 0;
        if (activeFilters.categories.length > 0)
            count += 1;
        if (activeFilters.priceRange[0] > 0 || activeFilters.priceRange[1] < Infinity)
            count += 1;
        if (activeFilters.selectedTags.length > 0)
            count += 1;
        return count;
    };
    // ローディング表示
    if (isLoading && recommendations.length === 0) {
        return (<react_native_1.SafeAreaView className="flex-1 bg-white">
        <react_native_1.View className="flex-1 items-center justify-center">
          <react_native_1.ActivityIndicator size="large" color="#3B82F6"/>
          <react_native_1.Text className="mt-4 text-gray-500">おすすめ商品を読み込み中...</react_native_1.Text>
        </react_native_1.View>
      </react_native_1.SafeAreaView>);
    }
    return (<react_native_1.SafeAreaView className="flex-1 bg-white">
      <react_native_1.ScrollView className="flex-1" refreshControl={<react_native_1.RefreshControl refreshing={isLoading} onRefresh={refreshRecommendations}/>}>
        {/* ヘッダー（フィルターボタン付き） */}
        <react_native_1.View className="px-4 py-5 flex-row justify-between items-center">
          <react_native_1.View>
            <react_native_1.Text className="text-2xl font-bold">あなたにおすすめ</react_native_1.Text>
            <react_native_1.Text className="text-gray-500 mt-1">
              {userPreference
            ? 'あなたの好みに合わせたアイテムをお届けします'
            : '好みに合わせたアイテムを探して見つけよう'}
            </react_native_1.Text>
          </react_native_1.View>
          
          {/* フィルターボタン */}
          <react_native_1.TouchableOpacity className="bg-gray-100 p-2 rounded-full relative" onPress={openFilterModal}>
            <vector_icons_1.Ionicons name="options-outline" size={24} color="#333"/>
            {getFilterBadgeCount() > 0 && (<react_native_1.View className="absolute -top-1 -right-1 bg-blue-500 rounded-full w-5 h-5 items-center justify-center">
                <react_native_1.Text className="text-white text-xs font-bold">{getFilterBadgeCount()}</react_native_1.Text>
              </react_native_1.View>)}
          </react_native_1.TouchableOpacity>
        </react_native_1.View>
        
        {/* フィルター適用中の表示 */}
        {isFiltered && (<react_native_1.View className="flex-row justify-between items-center mx-4 mb-4 p-3 bg-blue-50 rounded-lg">
            <react_native_1.Text className="text-gray-700">
              {filteredProducts.length} 件の商品が見つかりました
            </react_native_1.Text>
            <react_native_1.TouchableOpacity className="px-3 py-1 bg-white border border-gray-300 rounded-full" onPress={clearFilters}>
              <react_native_1.Text className="text-sm text-gray-700">クリア</react_native_1.Text>
            </react_native_1.TouchableOpacity>
          </react_native_1.View>)}
        
        {/* ログインしていない場合 */}
        {!user && (<react_native_1.View className="bg-blue-50 mx-4 p-4 rounded-lg mb-4">
            <react_native_1.Text className="text-gray-800 mb-2">
              ログインすると、あなたの好みに合わせた商品をおすすめできます。
            </react_native_1.Text>
            <common_1.Button onPress={handleGoToSwipe} className="bg-blue-600 mt-1">
              まずはスワイプしてみる
            </common_1.Button>
          </react_native_1.View>)}
        
        {/* スワイプ履歴がない場合 */}
        {user && !userPreference && (<react_native_1.View className="bg-blue-50 mx-4 p-4 rounded-lg mb-4">
            <react_native_1.Text className="text-gray-800 mb-2">
              スワイプして「好き」「興味なし」を教えると、AIがあなたの好みを学習します。
            </react_native_1.Text>
            <common_1.Button onPress={handleGoToSwipe} className="bg-blue-600 mt-1">
              スワイプしてみる
            </common_1.Button>
          </react_native_1.View>)}
        
        {/* あなたの好みのタグ表示 */}
        {user && userPreference && userPreference.topTags && userPreference.topTags.length > 0 && (<react_native_1.View className="mx-4 mb-4">
            <react_native_1.Text className="text-sm text-gray-500 mb-2">あなたの好みの傾向:</react_native_1.Text>
            <react_native_1.View className="flex-row flex-wrap">
              {userPreference.topTags.slice(0, 5).map(function (tag, index) { return (<react_native_1.View key={index} className="bg-gray-100 rounded-full px-3 py-1 mr-2 mb-2">
                  <react_native_1.Text className="text-xs text-gray-700">{tag}</react_native_1.Text>
                </react_native_1.View>); })}
            </react_native_1.View>
          </react_native_1.View>)}
        
        {/* スタイルタイプ表示（ユーザーの好みに基づく） */}
        {user && userPreference && (<>
            <recommend_1.StyleTypeDisplay userPreference={userPreference}/>
            <recommend_1.PreferenceTrendsGraph userPreference={userPreference}/>
            <recommend_1.StyleTips userPreference={userPreference}/>
          </>)}
        
        {/* フィルター適用済み商品表示 */}
        {isFiltered ? (<recommend_1.RecommendList title="検索結果" products={filteredProducts} loading={isLoading} error={error} onProductPress={handleProductPress} emptyMessage="条件に一致する商品が見つかりませんでした。フィルターを変更してください。"/>) : (<>
            {/* おすすめ商品 */}
            <recommend_1.RecommendList title="あなたへのおすすめ" products={recommendations} loading={isLoading} error={error} onProductPress={handleProductPress} emptyMessage="まだおすすめ商品がありません。スワイプしてあなたの好みを教えてください。"/>
            
            {/* カテゴリー別おすすめ商品 */}
            {user && Object.keys(categoryRecommendations).length > 0 && (<recommend_1.CategoryRecommendList categories={categoryRecommendations} loading={isLoading} error={error} onProductPress={handleProductPress}/>)}
          </>)}
      </react_native_1.ScrollView>
      
      {/* フィルターモーダル */}
      <recommend_1.FilterModal visible={filterModalVisible} onClose={function () { return setFilterModalVisible(false); }} onApply={applyFilters} initialFilters={activeFilters} availableTags={availableTags}/>
    </react_native_1.SafeAreaView>);
};
exports.default = RecommendScreen;
