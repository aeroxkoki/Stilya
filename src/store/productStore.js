"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.useProductStore = void 0;
var zustand_1 = require("zustand");
var productService_1 = require("@/services/productService");
var swipeService_1 = require("@/services/swipeService");
exports.useProductStore = (0, zustand_1.create)(function (set, get) { return ({
    products: [],
    filteredProducts: [],
    favorites: [],
    swipeHistory: [],
    recommendedProducts: [],
    loading: false,
    error: null,
    hasMoreProducts: true,
    totalFetched: 0,
    loadProducts: function () { return __awaiter(void 0, void 0, void 0, function () {
        var result, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    set({ loading: true, error: null });
                    return [4 /*yield*/, (0, productService_1.fetchProducts)(20, 0, true)];
                case 1:
                    result = _a.sent();
                    set({
                        products: result.products,
                        hasMoreProducts: result.hasMore,
                        totalFetched: result.totalFetched,
                        loading: false
                    });
                    return [2 /*return*/];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error loading products:', error_1);
                    set({ error: error_1.message || '商品の読み込みに失敗しました', loading: false });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); },
    loadMoreProducts: function () { return __awaiter(void 0, void 0, void 0, function () {
        var _a, hasMoreProducts, loading, result_1, error_2;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    _a = get(), hasMoreProducts = _a.hasMoreProducts, loading = _a.loading;
                    // ロード中または次のページがない場合は処理しない
                    if (!hasMoreProducts || loading)
                        return [2 /*return*/];
                    set({ loading: true });
                    return [4 /*yield*/, (0, productService_1.fetchNextPage)()];
                case 1:
                    result_1 = _b.sent();
                    if (result_1.products.length > 0) {
                        set(function (state) { return ({
                            products: __spreadArray(__spreadArray([], state.products, true), result_1.products, true),
                            hasMoreProducts: result_1.hasMore,
                            totalFetched: result_1.totalFetched,
                            loading: false
                        }); });
                    }
                    else {
                        set({ hasMoreProducts: false, loading: false });
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_2 = _b.sent();
                    console.error('Error loading more products:', error_2);
                    set({ error: error_2.message || '商品の追加読み込みに失敗しました', loading: false });
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); },
    resetProducts: function () {
        set({
            products: [],
            filteredProducts: [],
            loading: false,
            error: null,
            hasMoreProducts: true,
            totalFetched: 0
        });
    },
    addSwipe: function (userId, productId, result) { return __awaiter(void 0, void 0, void 0, function () {
        var swipedProduct_1, error_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    // スワイプ結果を保存 (swipeServiceを使用)
                    return [4 /*yield*/, (0, swipeService_1.saveSwipeResult)(userId, productId, result)];
                case 1:
                    // スワイプ結果を保存 (swipeServiceを使用)
                    _a.sent();
                    swipedProduct_1 = get().products.find(function (p) { return p.id === productId; });
                    if (swipedProduct_1) {
                        if (result === 'yes') {
                            // Yesの場合、レコメンド候補に追加（簡易実装）
                            set(function (state) { return ({
                                recommendedProducts: __spreadArray(__spreadArray([], state.recommendedProducts, true), [swipedProduct_1], false)
                            }); });
                        }
                    }
                    return [3 /*break*/, 3];
                case 2:
                    error_3 = _a.sent();
                    console.error('Error adding swipe:', error_3);
                    return [3 /*break*/, 3];
                case 3: return [2 /*return*/];
            }
        });
    }); },
    getSwipeHistory: function (userId, result) { return __awaiter(void 0, void 0, void 0, function () {
        var swipes, products, _i, swipes_1, swipe, product, error_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    set({ loading: true, error: null });
                    return [4 /*yield*/, (0, swipeService_1.getSwipeHistory)(userId, result)];
                case 1:
                    swipes = _a.sent();
                    products = [];
                    _i = 0, swipes_1 = swipes;
                    _a.label = 2;
                case 2:
                    if (!(_i < swipes_1.length)) return [3 /*break*/, 5];
                    swipe = swipes_1[_i];
                    return [4 /*yield*/, (0, productService_1.fetchProductById)(swipe.productId)];
                case 3:
                    product = _a.sent();
                    if (product) {
                        products.push(product);
                    }
                    _a.label = 4;
                case 4:
                    _i++;
                    return [3 /*break*/, 2];
                case 5:
                    set({ swipeHistory: products, loading: false });
                    return [2 /*return*/, products];
                case 6:
                    error_4 = _a.sent();
                    console.error('Error fetching swipe history:', error_4);
                    set({ error: error_4.message || 'スワイプ履歴の取得に失敗しました', loading: false });
                    return [2 /*return*/, []];
                case 7: return [2 /*return*/];
            }
        });
    }); },
    addToFavorites: function (userId, productId) { return __awaiter(void 0, void 0, void 0, function () {
        var currentFavorites, product, newFavorites;
        return __generator(this, function (_a) {
            try {
                currentFavorites = get().favorites;
                product = get().products.find(function (p) { return p.id === productId; });
                if (!product) {
                    throw new Error('商品が見つかりません');
                }
                // すでにお気に入りに追加済みかチェック
                if (currentFavorites.some(function (p) { return p.id === productId; })) {
                    return [2 /*return*/]; // すでに追加済みの場合は何もしない
                }
                newFavorites = __spreadArray(__spreadArray([], currentFavorites, true), [product], false);
                set({ favorites: newFavorites });
                // コンソールにログを出力（テスト用）
                console.log("\u304A\u6C17\u306B\u5165\u308A\u8FFD\u52A0\uFF08\u30C6\u30B9\u30C8\uFF09: \u30E6\u30FC\u30B6\u30FC ".concat(userId, " \u304C\u5546\u54C1 ").concat(productId, " \u3092\u304A\u6C17\u306B\u5165\u308A\u306B\u8FFD\u52A0"));
                /*
                // 本番環境では以下のコードを使用（Supabase連携）
                const { error } = await supabase
                  .from('favorites')
                  .insert([{
                    user_id: userId,
                    product_id: productId
                  }]);
                  
                if (error) throw error;
                
                // お気に入りリストを更新
                await getFavorites(userId);
                */
            }
            catch (error) {
                console.error('Error adding to favorites:', error);
                // UI上でのエラー表示は必要に応じて
            }
            return [2 /*return*/];
        });
    }); },
    removeFromFavorites: function (userId, productId) { return __awaiter(void 0, void 0, void 0, function () {
        var currentFavorites, newFavorites;
        return __generator(this, function (_a) {
            try {
                currentFavorites = get().favorites;
                newFavorites = currentFavorites.filter(function (p) { return p.id !== productId; });
                set({ favorites: newFavorites });
                // コンソールにログを出力（テスト用）
                console.log("\u304A\u6C17\u306B\u5165\u308A\u524A\u9664\uFF08\u30C6\u30B9\u30C8\uFF09: \u30E6\u30FC\u30B6\u30FC ".concat(userId, " \u304C\u5546\u54C1 ").concat(productId, " \u3092\u304A\u6C17\u306B\u5165\u308A\u304B\u3089\u524A\u9664"));
                /*
                // 本番環境では以下のコードを使用（Supabase連携）
                const { error } = await supabase
                  .from('favorites')
                  .delete()
                  .eq('user_id', userId)
                  .eq('product_id', productId);
                  
                if (error) throw error;
                
                // お気に入りリストを更新
                await getFavorites(userId);
                */
            }
            catch (error) {
                console.error('Error removing from favorites:', error);
                // UI上でのエラー表示は必要に応じて
            }
            return [2 /*return*/];
        });
    }); },
    clearFavorites: function (userId) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            try {
                // お気に入りをすべてクリア
                set({ favorites: [], loading: false });
                // コンソールにログを出力（テスト用）
                console.log("\u304A\u6C17\u306B\u5165\u308A\u30AF\u30EA\u30A2\uFF08\u30C6\u30B9\u30C8\uFF09: \u30E6\u30FC\u30B6\u30FC ".concat(userId, " \u304C\u304A\u6C17\u306B\u5165\u308A\u3092\u3059\u3079\u3066\u524A\u9664"));
                /*
                // 本番環境では以下のコードを使用（Supabase連携）
                const { error } = await supabase
                  .from('favorites')
                  .delete()
                  .eq('user_id', userId);
                  
                if (error) throw error;
                */
            }
            catch (error) {
                console.error('Error clearing favorites:', error);
                // UI上でのエラー表示は必要に応じて
            }
            return [2 /*return*/];
        });
    }); },
    getFavorites: function (userId) { return __awaiter(void 0, void 0, void 0, function () {
        var allProducts_1, randomIndices, randomFavorites, error_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    set({ loading: true, error: null });
                    if (!(get().favorites.length === 0)) return [3 /*break*/, 2];
                    allProducts_1 = get().products;
                    randomIndices = Array.from({ length: 5 }, function () {
                        return Math.floor(Math.random() * allProducts_1.length);
                    });
                    randomFavorites = randomIndices.map(function (index) { return allProducts_1[index]; });
                    // 疑似的に少し遅延を入れる
                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, 300); })];
                case 1:
                    // 疑似的に少し遅延を入れる
                    _a.sent();
                    set({ favorites: randomFavorites, loading: false });
                    return [2 /*return*/, randomFavorites];
                case 2:
                    // すでにお気に入りが存在する場合はそれを返す
                    set({ loading: false });
                    return [2 /*return*/, get().favorites];
                case 3:
                    error_5 = _a.sent();
                    console.error('Error fetching favorites:', error_5);
                    set({ error: error_5.message || 'お気に入りの取得に失敗しました', loading: false });
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    }); },
    isFavorite: function (productId) {
        // 現在のお気に入りリストから判定
        return get().favorites.some(function (p) { return p.id === productId; });
    },
    getRecommendedProducts: function (userId) { return __awaiter(void 0, void 0, void 0, function () {
        var yesHistory, yesProductIds_1, tagCounts_1, products, popularTags, recommendedProducts, result, error_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 6, , 7]);
                    set({ loading: true, error: null });
                    return [4 /*yield*/, (0, swipeService_1.getSwipeHistory)(userId, 'yes')];
                case 1:
                    yesHistory = _a.sent();
                    yesProductIds_1 = yesHistory.map(function (swipe) { return swipe.productId; });
                    tagCounts_1 = {};
                    products = get().products;
                    // 「Yes」と判定された商品のタグを集計
                    products.forEach(function (product) {
                        if (yesProductIds_1.includes(product.id) && product.tags) {
                            product.tags.forEach(function (tag) {
                                tagCounts_1[tag] = (tagCounts_1[tag] || 0) + 1;
                            });
                        }
                    });
                    popularTags = Object.entries(tagCounts_1)
                        .sort(function (a, b) { return b[1] - a[1]; })
                        .slice(0, 5)
                        .map(function (_a) {
                        var tag = _a[0];
                        return tag;
                    });
                    recommendedProducts = [];
                    if (!(popularTags.length > 0)) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, productService_1.fetchProductsByTags)(popularTags, 20, yesProductIds_1)];
                case 2:
                    recommendedProducts = _a.sent();
                    return [3 /*break*/, 5];
                case 3: return [4 /*yield*/, (0, productService_1.fetchProducts)(20)];
                case 4:
                    result = _a.sent();
                    recommendedProducts = result.products.filter(function (p) { return !yesProductIds_1.includes(p.id); });
                    _a.label = 5;
                case 5:
                    set({ recommendedProducts: recommendedProducts, loading: false });
                    return [2 /*return*/, recommendedProducts];
                case 6:
                    error_6 = _a.sent();
                    console.error('Error fetching recommended products:', error_6);
                    set({ error: error_6.message || 'おすすめ商品の取得に失敗しました', loading: false });
                    return [2 /*return*/, []];
                case 7: return [2 /*return*/];
            }
        });
    }); }
}); });
