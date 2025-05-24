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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var native_1 = require("@react-navigation/native");
var vector_icons_1 = require("@expo/vector-icons");
var expo_status_bar_1 = require("expo-status-bar");
// import { BlurView } from 'expo-blur';
// import * as Haptics from 'expo-haptics';
// これらのモジュールのモック
var BlurView = function (_a) {
    var intensity = _a.intensity, style = _a.style, children = _a.children;
    return <react_native_1.View style={style}>{children}</react_native_1.View>;
};
var Haptics = {
    impactAsync: function () { return Promise.resolve(); },
    ImpactFeedbackStyle: {
        Light: 'light',
        Medium: 'medium',
        Heavy: 'heavy',
    },
};
var productService_1 = require("../services/productService");
var favoriteService_1 = require("../services/favoriteService");
var useAuth_1 = require("../hooks/useAuth");
var ProductCard_1 = __importDefault(require("../components/product/ProductCard"));
var SCREEN_WIDTH = react_native_1.Dimensions.get('window').width;
var ProductDetailScreen = function () {
    var route = (0, native_1.useRoute)();
    var navigation = (0, native_1.useNavigation)();
    var productId = route.params.productId;
    var _a = (0, react_1.useState)(null), product = _a[0], setProduct = _a[1];
    var _b = (0, react_1.useState)(true), isLoading = _b[0], setIsLoading = _b[1];
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    var _d = (0, react_1.useState)([]), relatedProducts = _d[0], setRelatedProducts = _d[1];
    var _e = (0, react_1.useState)(false), isFavorited = _e[0], setIsFavorited = _e[1];
    var _f = (0, react_1.useState)(0), currentImageIndex = _f[0], setCurrentImageIndex = _f[1];
    var user = (0, useAuth_1.useAuth)().user;
    var scrollY = (0, react_1.useRef)(new react_native_1.Animated.Value(0)).current;
    var headerOpacity = scrollY.interpolate({
        inputRange: [0, 100, 150],
        outputRange: [0, 0.5, 1],
        extrapolate: 'clamp',
    });
    // 商品データを取得
    (0, react_1.useEffect)(function () {
        var loadProduct = function () { return __awaiter(void 0, void 0, void 0, function () {
            var productData, favorited, related, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, 7, 8]);
                        setIsLoading(true);
                        setError(null);
                        return [4 /*yield*/, (0, productService_1.fetchProductById)(productId)];
                    case 1:
                        productData = _a.sent();
                        setProduct(productData);
                        if (!(user && productData)) return [3 /*break*/, 3];
                        return [4 /*yield*/, (0, favoriteService_1.isFavorite)(user.id, productData.id)];
                    case 2:
                        favorited = _a.sent();
                        setIsFavorited(favorited);
                        _a.label = 3;
                    case 3:
                        if (!(productData && productData.tags && productData.tags.length > 0)) return [3 /*break*/, 5];
                        return [4 /*yield*/, (0, productService_1.fetchProductsByTags)(productData.tags, 6, [productData.id] // 自分自身は除外
                            )];
                    case 4:
                        related = _a.sent();
                        setRelatedProducts(related);
                        _a.label = 5;
                    case 5: return [3 /*break*/, 8];
                    case 6:
                        err_1 = _a.sent();
                        setError('商品データの読み込みに失敗しました。');
                        console.error('Error loading product:', err_1);
                        return [3 /*break*/, 8];
                    case 7:
                        setIsLoading(false);
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        }); };
        loadProduct();
    }, [productId, user]);
    // 外部リンク（購入ページ）を開く
    var handleBuyPress = function () { return __awaiter(void 0, void 0, void 0, function () {
        var affiliateUrl, canOpen, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!product)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 9, , 10]);
                    // 触覚フィードバック
                    return [4 /*yield*/, Haptics.impactAsync()];
                case 2:
                    // 触覚フィードバック
                    _a.sent();
                    if (!user) return [3 /*break*/, 4];
                    return [4 /*yield*/, (0, productService_1.recordProductClick)(product.id)];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    affiliateUrl = product.affiliateUrl || '';
                    return [4 /*yield*/, react_native_1.Linking.canOpenURL(affiliateUrl)];
                case 5:
                    canOpen = _a.sent();
                    if (!canOpen) return [3 /*break*/, 7];
                    return [4 /*yield*/, react_native_1.Linking.openURL(affiliateUrl)];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 8];
                case 7:
                    react_native_1.Alert.alert('エラー', 'このリンクを開くことができません。');
                    _a.label = 8;
                case 8: return [3 /*break*/, 10];
                case 9:
                    error_1 = _a.sent();
                    console.error('Error opening link:', error_1);
                    react_native_1.Alert.alert('エラー', 'リンクを開く際にエラーが発生しました。');
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    }); };
    // お気に入り切り替え
    var handleToggleFavorite = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!user || !product)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    // 触覚フィードバック
                    return [4 /*yield*/, Haptics.impactAsync()];
                case 2:
                    // 触覚フィードバック
                    _a.sent();
                    // まずUIを先に更新（楽観的更新）
                    setIsFavorited(function (prev) { return !prev; });
                    // APIでお気に入り状態を切り替え
                    return [4 /*yield*/, (0, favoriteService_1.toggleFavorite)(user.id, product.id)];
                case 3:
                    // APIでお気に入り状態を切り替え
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_2 = _a.sent();
                    // エラー時は状態を元に戻す
                    setIsFavorited(function (prev) { return !prev; });
                    console.error('Error toggling favorite:', error_2);
                    react_native_1.Alert.alert('エラー', 'お気に入りの更新に失敗しました。');
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); }, [user, product]);
    // 共有機能
    var handleShare = function () { return __awaiter(void 0, void 0, void 0, function () {
        var error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!product)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 4, , 5]);
                    // 触覚フィードバック
                    return [4 /*yield*/, Haptics.impactAsync()];
                case 2:
                    // 触覚フィードバック
                    _a.sent();
                    return [4 /*yield*/, react_native_1.Share.share({
                            title: product.title,
                            message: "".concat(product.title, " - ").concat(product.brand, "\n").concat(product.price.toLocaleString('ja-JP'), "\u5186\n\n").concat(product.affiliateUrl),
                        })];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    error_3 = _a.sent();
                    console.error('Error sharing product:', error_3);
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    // 関連商品をタップした時の処理
    var handleRelatedProductPress = function (relatedProductId) {
        // 自分自身と同じIDなら何もしない
        if (relatedProductId === productId)
            return;
        // 同じ画面を再利用して新しい商品IDで表示（パラメータを更新）
        navigation.setParams({ productId: relatedProductId });
    };
    // 価格をフォーマット
    var formatPrice = function (price) {
        return price.toLocaleString('ja-JP', { style: 'currency', currency: 'JPY' });
    };
    // 複数画像対応（仮実装）
    var getProductImages = function (product) {
        // 本来はAPIから複数画像を取得するが、MVPでは単一画像を複製
        if (!product || !product.imageUrl)
            return [];
        return [product.imageUrl];
    };
    // ローディング中
    if (isLoading) {
        return (<react_native_1.View style={styles.centerContainer}>
        <react_native_1.ActivityIndicator size="large" color="#3B82F6"/>
        <react_native_1.Text style={styles.loadingText}>商品情報を読み込んでいます...</react_native_1.Text>
      </react_native_1.View>);
    }
    // エラー発生時
    if (error || !product) {
        return (<react_native_1.View style={styles.centerContainer}>
        <vector_icons_1.Feather name="alert-circle" size={80} color="#E0E0E0"/>
        <react_native_1.Text style={styles.errorText}>{error || '商品が見つかりませんでした。'}</react_native_1.Text>
      </react_native_1.View>);
    }
    // 商品画像（複数あれば横スクロール）
    var productImages = getProductImages(product);
    return (<react_native_1.View style={styles.container}>
      <expo_status_bar_1.StatusBar style="light"/>
      
      {/* 戻るボタン付きヘッダー（スクロールで表示） */}
      <react_native_1.Animated.View style={[
            styles.header,
            { opacity: headerOpacity }
        ]}>
        <BlurView intensity={80} style={styles.blurHeader}>
          <react_native_1.TouchableOpacity style={styles.backButton} onPress={function () { return navigation.goBack(); }}>
            <vector_icons_1.Feather name="arrow-left" size={24} color="#333"/>
          </react_native_1.TouchableOpacity>
          <react_native_1.Text style={styles.headerTitle} numberOfLines={1}>
            {product.title}
          </react_native_1.Text>
          <react_native_1.TouchableOpacity style={styles.favoriteButton} onPress={handleToggleFavorite}>
            <vector_icons_1.Feather name={isFavorited ? "heart" : "heart"} size={24} color={isFavorited ? "#F87171" : "#333"}/>
          </react_native_1.TouchableOpacity>
        </BlurView>
      </react_native_1.Animated.View>

      <react_native_1.Animated.ScrollView style={styles.scrollView} onScroll={react_native_1.Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: true })} scrollEventThrottle={16}>
        {/* 商品画像スライダー */}
        <react_native_1.View style={styles.imageContainer}>
          <react_native_1.FlatList data={productImages.length > 0 ? productImages : [product.imageUrl]} horizontal pagingEnabled showsHorizontalScrollIndicator={false} renderItem={function (_a) {
            var item = _a.item;
            return (<react_native_1.Image source={{ uri: item ? item : '' }} style={styles.image} resizeMode="cover"/>);
        }} keyExtractor={function (_, index) { return "image-".concat(index); }} onMomentumScrollEnd={function (event) {
            var newIndex = Math.round(event.nativeEvent.contentOffset.x / SCREEN_WIDTH);
            setCurrentImageIndex(newIndex);
        }}/>
          
          {/* 画像インジケーター（画像が複数ある場合のみ表示） */}
          {productImages.length > 1 && (<react_native_1.View style={styles.indicatorContainer}>
              {productImages.map(function (_, index) { return (<react_native_1.View key={"indicator-".concat(index)} style={[
                    styles.indicator,
                    index === currentImageIndex && styles.indicatorActive,
                ]}/>); })}
            </react_native_1.View>)}
          
          {/* 上部アクションボタン */}
          <react_native_1.View style={styles.imageActions}>
            <react_native_1.TouchableOpacity style={styles.imageActionButton} onPress={function () { return navigation.goBack(); }}>
              <vector_icons_1.Feather name="arrow-left" size={24} color="white"/>
            </react_native_1.TouchableOpacity>
            
            <react_native_1.View style={styles.imageRightActions}>
              <react_native_1.TouchableOpacity style={styles.imageActionButton} onPress={handleToggleFavorite}>
               <vector_icons_1.Feather name={isFavorited ? "heart" : "heart"} size={24} color={isFavorited ? "#F87171" : "white"}/>
              </react_native_1.TouchableOpacity>
              
              <react_native_1.TouchableOpacity style={styles.imageActionButton} onPress={handleShare}>
                <vector_icons_1.Feather name="share" size={24} color="white"/>
              </react_native_1.TouchableOpacity>
            </react_native_1.View>
          </react_native_1.View>
        </react_native_1.View>

        <react_native_1.View style={styles.contentContainer}>
          {/* 商品基本情報 */}
          <react_native_1.Text style={styles.brand}>{product.brand}</react_native_1.Text>
          <react_native_1.Text style={styles.title}>{product.title}</react_native_1.Text>
          <react_native_1.Text style={styles.price}>{formatPrice(product.price)}</react_native_1.Text>

          <react_native_1.View style={styles.divider}/>

          {/* 商品説明 */}
          <react_native_1.Text style={styles.descriptionTitle}>商品詳細</react_native_1.Text>
          <react_native_1.Text style={styles.description}>{product.description || '詳細情報は現在準備中です。'}</react_native_1.Text>

          {/* タグ一覧 */}
          <react_native_1.View style={styles.tagsContainer}>
            {product.tags && product.tags.map(function (tag, index) { return (<react_native_1.View key={index} style={styles.tag}>
                <react_native_1.Text style={styles.tagText}>{tag}</react_native_1.Text>
              </react_native_1.View>); })}
          </react_native_1.View>

          {/* 関連商品 */}
          {relatedProducts.length > 0 && (<>
              <react_native_1.Text style={styles.relatedTitle}>関連商品</react_native_1.Text>
              <react_native_1.FlatList data={relatedProducts} horizontal showsHorizontalScrollIndicator={false} renderItem={function (_a) {
                var item = _a.item;
                return (<ProductCard_1.default product={item} onPress={handleRelatedProductPress} style={styles.relatedProductCard} compact/>);
            }} keyExtractor={function (item) { return "related-".concat(item.id); }} contentContainerStyle={styles.relatedProductsContainer}/>
            </>)}

          {/* 購入ボタン */}
          <react_native_1.TouchableOpacity style={styles.buyButton} onPress={handleBuyPress} activeOpacity={0.7}>
            <react_native_1.Text style={styles.buyButtonText}>購入サイトへ</react_native_1.Text>
            <vector_icons_1.Feather name="external-link" size={18} color="white" style={styles.buyButtonIcon}/>
          </react_native_1.TouchableOpacity>

          <react_native_1.Text style={styles.disclaimerText}>
            ※外部サイトでの購入となります。商品の在庫状況、価格等は変動する可能性があります。
          </react_native_1.Text>
        </react_native_1.View>
      </react_native_1.Animated.ScrollView>
    </react_native_1.View>);
};
var styles = react_native_1.StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'white',
    },
    scrollView: {
        flex: 1,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 15,
        fontSize: 16,
        color: '#757575',
    },
    errorText: {
        marginTop: 15,
        fontSize: 16,
        color: '#757575',
        textAlign: 'center',
    },
    header: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
    },
    blurHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
        paddingHorizontal: 15,
        paddingTop: 10,
    },
    headerTitle: {
        flex: 1,
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
        marginHorizontal: 10,
    },
    backButton: {
        padding: 8,
    },
    favoriteButton: {
        padding: 8,
    },
    imageContainer: {
        width: '100%',
        height: 450,
        backgroundColor: '#F5F5F5',
    },
    image: {
        width: SCREEN_WIDTH,
        height: 450,
        backgroundColor: '#F5F5F5',
    },
    indicatorContainer: {
        position: 'absolute',
        bottom: 20,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    indicator: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: 'rgba(255, 255, 255, 0.5)',
        marginHorizontal: 3,
    },
    indicatorActive: {
        backgroundColor: 'white',
        width: 10,
        height: 10,
        borderRadius: 5,
    },
    imageActions: {
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 15,
    },
    imageActionButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 5,
    },
    imageRightActions: {
        flexDirection: 'row',
    },
    contentContainer: {
        padding: 20,
    },
    brand: {
        fontSize: 16,
        color: '#757575',
        marginBottom: 5,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    price: {
        fontSize: 22,
        fontWeight: '600',
        color: '#3B82F6',
        marginBottom: 15,
    },
    divider: {
        height: 1,
        backgroundColor: '#E0E0E0',
        marginVertical: 15,
    },
    descriptionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 10,
    },
    description: {
        fontSize: 16,
        lineHeight: 24,
        color: '#333333',
        marginBottom: 20,
    },
    tagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: 30,
    },
    tag: {
        backgroundColor: '#F5F5F5',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        marginRight: 8,
        marginBottom: 8,
    },
    tagText: {
        fontSize: 14,
        color: '#757575',
    },
    relatedTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 15,
    },
    relatedProductsContainer: {
        paddingBottom: 15,
    },
    relatedProductCard: {
        width: 150,
        marginRight: 12,
    },
    buyButton: {
        backgroundColor: '#3B82F6',
        paddingVertical: 15,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    buyButtonText: {
        color: 'white',
        fontSize: 18,
        fontWeight: '600',
    },
    buyButtonIcon: {
        marginLeft: 8,
    },
    disclaimerText: {
        fontSize: 12,
        color: '#9E9E9E',
        textAlign: 'center',
        marginBottom: 20,
    },
});
exports.default = ProductDetailScreen;
