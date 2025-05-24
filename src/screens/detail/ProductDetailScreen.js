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
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var native_1 = require("@react-navigation/native");
var vector_icons_1 = require("@expo/vector-icons");
var common_1 = require("@/components/common");
var recommend_1 = require("@/components/recommend");
var productStore_1 = require("@/store/productStore");
var authStore_1 = require("@/store/authStore");
var utils_1 = require("@/utils");
var useRecommendations_1 = require("@/hooks/useRecommendations");
var useRecordClick_1 = require("@/hooks/useRecordClick");
var deepLinking_1 = require("@/utils/deepLinking");
var analyticsService_1 = require("@/services/analyticsService");
var viewHistoryService_1 = require("@/services/viewHistoryService");
var width = react_native_1.Dimensions.get('window').width;
var ProductDetailScreen = function () {
    var route = (0, native_1.useRoute)();
    var navigation = (0, native_1.useNavigation)();
    var productId = route.params.productId;
    var user = (0, authStore_1.useAuthStore)().user;
    var _a = (0, productStore_1.useProductStore)(), products = _a.products, loading = _a.loading, error = _a.error;
    // レコメンデーション関連の情報取得
    var userPreference = (0, useRecommendations_1.useRecommendations)().userPreference;
    // クリック記録フック
    var trackClick = (0, useRecordClick_1.useRecordClick)(user === null || user === void 0 ? void 0 : user.id).recordProductClick;
    // ディープリンク
    var generateProductLink = (0, deepLinking_1.useDeepLinks)().generateProductLink;
    // 商品データ
    var _b = (0, react_1.useState)(null), product = _b[0], setProduct = _b[1];
    var _c = (0, react_1.useState)([]), similarProducts = _c[0], setSimilarProducts = _c[1];
    // 商品データの取得
    (0, react_1.useEffect)(function () {
        var loadProduct = function () { return __awaiter(void 0, void 0, void 0, function () {
            var fetchProduct, productData, similar, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        fetchProduct = function (id) { return __awaiter(void 0, void 0, void 0, function () {
                            var existingProduct, productStore, foundProduct;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        if (products && products.length > 0) {
                                            existingProduct = products.find(function (p) { return p.id === id; });
                                            if (existingProduct)
                                                return [2 /*return*/, existingProduct];
                                        }
                                        productStore = productStore_1.useProductStore.getState();
                                        if (!(typeof productStore.loadProducts === 'function')) return [3 /*break*/, 2];
                                        return [4 /*yield*/, productStore.loadProducts()];
                                    case 1:
                                        _a.sent();
                                        foundProduct = productStore.products.find(function (p) { return p.id === id; });
                                        if (foundProduct)
                                            return [2 /*return*/, foundProduct];
                                        _a.label = 2;
                                    case 2: return [2 /*return*/];
                                }
                            });
                        }); };
                        return [4 /*yield*/, fetchProduct(productId)];
                    case 1:
                        productData = _a.sent();
                        if (productData) {
                            setProduct(productData);
                            similar = (0, utils_1.getSimilarProducts)(productData, products, 5);
                            setSimilarProducts(similar);
                            // 閲覧履歴に記録（ログインしている場合のみ）
                            if (user) {
                                (0, viewHistoryService_1.recordProductView)(user.id, productData.id)
                                    .catch(function (err) { return console.error('Failed to record view:', err); });
                                // 商品閲覧イベントの記録（アナリティクス）
                                (0, analyticsService_1.trackProductView)(productData.id, {
                                    title: productData.title,
                                    brand: productData.brand,
                                    price: productData.price,
                                    category: productData.category,
                                    source: productData.source,
                                }, user.id).catch(function (err) { return console.error('Failed to track view:', err); });
                                // 画面表示イベントの記録
                                (0, analyticsService_1.trackEvent)(analyticsService_1.EventType.SCREEN_VIEW, {
                                    screen_name: 'ProductDetail',
                                    product_id: productData.id,
                                }, user.id).catch(function (err) { return console.error('Failed to track screen view:', err); });
                            }
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Error loading product:', error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); };
        loadProduct();
    }, [productId, products, user]);
    // 商品購入へのリンク
    var handleBuyPress = function () { return __awaiter(void 0, void 0, void 0, function () {
        var affiliateUrl, supported, error_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!product || !user)
                        return [2 /*return*/];
                    // 新しいクリックログ記録フックを使用
                    trackClick(product.id, product);
                    // 閲覧履歴サービス経由でクリックログも記録
                    if (product && user && user.id) {
                        (0, viewHistoryService_1.recordProductClick)(user.id, product.id)
                            .catch(function (err) { return console.error('Failed to record click:', err); });
                    }
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    affiliateUrl = product.affiliateUrl || '';
                    return [4 /*yield*/, react_native_1.Linking.canOpenURL(affiliateUrl)];
                case 2:
                    supported = _a.sent();
                    if (!supported) return [3 /*break*/, 4];
                    return [4 /*yield*/, react_native_1.Linking.openURL(affiliateUrl)];
                case 3:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 4:
                    console.error('このURLは開けません:', affiliateUrl);
                    _a.label = 5;
                case 5: return [3 /*break*/, 7];
                case 6:
                    error_2 = _a.sent();
                    console.error('リンクを開く際にエラーが発生しました:', error_2);
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); };
    // シェア機能
    var handleShare = function () { return __awaiter(void 0, void 0, void 0, function () {
        var deepLink, shareMessage, shareContent, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!product)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    deepLink = generateProductLink(product.id);
                    shareMessage = "".concat(product.title, " - ").concat((0, utils_1.formatPrice)(product.price), " | Stilya\u3067\u898B\u3064\u3051\u305F\u30A2\u30A4\u30C6\u30E0\u3067\u3059 ").concat(deepLink);
                    shareContent = {
                        message: shareMessage
                    };
                    // iOSの場合のみurlを追加
                    if (react_native_1.Platform.OS === 'ios' && product.affiliateUrl) {
                        shareContent.url = product.affiliateUrl;
                    }
                    return [4 /*yield*/, react_native_1.Share.share(shareContent)];
                case 2:
                    _a.sent();
                    // シェアイベントを記録
                    if (user && user.id) {
                        (0, analyticsService_1.trackShare)(product.id, react_native_1.Platform.OS, user.id)
                            .catch(function (err) { return console.error('Failed to track share:', err); });
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_3 = _a.sent();
                    console.error('シェアに失敗しました:', error_3);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // 類似商品のタップ
    var handleSimilarProductPress = function (similarProduct) {
        // @ts-ignore - タイプエラーを一時的に無視
        navigation.navigate('ProductDetail', { productId: similarProduct.id });
    };
    // 戻るボタン
    var handleBackPress = function () {
        navigation.goBack();
    };
    // ローディング表示
    if (loading && !product) {
        return (<react_native_1.SafeAreaView className="flex-1 bg-white">
        <react_native_1.View className="flex-1 items-center justify-center">
          <react_native_1.ActivityIndicator size="large" color="#3B82F6"/>
          <react_native_1.Text className="mt-4 text-gray-500">商品情報を読み込み中...</react_native_1.Text>
        </react_native_1.View>
      </react_native_1.SafeAreaView>);
    }
    // エラー表示
    if (error && !product) {
        return (<react_native_1.SafeAreaView className="flex-1 bg-white">
        <react_native_1.View className="flex-1 items-center justify-center p-6">
          <react_native_1.Text className="text-red-500 mb-4">エラーが発生しました</react_native_1.Text>
          <react_native_1.Text className="text-gray-700 mb-8 text-center">{error}</react_native_1.Text>
          <common_1.Button onPress={handleBackPress}>戻る</common_1.Button>
        </react_native_1.View>
      </react_native_1.SafeAreaView>);
    }
    // 商品が見つからない場合
    if (!product) {
        return (<react_native_1.SafeAreaView className="flex-1 bg-white">
        <react_native_1.View className="flex-1 items-center justify-center p-6">
          <react_native_1.Text className="text-2xl font-bold mb-4">商品が見つかりません</react_native_1.Text>
          <react_native_1.Text className="text-gray-500 text-center mb-8">
            この商品は利用できないか、削除された可能性があります。
          </react_native_1.Text>
          <common_1.Button onPress={handleBackPress}>戻る</common_1.Button>
        </react_native_1.View>
      </react_native_1.SafeAreaView>);
    }
    return (<react_native_1.SafeAreaView className="flex-1 bg-white">
      <react_native_1.ScrollView className="flex-1">
        {/* 画像部分 */}
        <react_native_1.View className="relative">
          <react_native_1.Image source={{ uri: product.imageUrl ? product.imageUrl : '' }} style={styles.image} resizeMode="cover"/>
          
          {/* 戻るボタン */}
          <react_native_1.TouchableOpacity className="absolute top-4 left-4 bg-black/30 rounded-full p-2" onPress={handleBackPress}>
            <vector_icons_1.Ionicons name="arrow-back" size={24} color="white"/>
          </react_native_1.TouchableOpacity>
          
          {/* シェアボタン */}
          <react_native_1.TouchableOpacity className="absolute top-4 right-4 bg-black/30 rounded-full p-2" onPress={handleShare}>
            <vector_icons_1.Ionicons name="share-outline" size={24} color="white"/>
          </react_native_1.TouchableOpacity>
        </react_native_1.View>
        
        {/* 商品情報 */}
        <react_native_1.View className="p-4">
          {/* 商品タイトルと価格 */}
          <react_native_1.View className="flex-row justify-between items-start mb-3">
            <react_native_1.View className="flex-1 mr-2">
              <react_native_1.Text className="text-2xl font-bold" numberOfLines={2}>
                {product.title}
              </react_native_1.Text>
              {product.brand && (<react_native_1.Text className="text-gray-600 text-lg">
                  {product.brand}
                </react_native_1.Text>)}
            </react_native_1.View>
            <react_native_1.Text className="text-2xl font-bold text-blue-600">
              {(0, utils_1.formatPrice)(product.price)}
            </react_native_1.Text>
          </react_native_1.View>
          
          {/* おすすめ理由（ログイン済みユーザーのみ） */}
          {user && userPreference && (<recommend_1.RecommendReason product={product} userPreference={userPreference}/>)}
          
          {/* タグ */}
          {product.tags && product.tags.length > 0 && (<react_native_1.View className="flex-row flex-wrap mb-4">
              {product.tags.map(function (tag, index) { return (<react_native_1.View key={index} className="bg-gray-100 px-3 py-1 rounded-full mr-2 mb-2">
                  <react_native_1.Text className="text-gray-800 text-sm">
                    {tag}
                  </react_native_1.Text>
                </react_native_1.View>); })}
            </react_native_1.View>)}
          
          {/* 購入ボタン */}
          <common_1.Button onPress={handleBuyPress} className="bg-blue-600 mt-2 mb-6">
            <react_native_1.View className="flex-row items-center justify-center">
              <vector_icons_1.Ionicons name="cart-outline" size={20} color="white" style={{ marginRight: 8 }}/>
              <react_native_1.Text className="text-white font-bold text-lg">購入する</react_native_1.Text>
            </react_native_1.View>
          </common_1.Button>
          
          {/* 商品説明（ここでは仮のテキスト） */}
          <react_native_1.View className="mb-6">
            <react_native_1.Text className="text-lg font-bold mb-2">商品情報</react_native_1.Text>
            <react_native_1.Text className="text-gray-700 leading-6">
              この商品の詳細情報を確認するには、「購入する」ボタンをタップして販売サイトをご覧ください。
              {'\n\n'}
              ※ 価格や送料、在庫状況などは販売サイトにて最新の情報をご確認ください。
            </react_native_1.Text>
          </react_native_1.View>
          
          {/* 類似商品（コンポーネント化） */}
          {similarProducts.length > 0 && (<recommend_1.SimilarProducts products={similarProducts} onProductPress={handleSimilarProductPress} title="類似アイテム"/>)}
          
          {/* 出典情報 */}
          {product.source && (<react_native_1.View className="mb-4">
              <react_native_1.Text className="text-xs text-gray-400">
                出典: {product.source}
              </react_native_1.Text>
            </react_native_1.View>)}
        </react_native_1.View>
      </react_native_1.ScrollView>
      
      {/* 下部の購入ボタン（スクロール時も常に表示） */}
      <react_native_1.View className="bg-white border-t border-gray-200 px-4 py-3">
        <common_1.Button onPress={handleBuyPress} className="bg-blue-600">
          <react_native_1.View className="flex-row items-center justify-center">
            <vector_icons_1.Ionicons name="cart-outline" size={20} color="white" style={{ marginRight: 8 }}/>
            <react_native_1.Text className="text-white font-bold text-lg">購入する</react_native_1.Text>
          </react_native_1.View>
        </common_1.Button>
      </react_native_1.View>
    </react_native_1.SafeAreaView>);
};
var styles = react_native_1.StyleSheet.create({
    image: {
        width: '100%',
        height: width,
    }
});
exports.default = ProductDetailScreen;
