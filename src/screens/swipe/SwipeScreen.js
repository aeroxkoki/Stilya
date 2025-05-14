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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var react_1 = __importStar(require("react"));
var react_native_1 = require("react-native");
var native_1 = require("@react-navigation/native");
var vector_icons_1 = require("@expo/vector-icons");
var common_1 = require("@/components/common");
var SwipeContainer_1 = __importDefault(require("@/components/swipe/SwipeContainer"));
var useAuth_1 = require("@/hooks/useAuth");
var NetworkContext_1 = require("@/contexts/NetworkContext");
var productService_1 = require("@/services/productService");
var swipeService_1 = require("@/services/swipeService");
var react_native_reanimated_1 = __importStar(require("react-native-reanimated"));
var _a = react_native_1.Dimensions.get('window'), width = _a.width, height = _a.height;
var SwipeScreen = function () {
    var navigation = (0, native_1.useNavigation)();
    var user = (0, useAuth_1.useAuth)().user;
    var isConnected = (0, NetworkContext_1.useNetwork)().isConnected;
    // 状態管理
    var _a = (0, react_1.useState)([]), products = _a[0], setProducts = _a[1];
    var _b = (0, react_1.useState)(true), loading = _b[0], setLoading = _b[1];
    var _c = (0, react_1.useState)(null), error = _c[0], setError = _c[1];
    var _d = (0, react_1.useState)(new Set()), swipedProductIds = _d[0], setSwipedProductIds = _d[1];
    var _e = (0, react_1.useState)(true), hasMoreProducts = _e[0], setHasMoreProducts = _e[1];
    var swipeCount = (0, react_1.useRef)(0);
    // アニメーション値
    var emptyStateOpacity = (0, react_native_reanimated_1.useSharedValue)(0);
    var headerScale = (0, react_native_reanimated_1.useSharedValue)(1);
    // 商品データの読み込み
    (0, react_1.useEffect)(function () {
        var loadProducts = function () { return __awaiter(void 0, void 0, void 0, function () {
            var result, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, 3, 4]);
                        setLoading(true);
                        setError(null);
                        return [4 /*yield*/, (0, productService_1.fetchProducts)(20, 0, true)];
                    case 1:
                        result = _a.sent();
                        setProducts(result.products);
                        setHasMoreProducts(result.hasMore);
                        // オフラインモードの通知
                        if (!isConnected) {
                            console.log('Loading products in offline mode');
                        }
                        return [3 /*break*/, 4];
                    case 2:
                        err_1 = _a.sent();
                        console.error('Failed to load products:', err_1);
                        setError(err_1.message || 'Failed to load products');
                        return [3 /*break*/, 4];
                    case 3:
                        setLoading(false);
                        return [7 /*endfinally*/];
                    case 4: return [2 /*return*/];
                }
            });
        }); };
        loadProducts();
    }, [isConnected]);
    // 追加の商品を読み込む
    var handleLoadMore = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        var result, newProducts_1, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!hasMoreProducts || loading)
                        return [2 /*return*/];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, productService_1.fetchNextPage)()];
                case 2:
                    result = _a.sent();
                    if (result.products.length > 0) {
                        newProducts_1 = result.products.filter(function (product) { return !swipedProductIds.has(product.id); });
                        setProducts(function (prevProducts) { return __spreadArray(__spreadArray([], prevProducts, true), newProducts_1, true); });
                        setHasMoreProducts(result.hasMore);
                    }
                    else {
                        setHasMoreProducts(false);
                    }
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _a.sent();
                    console.error('Failed to load more products:', err_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); }, [hasMoreProducts, loading, swipedProductIds]);
    // スワイプ操作の処理
    var handleSwipe = (0, react_1.useCallback)(function (product, direction) { return __awaiter(void 0, void 0, void 0, function () {
        var swipeResult, err_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!user)
                        return [2 /*return*/];
                    swipeResult = direction === 'right' ? 'yes' : 'no';
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, (0, swipeService_1.saveSwipeResult)(user.id, product.id, swipeResult)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_3 = _a.sent();
                    console.error('Failed to save swipe result:', err_3);
                    return [3 /*break*/, 4];
                case 4:
                    // スワイプ済み商品を記録
                    setSwipedProductIds(function (prev) {
                        var newSet = new Set(prev);
                        newSet.add(product.id);
                        return newSet;
                    });
                    // カウンターをインクリメント
                    swipeCount.current += 1;
                    // スケールアニメーション効果
                    headerScale.value = (0, react_native_reanimated_1.withSequence)((0, react_native_reanimated_1.withTiming)(1.1, { duration: 100 }), (0, react_native_reanimated_1.withTiming)(1, { duration: 100 }));
                    // 商品がなくなった場合は空の状態をフェードイン
                    if (products.filter(function (p) { return !swipedProductIds.has(p.id); }).length <= 1) {
                        emptyStateOpacity.value = (0, react_native_reanimated_1.withTiming)(1, { duration: 500 });
                    }
                    return [2 /*return*/];
            }
        });
    }); }, [user, products, swipedProductIds, emptyStateOpacity, headerScale]);
    // 商品詳細画面へ
    var handleCardPress = (0, react_1.useCallback)(function (product) {
        // @ts-ignore
        navigation.navigate('ProductDetail', { productId: product.id });
    }, [navigation]);
    // 商品をリロード
    var handleReload = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            // フェードアウト
            emptyStateOpacity.value = (0, react_native_reanimated_1.withTiming)(0, { duration: 300 }, function () {
                (0, react_native_reanimated_1.runOnJS)(resetData)();
            });
            return [2 /*return*/];
        });
    }); }, [emptyStateOpacity]);
    // データリセット
    var resetData = function () { return __awaiter(void 0, void 0, void 0, function () {
        var result, err_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, 3, 4]);
                    setLoading(true);
                    return [4 /*yield*/, (0, productService_1.fetchProducts)(20, 0, true)];
                case 1:
                    result = _a.sent();
                    setProducts(result.products);
                    setHasMoreProducts(result.hasMore);
                    setSwipedProductIds(new Set());
                    swipeCount.current = 0;
                    return [3 /*break*/, 4];
                case 2:
                    err_4 = _a.sent();
                    setError(err_4.message || 'Failed to reload products');
                    return [3 /*break*/, 4];
                case 3:
                    setLoading(false);
                    return [7 /*endfinally*/];
                case 4: return [2 /*return*/];
            }
        });
    }); };
    // 商品切れ時の処理
    var handleEmptyProducts = (0, react_1.useCallback)(function () {
        // 空の状態をアニメーションで表示
        emptyStateOpacity.value = (0, react_native_reanimated_1.withTiming)(1, { duration: 500 });
    }, [emptyStateOpacity]);
    // アニメーションスタイル
    var headerAnimatedStyle = (0, react_native_reanimated_1.useAnimatedStyle)(function () {
        return {
            transform: [{ scale: headerScale.value }]
        };
    });
    var emptyStateAnimatedStyle = (0, react_native_reanimated_1.useAnimatedStyle)(function () {
        return {
            opacity: emptyStateOpacity.value
        };
    });
    // 表示するフィルタリング済み商品リスト
    var filteredProducts = products.filter(function (p) { return !swipedProductIds.has(p.id); });
    // ローディング表示
    if (loading && products.length === 0) {
        return (<react_native_1.SafeAreaView className="flex-1 bg-white">
        <react_native_1.View className="flex-1 items-center justify-center" testID="loading-container">
          <react_native_1.ActivityIndicator size="large" color="#3B82F6"/>
          <react_native_1.Text className="mt-4 text-gray-500">商品を読み込み中...</react_native_1.Text>
        </react_native_1.View>
      </react_native_1.SafeAreaView>);
    }
    // エラー表示
    if (error && products.length === 0) {
        return (<react_native_1.SafeAreaView className="flex-1 bg-white">
        <react_native_1.View className="flex-1 items-center justify-center p-6" testID="error-container">
          <vector_icons_1.Ionicons name="alert-circle-outline" size={64} color="#F87171"/>
          <react_native_1.Text className="text-red-500 text-xl font-bold mt-4 mb-2">エラーが発生しました</react_native_1.Text>
          <react_native_1.Text className="text-gray-700 mb-8 text-center">{error}</react_native_1.Text>
          <common_1.Button onPress={handleReload} testID="reload-button">再読み込み</common_1.Button>
          
          {isConnected === false && (<react_native_1.View className="mt-6 bg-yellow-50 p-4 rounded-lg w-full">
              <react_native_1.Text className="text-yellow-700 text-center">
                オフラインモードです。インターネット接続を確認してください。
              </react_native_1.Text>
            </react_native_1.View>)}
        </react_native_1.View>
      </react_native_1.SafeAreaView>);
    }
    // 全ての商品をスワイプし終わった場合
    var allProductsSwiped = filteredProducts.length === 0 && products.length > 0;
    return (<react_native_1.SafeAreaView className="flex-1 bg-white" testID="swipe-screen">
      {/* ヘッダー情報 */}
      <react_native_reanimated_1.default.View className="px-4 py-2 flex-row justify-between items-center" style={headerAnimatedStyle} testID="swipe-header">
        <react_native_1.Text className="text-gray-400 text-sm">
          {swipeCount.current}件スワイプ
        </react_native_1.Text>
        <react_native_1.Text className="text-gray-500 font-medium">
          Stilya
        </react_native_1.Text>
        <react_native_1.Text className="text-gray-400 text-sm">
          残り{filteredProducts.length}件
        </react_native_1.Text>
      </react_native_reanimated_1.default.View>
      
      <react_native_1.View className="flex-1 items-center justify-center p-4">
        {/* スワイプコンテナ */}
        {!allProductsSwiped ? (<SwipeContainer_1.default products={filteredProducts} isLoading={loading} onSwipe={isConnected === false ? undefined : handleSwipe} onCardPress={handleCardPress} onEmptyProducts={handleEmptyProducts} onLoadMore={isConnected === false ? undefined : handleLoadMore} hasMoreProducts={hasMoreProducts} testID="swipe-container"/>) : (<react_native_reanimated_1.default.View className="items-center justify-center p-6" style={emptyStateAnimatedStyle} testID="empty-state">
            <vector_icons_1.Ionicons name="checkmark-circle-outline" size={64} color="#22C55E"/>
            <react_native_1.Text className="text-2xl font-bold mt-4 mb-2 text-center">
              すべての商品をスワイプしました
            </react_native_1.Text>
            <react_native_1.Text className="text-gray-500 text-center mb-8">
              あなたの好みに合わせた商品をチェックしてみましょう。
            </react_native_1.Text>
            <react_native_1.View className="flex-row space-x-4">
              <common_1.Button onPress={handleReload} style={styles.button}>
                もっと見る
              </common_1.Button>
              <common_1.Button onPress={function () {
                // @ts-ignore
                navigation.navigate('Recommend');
            }} style={[styles.button, styles.primaryButton]}>
                おすすめを見る
              </common_1.Button>
            </react_native_1.View>
            
            {/* オフライン状態表示 */}
            {isConnected === false && (<react_native_1.View className="mt-6 bg-red-50 p-4 rounded-lg w-full">
                <react_native_1.Text className="text-red-700 text-center">
                  オフラインモードです。インターネット接続時に新しい商品が表示されます。
                </react_native_1.Text>
              </react_native_1.View>)}
          </react_native_reanimated_1.default.View>)}
      </react_native_1.View>
    </react_native_1.SafeAreaView>);
};
var styles = react_native_1.StyleSheet.create({
    button: {
        minWidth: 120,
    },
    primaryButton: {
        backgroundColor: '#3B82F6',
    }
});
exports.default = SwipeScreen;
