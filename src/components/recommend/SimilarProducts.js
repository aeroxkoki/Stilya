"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_native_1 = require("react-native");
var utils_1 = require("@/utils");
var width = react_native_1.Dimensions.get('window').width;
var CARD_WIDTH = width / 2.5;
var IMAGE_HEIGHT = CARD_WIDTH;
var SimilarProducts = function (_a) {
    var products = _a.products, onProductPress = _a.onProductPress, _b = _a.title, title = _b === void 0 ? '類似アイテム' : _b, _c = _a.loading, loading = _c === void 0 ? false : _c;
    if (products.length === 0 && !loading) {
        return null;
    }
    return (<react_native_1.View className="mb-6">
      <react_native_1.Text className="text-lg font-bold mb-3 px-4">{title}</react_native_1.Text>
      <react_native_1.ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {products.map(function (product) { return (<react_native_1.TouchableOpacity key={product.id} style={styles.card} className="mr-4 bg-white rounded-lg shadow-sm overflow-hidden" onPress={function () { return onProductPress(product); }}>
            <react_native_1.Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover"/>
            <react_native_1.View className="p-2">
              {product.brand && (<react_native_1.Text className="text-xs text-gray-600" numberOfLines={1}>
                  {product.brand}
                </react_native_1.Text>)}
              <react_native_1.Text className="text-sm font-medium mt-1" numberOfLines={2}>
                {product.title}
              </react_native_1.Text>
              <react_native_1.Text className="text-sm font-bold text-blue-600 mt-1">
                {(0, utils_1.formatPrice)(product.price)}
              </react_native_1.Text>
            </react_native_1.View>
          </react_native_1.TouchableOpacity>); })}
        
        {/* 最後に空のView（右側の余白） */}
        {products.length > 0 && <react_native_1.View style={{ width: 12 }}/>}
      </react_native_1.ScrollView>
    </react_native_1.View>);
};
var styles = react_native_1.StyleSheet.create({
    scrollContent: {
        paddingLeft: 16,
        paddingVertical: 8
    },
    card: {
        width: CARD_WIDTH,
        borderRadius: 8,
    },
    image: {
        width: CARD_WIDTH,
        height: IMAGE_HEIGHT,
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    }
});
exports.default = SimilarProducts;
