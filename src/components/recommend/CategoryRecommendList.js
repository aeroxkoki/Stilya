"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_native_1 = require("react-native");
var common_1 = require("@/components/common");
var width = react_native_1.Dimensions.get('window').width;
var CARD_WIDTH = width * 0.4; // カードは画面の40%幅に
var categoryNameMap = {
    'tops': 'トップス',
    'bottoms': 'ボトムス',
    'outerwear': 'アウター',
    'accessories': 'アクセサリー',
    'shoes': 'シューズ',
    'bags': 'バッグ',
    'dresses': 'ワンピース',
    'sets': 'セットアップ'
};
var CategoryRecommendList = function (_a) {
    var categories = _a.categories, loading = _a.loading, error = _a.error, onProductPress = _a.onProductPress;
    // ローディング表示
    if (loading) {
        return (<react_native_1.View className="py-4">
        <react_native_1.Text className="text-lg font-bold mb-3 px-4">カテゴリ別おすすめ</react_native_1.Text>
        <react_native_1.View className="items-center justify-center py-12">
          <react_native_1.ActivityIndicator size="large" color="#3B82F6"/>
          <react_native_1.Text className="mt-4 text-gray-500">商品を読み込み中...</react_native_1.Text>
        </react_native_1.View>
      </react_native_1.View>);
    }
    // エラー表示
    if (error) {
        return (<react_native_1.View className="py-4">
        <react_native_1.Text className="text-lg font-bold mb-3 px-4">カテゴリ別おすすめ</react_native_1.Text>
        <react_native_1.View className="items-center justify-center py-12">
          <react_native_1.Text className="text-red-500 mb-2">エラーが発生しました</react_native_1.Text>
          <react_native_1.Text className="text-gray-700 text-center">{error}</react_native_1.Text>
        </react_native_1.View>
      </react_native_1.View>);
    }
    // カテゴリがない場合
    if (Object.keys(categories).length === 0) {
        return (<react_native_1.View className="py-4">
        <react_native_1.Text className="text-lg font-bold mb-3 px-4">カテゴリ別おすすめ</react_native_1.Text>
        <react_native_1.View className="items-center justify-center py-12">
          <react_native_1.Text className="text-gray-500">おすすめアイテムがありません</react_native_1.Text>
        </react_native_1.View>
      </react_native_1.View>);
    }
    return (<react_native_1.View className="py-4">
      <react_native_1.Text className="text-lg font-bold mb-3 px-4">カテゴリ別おすすめ</react_native_1.Text>
      <react_native_1.ScrollView>
        {Object.entries(categories).map(function (_a) {
            var category = _a[0], products = _a[1];
            if (products.length === 0)
                return null;
            return (<react_native_1.View key={category} className="mb-6">
              <react_native_1.Text className="text-base font-medium mb-2 px-4">
                {categoryNameMap[category] || category}
              </react_native_1.Text>
              <react_native_1.FlatList data={products} keyExtractor={function (item) { return item.id; }} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.listContainer} renderItem={function (_a) {
                    var item = _a.item;
                    return (<react_native_1.View style={styles.cardContainer}>
                    <common_1.ProductCard product={item} onPress={function () { return onProductPress(item); }} showTags={false} compact={true}/>
                  </react_native_1.View>);
                }}/>
            </react_native_1.View>);
        })}
      </react_native_1.ScrollView>
    </react_native_1.View>);
};
var styles = react_native_1.StyleSheet.create({
    listContainer: {
        paddingHorizontal: 12,
    },
    cardContainer: {
        width: CARD_WIDTH,
        marginHorizontal: 4,
    }
});
exports.default = CategoryRecommendList;
