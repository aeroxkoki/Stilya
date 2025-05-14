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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var vector_icons_1 = require("@expo/vector-icons");
var ThemeContext_1 = require("../../contexts/ThemeContext");
var CachedImage_1 = __importDefault(require("./CachedImage"));
// LayoutAnimationをAndroidで有効化
if (react_native_1.Platform.OS === 'android') {
    if (react_native_1.UIManager.setLayoutAnimationEnabledExperimental) {
        react_native_1.UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}
var ProductCard = function (_a) {
    var product = _a.product, onPress = _a.onPress, style = _a.style, _b = _a.showFavoriteButton, showFavoriteButton = _b === void 0 ? false : _b, _c = _a.isFavorite, isFavorite = _c === void 0 ? false : _c, onFavoritePress = _a.onFavoritePress, _d = _a.horizontal, horizontal = _d === void 0 ? false : _d, _e = _a.showTags, showTags = _e === void 0 ? true : _e, _f = _a.compact, compact = _f === void 0 ? false : _f;
    var _g = (0, ThemeContext_1.useTheme)(), theme = _g.theme, isDarkMode = _g.isDarkMode;
    var scaleAnim = (0, react_1.useRef)(new react_native_1.Animated.Value(1)).current;
    // 価格フォーマット
    var formatPrice = function (price) {
        return price.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' });
    };
    // お気に入りボタンのハンドラ
    var handleFavoritePress = function () {
        if (onFavoritePress) {
            // ハートアニメーション
            react_native_1.LayoutAnimation.configureNext(react_native_1.LayoutAnimation.Presets.spring);
            onFavoritePress(product.id);
        }
    };
    // カードのタッチエフェクト
    var handlePressIn = function () {
        react_native_1.Animated.spring(scaleAnim, {
            toValue: 0.97,
            friction: 5,
            tension: 150,
            useNativeDriver: true,
        }).start();
    };
    var handlePressOut = function () {
        react_native_1.Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 5,
            tension: 100,
            useNativeDriver: true,
        }).start();
    };
    return (<react_native_1.Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <react_native_1.TouchableOpacity style={[
            styles.container,
            horizontal ? styles.horizontalContainer : styles.verticalContainer,
            compact && styles.compactContainer,
            {
                borderRadius: theme.radius.m,
                backgroundColor: theme.colors.background.card,
                shadowColor: isDarkMode ? '#000' : '#222',
                borderColor: theme.colors.border.light,
                borderWidth: isDarkMode ? 1 : 0,
            },
            style,
        ]} onPress={function () { return onPress(product.id); }} activeOpacity={0.9} onPressIn={handlePressIn} onPressOut={handlePressOut}>
        <react_native_1.View style={[
            styles.imageContainer,
            horizontal && styles.horizontalImageContainer,
            compact && styles.compactImageContainer
        ]}>
          <CachedImage_1.default source={{ uri: product.imageUrl || '' }} style={styles.image} resizeMode="cover"/>
          
          {showFavoriteButton && (<react_native_1.TouchableOpacity style={[
                styles.favoriteButton,
                {
                    backgroundColor: isDarkMode
                        ? 'rgba(0, 0, 0, 0.5)'
                        : 'rgba(255, 255, 255, 0.8)',
                    borderWidth: 1,
                    borderColor: isFavorite
                        ? theme.colors.status.error
                        : 'transparent',
                },
            ]} onPress={handleFavoritePress} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
              <vector_icons_1.Feather name={isFavorite ? 'heart' : 'heart'} size={16} color={isFavorite ? theme.colors.status.error : theme.colors.text.hint}/>
            </react_native_1.TouchableOpacity>)}
        </react_native_1.View>

        <react_native_1.View style={[styles.infoContainer, compact && styles.compactInfoContainer]}>
          {product.brand && (<react_native_1.Text style={[
                styles.brand,
                compact && styles.compactBrand,
                { color: theme.colors.text.secondary }
            ]}>
              {product.brand}
            </react_native_1.Text>)}
          
          <react_native_1.Text style={[
            styles.title,
            compact && styles.compactTitle,
            { color: theme.colors.text.primary }
        ]} numberOfLines={compact ? 1 : 2} ellipsizeMode="tail">
            {product.title}
          </react_native_1.Text>
          
          <react_native_1.Text style={[
            styles.price,
            compact && styles.compactPrice,
            { color: theme.colors.primary }
        ]}>
            {formatPrice(product.price)}
          </react_native_1.Text>

          {showTags && product.tags && product.tags.length > 0 && (<react_native_1.View style={styles.tagsContainer}>
              {product.tags.slice(0, compact ? 1 : (horizontal ? 1 : 2)).map(function (tag, index) { return (<react_native_1.View key={index} style={[
                    styles.tag,
                    compact && styles.compactTag,
                    {
                        backgroundColor: isDarkMode
                            ? 'rgba(255, 255, 255, 0.1)'
                            : theme.colors.background.input
                    },
                ]}>
                  <react_native_1.Text style={[
                    styles.tagText,
                    compact && styles.compactTagText,
                    { color: theme.colors.text.secondary }
                ]} numberOfLines={1}>
                    {tag}
                  </react_native_1.Text>
                </react_native_1.View>); })}
            </react_native_1.View>)}
        </react_native_1.View>
      </react_native_1.TouchableOpacity>
    </react_native_1.Animated.View>);
};
var styles = react_native_1.StyleSheet.create({
    container: {
        overflow: 'hidden',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
        elevation: 3,
    },
    verticalContainer: {
        width: '100%',
        maxWidth: 180,
    },
    horizontalContainer: {
        flexDirection: 'row',
        width: '100%',
        height: 120,
    },
    compactContainer: {
        maxWidth: 160,
    },
    imageContainer: {
        position: 'relative',
        overflow: 'hidden',
        borderTopLeftRadius: 8,
        borderTopRightRadius: 8,
    },
    horizontalImageContainer: {
        width: 120,
        height: '100%',
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 8,
    },
    compactImageContainer: {
        height: 140,
    },
    image: {
        width: '100%',
        aspectRatio: 1,
        height: undefined,
    },
    favoriteButton: {
        position: 'absolute',
        top: 8,
        right: 8,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
        elevation: 2,
    },
    infoContainer: {
        padding: 12,
        flex: 1,
    },
    compactInfoContainer: {
        padding: 8,
    },
    brand: {
        fontSize: 12,
        marginBottom: 4,
        fontWeight: '500',
    },
    compactBrand: {
        fontSize: 10,
        marginBottom: 2,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 6,
        height: 40,
    },
    compactTitle: {
        fontSize: 12,
        marginBottom: 4,
        height: 'auto',
    },
    price: {
        fontSize: 16,
        fontWeight: '700',
        marginBottom: 8,
    },
    compactPrice: {
        fontSize: 14,
        marginBottom: 4,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    tag: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        marginRight: 6,
        marginBottom: 6,
    },
    compactTag: {
        paddingHorizontal: 6,
        paddingVertical: 2,
        marginRight: 4,
        marginBottom: 4,
    },
    tagText: {
        fontSize: 10,
    },
    compactTagText: {
        fontSize: 8,
    },
});
exports.default = ProductCard;
