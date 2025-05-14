"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_native_1 = require("react-native");
var ProductHorizontalList = function (_a) {
    var title = _a.title, products = _a.products, onProductPress = _a.onProductPress, onSeeAllPress = _a.onSeeAllPress, _b = _a.loading, loading = _b === void 0 ? false : _b, _c = _a.error, error = _c === void 0 ? null : _c, _d = _a.emptyMessage, emptyMessage = _d === void 0 ? 'No products available' : _d, style = _a.style;
    // 商品が無い場合は何も表示しない
    if (!products || products.length === 0) {
        return null;
    }
    return (<react_native_1.View style={[styles.container, style]}>
      <react_native_1.View style={styles.header}>
        <react_native_1.Text style={styles.title}>{title}</react_native_1.Text>
        {onSeeAllPress && (<react_native_1.TouchableOpacity onPress={onSeeAllPress}>
            <react_native_1.Text style={styles.seeAll}>すべて見る</react_native_1.Text>
          </react_native_1.TouchableOpacity>)}
      </react_native_1.View>

      <react_native_1.ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {products.map(function (product) { return (<react_native_1.TouchableOpacity key={product.id} style={styles.productItem} onPress={function () { return onProductPress(product); }}>
            <react_native_1.View style={styles.productCard}>
              <react_native_1.Image source={{ uri: product.imageUrl }} style={styles.productImage} resizeMode="cover"/>
              <react_native_1.View style={styles.productInfo}>
                <react_native_1.Text style={styles.productBrand} numberOfLines={1}>
                  {product.brand || ''}
                </react_native_1.Text>
                <react_native_1.Text style={styles.productTitle} numberOfLines={2}>
                  {product.title}
                </react_native_1.Text>
                <react_native_1.Text style={styles.productPrice}>
                  ¥{product.price.toLocaleString()}
                </react_native_1.Text>
              </react_native_1.View>
            </react_native_1.View>
          </react_native_1.TouchableOpacity>); })}
      </react_native_1.ScrollView>
    </react_native_1.View>);
};
var styles = react_native_1.StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
    },
    seeAll: {
        fontSize: 14,
        color: '#3B82F6',
        fontWeight: '500',
    },
    scrollContent: {
        paddingLeft: 16,
        paddingRight: 8,
    },
    productItem: {
        width: 160,
        marginRight: 12,
    },
    productCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    productImage: {
        width: '100%',
        height: 180,
        backgroundColor: '#f5f5f5',
    },
    productInfo: {
        padding: 12,
    },
    productBrand: {
        fontSize: 12,
        color: '#6B7280',
        marginBottom: 4,
    },
    productTitle: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1F2937',
        marginBottom: 8,
        height: 40,
    },
    productPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#111827',
    },
});
exports.default = ProductHorizontalList;
