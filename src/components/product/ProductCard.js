"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importDefault(require("react"));
var react_native_1 = require("react-native");
var vector_icons_1 = require("@expo/vector-icons");
/**
 * 商品カードコンポーネント
 * 通常版と関連商品用のコンパクト版をサポート
 */
var ProductCard = function (_a) {
    var product = _a.product, onPress = _a.onPress, style = _a.style, _b = _a.compact, compact = _b === void 0 ? false : _b, _c = _a.isFavorite, isFavorite = _c === void 0 ? false : _c, onFavoriteToggle = _a.onFavoriteToggle;
    // 価格フォーマット
    var formatPrice = function (price) {
        return price.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' });
    };
    // お気に入りボタンのハンドラ
    var handleFavoritePress = function (e) {
        e.stopPropagation();
        if (onFavoriteToggle) {
            onFavoriteToggle(product.id);
        }
    };
    // コンパクトモード（関連商品表示用）
    if (compact) {
        return (<react_native_1.TouchableOpacity style={[styles.compactContainer, style]} onPress={function () { return onPress(product.id); }} activeOpacity={0.8}>
        <react_native_1.View style={styles.compactImageWrapper}>
          <react_native_1.Image source={{ uri: product.imageUrl }} style={styles.compactImage} resizeMode="cover"/>
        </react_native_1.View>
        
        <react_native_1.View style={styles.compactContent}>
          <react_native_1.Text style={styles.compactBrand} numberOfLines={1}>
            {product.brand}
          </react_native_1.Text>
          <react_native_1.Text style={styles.compactTitle} numberOfLines={2}>
            {product.title}
          </react_native_1.Text>
          <react_native_1.Text style={styles.compactPrice}>
            {formatPrice(product.price)}
          </react_native_1.Text>
        </react_native_1.View>
      </react_native_1.TouchableOpacity>);
    }
    // 通常の表示モード
    return (<react_native_1.TouchableOpacity style={[styles.container, style]} onPress={function () { return onPress(product.id); }} activeOpacity={0.9}>
      <react_native_1.View style={styles.imageContainer}>
        <react_native_1.Image source={{ uri: product.imageUrl }} style={styles.image} resizeMode="cover"/>
        
        {onFavoriteToggle && (<react_native_1.TouchableOpacity style={styles.favoriteButton} onPress={handleFavoritePress}>
            <vector_icons_1.Feather name={isFavorite ? "heart" : "heart"} size={20} color={isFavorite ? "#F87171" : "#FFFFFF"}/>
          </react_native_1.TouchableOpacity>)}
      </react_native_1.View>
      
      <react_native_1.View style={styles.infoContainer}>
        <react_native_1.Text style={styles.brand} numberOfLines={1}>
          {product.brand}
        </react_native_1.Text>
        <react_native_1.Text style={styles.title} numberOfLines={2}>
          {product.title}
        </react_native_1.Text>
        <react_native_1.Text style={styles.price}>
          {formatPrice(product.price)}
        </react_native_1.Text>
        
        {/* タグ表示（1つだけ表示） */}
        {product.tags && product.tags.length > 0 && (<react_native_1.View style={styles.tagContainer}>
            <react_native_1.Text style={styles.tag}>{product.tags[0]}</react_native_1.Text>
          </react_native_1.View>)}
      </react_native_1.View>
    </react_native_1.TouchableOpacity>);
};
var styles = react_native_1.StyleSheet.create({
    // 通常カード用スタイル
    container: {
        backgroundColor: 'white',
        borderRadius: 12,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 3,
        elevation: 3,
        width: '100%',
        marginBottom: 16,
    },
    imageContainer: {
        position: 'relative',
        height: 220,
        backgroundColor: '#f5f5f5',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    favoriteButton: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        width: 34,
        height: 34,
        borderRadius: 17,
        justifyContent: 'center',
        alignItems: 'center',
    },
    infoContainer: {
        padding: 12,
    },
    brand: {
        fontSize: 13,
        color: '#666',
        marginBottom: 4,
    },
    title: {
        fontSize: 15,
        fontWeight: '600',
        marginBottom: 6,
        lineHeight: 20,
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
        color: '#3B82F6',
        marginBottom: 8,
    },
    tagContainer: {
        flexDirection: 'row',
    },
    tag: {
        fontSize: 12,
        color: '#666',
        backgroundColor: '#f5f5f5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        overflow: 'hidden',
    },
    // コンパクトカード用スタイル
    compactContainer: {
        width: 150,
        backgroundColor: 'white',
        borderRadius: 8,
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    compactImageWrapper: {
        width: '100%',
        height: 170,
        backgroundColor: '#f5f5f5',
    },
    compactImage: {
        width: '100%',
        height: '100%',
    },
    compactContent: {
        padding: 8,
    },
    compactBrand: {
        fontSize: 11,
        color: '#666',
        marginBottom: 2,
    },
    compactTitle: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 4,
        lineHeight: 16,
        height: 32,
    },
    compactPrice: {
        fontSize: 14,
        fontWeight: '700',
        color: '#3B82F6',
    },
});
exports.default = ProductCard;
