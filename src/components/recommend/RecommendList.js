"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_native_1 = require("react-native");
var common_1 = require("@/components/common");
var width = react_native_1.Dimensions.get('window').width;
var COLUMN_NUM = 2;
var CARD_WIDTH = (width - 24 - 8 * (COLUMN_NUM - 1)) / COLUMN_NUM; // Padding + Gap
var RecommendList = function (_a) {
    var title = _a.title, products = _a.products, loading = _a.loading, error = _a.error, onProductPress = _a.onProductPress, _b = _a.emptyMessage, emptyMessage = _b === void 0 ? 'おすすめの商品がありません' : _b;
    // ローディング表示
    if (loading) {
        return (<react_native_1.View className="py-4">
        <react_native_1.Text className="text-lg font-bold mb-3 px-4">{title}</react_native_1.Text>
        <react_native_1.View className="items-center justify-center py-12">
          <react_native_1.ActivityIndicator size="large" color="#3B82F6"/>
          <react_native_1.Text className="mt-4 text-gray-500">商品を読み込み中...</react_native_1.Text>
        </react_native_1.View>
      </react_native_1.View>);
    }
    // エラー表示
    if (error) {
        return (<react_native_1.View className="py-4">
        <react_native_1.Text className="text-lg font-bold mb-3 px-4">{title}</react_native_1.Text>
        <react_native_1.View className="items-center justify-center py-12">
          <react_native_1.Text className="text-red-500 mb-2">エラーが発生しました</react_native_1.Text>
          <react_native_1.Text className="text-gray-700 text-center">{error}</react_native_1.Text>
        </react_native_1.View>
      </react_native_1.View>);
    }
    // 商品がない場合
    if (products.length === 0) {
        return (<react_native_1.View className="py-4">
        <react_native_1.Text className="text-lg font-bold mb-3 px-4">{title}</react_native_1.Text>
        <react_native_1.View className="items-center justify-center py-12">
          <react_native_1.Text className="text-gray-500">{emptyMessage}</react_native_1.Text>
        </react_native_1.View>
      </react_native_1.View>);
    }
    return (<react_native_1.View className="py-4">
      <react_native_1.Text className="text-lg font-bold mb-3 px-4">{title}</react_native_1.Text>
      <react_native_1.FlatList data={products} keyExtractor={function (item) { return item.id; }} numColumns={COLUMN_NUM} renderItem={function (_a) {
            var item = _a.item;
            return (<react_native_1.View style={styles.cardContainer}>
            <common_1.ProductCard product={item} onPress={function () { return onProductPress(item); }} showTags={true}/>
          </react_native_1.View>);
        }} contentContainerStyle={styles.listContainer}/>
    </react_native_1.View>);
};
var styles = react_native_1.StyleSheet.create({
    listContainer: {
        paddingHorizontal: 12,
    },
    cardContainer: {
        width: CARD_WIDTH,
        margin: 4,
    }
});
exports.default = RecommendList;
