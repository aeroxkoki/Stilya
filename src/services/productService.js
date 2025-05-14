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
exports.fetchProductsByTags = exports.recordProductClick = exports.saveSwipeResult = exports.clearProductsCache = exports.fetchProductById = exports.prefetchImages = exports.fetchRecommendedProducts = exports.fetchNextPage = exports.fetchProducts = void 0;
var supabase_1 = require("./supabase");
var expo_image_1 = require("expo-image");
var mockProducts_1 = require("@/mocks/mockProducts");
// モック使用フラグ (開発モードでAPI連携ができない場合に使用)
var USE_MOCK = true; // 本番環境では必ず false にすること
// キャッシュタイムアウト (1時間)
var CACHE_TIMEOUT = 60 * 60 * 1000;
// インメモリキャッシュ
var productsCache = null;
// ページネーション情報
var paginationInfo = {
    hasMore: true,
    currentOffset: 0,
    totalFetched: 0,
};
/**
 * 商品リストを取得する
 * キャッシュとPrefetchを活用して高速化
 */
var fetchProducts = function () {
    var args_1 = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args_1[_i] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (limit, offset, forceRefresh) {
        var paginatedMockProducts, hasMore_1, totalFetched_1, paginatedProducts, _a, data, error, products, hasMore, totalFetched, error_1, paginatedMockProducts, hasMore;
        if (limit === void 0) { limit = 20; }
        if (offset === void 0) { offset = 0; }
        if (forceRefresh === void 0) { forceRefresh = false; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 6, , 7]);
                    // 強制更新フラグがあるかキャッシュが無効の場合はキャッシュをクリア
                    if (forceRefresh || !productsCache || Date.now() - productsCache.timestamp >= CACHE_TIMEOUT) {
                        productsCache = null;
                        paginationInfo = {
                            hasMore: true,
                            currentOffset: 0,
                            totalFetched: 0,
                        };
                    }
                    if (!(USE_MOCK || __DEV__)) return [3 /*break*/, 3];
                    // 開発モードまたはモックフラグがtrueの場合はモックデータを返す
                    console.log('Using mock products data');
                    paginatedMockProducts = mockProducts_1.mockProducts.slice(offset, offset + limit);
                    if (!(offset === 0)) return [3 /*break*/, 2];
                    return [4 /*yield*/, (0, exports.prefetchImages)(paginatedMockProducts)];
                case 1:
                    _b.sent();
                    _b.label = 2;
                case 2:
                    hasMore_1 = offset + limit < mockProducts_1.mockProducts.length;
                    totalFetched_1 = Math.min(offset + limit, mockProducts_1.mockProducts.length);
                    // ページネーション情報を更新
                    paginationInfo = {
                        hasMore: hasMore_1,
                        currentOffset: offset + limit,
                        totalFetched: totalFetched_1,
                    };
                    return [2 /*return*/, {
                            products: paginatedMockProducts,
                            hasMore: hasMore_1,
                            totalFetched: totalFetched_1,
                        }];
                case 3:
                    // キャッシュチェック (初回または最初のページの場合は常に使用)
                    if (productsCache && offset === 0) {
                        console.log('Using cached products data');
                        paginatedProducts = productsCache.data.slice(offset, offset + limit);
                        return [2 /*return*/, {
                                products: paginatedProducts,
                                hasMore: paginationInfo.hasMore,
                                totalFetched: paginationInfo.totalFetched,
                            }];
                    }
                    return [4 /*yield*/, supabase_1.supabase
                            .from('products')
                            .select('*')
                            .range(offset, offset + limit - 1)
                            .order('created_at', { ascending: false })];
                case 4:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('Error fetching products:', error);
                        throw new Error(error.message);
                    }
                    if (!data || data.length === 0) {
                        // ページネーション情報を更新
                        paginationInfo.hasMore = false;
                        return [2 /*return*/, {
                                products: [],
                                hasMore: false,
                                totalFetched: paginationInfo.totalFetched,
                            }];
                    }
                    products = data.map(function (item) { return ({
                        id: item.id,
                        title: item.title,
                        brand: item.brand,
                        price: item.price,
                        imageUrl: item.image_url,
                        description: item.description,
                        tags: item.tags || [],
                        category: item.category,
                        affiliateUrl: item.affiliate_url,
                        source: item.source,
                        createdAt: item.created_at,
                    }); });
                    hasMore = products.length === limit;
                    totalFetched = paginationInfo.totalFetched + products.length;
                    paginationInfo = {
                        hasMore: hasMore,
                        currentOffset: offset + products.length,
                        totalFetched: totalFetched,
                    };
                    // キャッシュを更新 (新しいデータを追加)
                    if (productsCache) {
                        // 既存のキャッシュにデータを追加
                        productsCache = {
                            data: __spreadArray(__spreadArray([], productsCache.data, true), products, true),
                            timestamp: Date.now(),
                        };
                    }
                    else {
                        // 新規にキャッシュを作成
                        productsCache = {
                            data: products,
                            timestamp: Date.now(),
                        };
                    }
                    // 画像のプリフェッチ
                    return [4 /*yield*/, (0, exports.prefetchImages)(products)];
                case 5:
                    // 画像のプリフェッチ
                    _b.sent();
                    return [2 /*return*/, {
                            products: products,
                            hasMore: hasMore,
                            totalFetched: totalFetched,
                        }];
                case 6:
                    error_1 = _b.sent();
                    console.error('Unexpected error in fetchProducts:', error_1);
                    // エラー発生時もモックデータを返す（開発用）
                    if (__DEV__) {
                        paginatedMockProducts = mockProducts_1.mockProducts.slice(offset, offset + limit);
                        hasMore = offset + limit < mockProducts_1.mockProducts.length;
                        return [2 /*return*/, {
                                products: paginatedMockProducts,
                                hasMore: hasMore,
                                totalFetched: offset + paginatedMockProducts.length,
                            }];
                    }
                    throw error_1;
                case 7: return [2 /*return*/];
            }
        });
    });
};
exports.fetchProducts = fetchProducts;
/**
 * 次のページの商品を取得する
 */
var fetchNextPage = function () {
    var args_1 = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args_1[_i] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (limit) {
        if (limit === void 0) { limit = 20; }
        return __generator(this, function (_a) {
            // 次のページが存在しない場合は空配列を返す
            if (!paginationInfo.hasMore) {
                return [2 /*return*/, {
                        products: [],
                        hasMore: false,
                        totalFetched: paginationInfo.totalFetched,
                    }];
            }
            // 次のページを取得
            return [2 /*return*/, (0, exports.fetchProducts)(limit, paginationInfo.currentOffset)];
        });
    });
};
exports.fetchNextPage = fetchNextPage;
/**
 * レコメンド商品を取得する
 */
var fetchRecommendedProducts = function (userId_1) {
    var args_1 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([userId_1], args_1, true), void 0, function (userId, limit) {
        var _a, data, error, products, error_2;
        if (limit === void 0) { limit = 10; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    if (USE_MOCK || __DEV__) {
                        // モックデータから先頭のlimit件を返す
                        return [2 /*return*/, mockProducts_1.mockProducts.slice(0, limit)];
                    }
                    return [4 /*yield*/, supabase_1.supabase
                            .from('products')
                            .select('*')
                            .limit(limit)
                            .order('created_at', { ascending: false })];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('Error fetching recommended products:', error);
                        throw new Error(error.message);
                    }
                    if (!data || data.length === 0) {
                        return [2 /*return*/, []];
                    }
                    products = data.map(function (item) { return ({
                        id: item.id,
                        title: item.title,
                        brand: item.brand,
                        price: item.price,
                        imageUrl: item.image_url,
                        description: item.description,
                        tags: item.tags || [],
                        category: item.category,
                        affiliateUrl: item.affiliate_url,
                        source: item.source,
                        createdAt: item.created_at,
                    }); });
                    return [2 /*return*/, products];
                case 2:
                    error_2 = _b.sent();
                    console.error('Error in fetchRecommendedProducts:', error_2);
                    if (__DEV__) {
                        return [2 /*return*/, mockProducts_1.mockProducts.slice(0, limit)];
                    }
                    throw error_2;
                case 3: return [2 /*return*/];
            }
        });
    });
};
exports.fetchRecommendedProducts = fetchRecommendedProducts;
/**
 * 画像をプリフェッチしてキャッシュする
 */
var prefetchImages = function (products) { return __awaiter(void 0, void 0, void 0, function () {
    var prefetchPromises, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                if (!products || products.length === 0)
                    return [2 /*return*/];
                prefetchPromises = products.slice(0, 5).map(function (product) {
                    return product.imageUrl ? expo_image_1.Image.prefetch(product.imageUrl) : Promise.resolve(false);
                });
                // 残りは非同期でバックグラウンドでプリフェッチ
                setTimeout(function () {
                    products.slice(5).forEach(function (product) {
                        if (product.imageUrl) {
                            expo_image_1.Image.prefetch(product.imageUrl).catch(function (e) {
                                return console.log("Failed to prefetch image: ".concat(product.imageUrl), e);
                            });
                        }
                    });
                }, 100);
                return [4 /*yield*/, Promise.all(prefetchPromises)];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('Error prefetching images:', error_3);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.prefetchImages = prefetchImages;
/**
 * 商品詳細を取得する
 */
var fetchProductById = function (productId) { return __awaiter(void 0, void 0, void 0, function () {
    var product, cachedProduct, _a, data, error, error_4;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                if (USE_MOCK || __DEV__) {
                    product = mockProducts_1.mockProducts.find(function (p) { return p.id === productId; });
                    return [2 /*return*/, product || null];
                }
                // キャッシュから検索
                if (productsCache) {
                    cachedProduct = productsCache.data.find(function (p) { return p.id === productId; });
                    if (cachedProduct) {
                        return [2 /*return*/, cachedProduct];
                    }
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from('products')
                        .select('*')
                        .eq('id', productId)
                        .single()];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error) {
                    console.error('Error fetching product by ID:', error);
                    throw new Error(error.message);
                }
                if (!data) {
                    return [2 /*return*/, null];
                }
                // データの形式を変換
                return [2 /*return*/, {
                        id: data.id,
                        title: data.title,
                        brand: data.brand,
                        price: data.price,
                        imageUrl: data.image_url,
                        description: data.description,
                        tags: data.tags || [],
                        category: data.category,
                        affiliateUrl: data.affiliate_url,
                        source: data.source,
                        createdAt: data.created_at,
                    }];
            case 2:
                error_4 = _b.sent();
                console.error('Unexpected error in fetchProductById:', error_4);
                if (__DEV__ && mockProducts_1.mockProducts.length > 0) {
                    // 開発モードではエラーが発生した場合、モックの最初のアイテムを返す
                    return [2 /*return*/, mockProducts_1.mockProducts.find(function (p) { return p.id === productId; }) || mockProducts_1.mockProducts[0]];
                }
                throw error_4;
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.fetchProductById = fetchProductById;
/**
 * キャッシュをクリアする
 */
var clearProductsCache = function () {
    productsCache = null;
    paginationInfo = {
        hasMore: true,
        currentOffset: 0,
        totalFetched: 0,
    };
    console.log('Products cache cleared');
};
exports.clearProductsCache = clearProductsCache;
/**
 * スワイプ結果を保存する
 */
var saveSwipeResult = function (productId, result) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, error, error_5;
    var _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 3, , 4]);
                if (USE_MOCK || __DEV__) {
                    // モック環境では成功したふりをする
                    console.log('Mock: Swipe result saved', { productId: productId, result: result });
                    return [2 /*return*/, true];
                }
                return [4 /*yield*/, supabase_1.supabase.auth.getSession()];
            case 1:
                userId = (_d = (_c = (_b = (_a = (_e.sent())) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.session) === null || _c === void 0 ? void 0 : _c.user) === null || _d === void 0 ? void 0 : _d.id;
                if (!userId) {
                    throw new Error('User not authenticated');
                }
                return [4 /*yield*/, supabase_1.supabase.from('swipes').insert({
                        user_id: userId,
                        product_id: productId,
                        result: result,
                    })];
            case 2:
                error = (_e.sent()).error;
                if (error) {
                    console.error('Error saving swipe result:', error);
                    throw new Error(error.message);
                }
                return [2 /*return*/, true];
            case 3:
                error_5 = _e.sent();
                console.error('Unexpected error in saveSwipeResult:', error_5);
                return [2 /*return*/, false];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.saveSwipeResult = saveSwipeResult;
/**
 * 商品クリックを記録する
 */
var recordProductClick = function (productId, product) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, error, error_6;
    var _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                _e.trys.push([0, 3, , 4]);
                if (USE_MOCK || __DEV__) {
                    // モック環境では成功したふりをする
                    console.log('Mock: Product click recorded', { productId: productId });
                    return [2 /*return*/, true];
                }
                return [4 /*yield*/, supabase_1.supabase.auth.getSession()];
            case 1:
                userId = (_d = (_c = (_b = (_a = (_e.sent())) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.session) === null || _c === void 0 ? void 0 : _c.user) === null || _d === void 0 ? void 0 : _d.id;
                if (!userId) {
                    console.warn('User not authenticated, click not recorded');
                    return [2 /*return*/, false];
                }
                return [4 /*yield*/, supabase_1.supabase.from('click_logs').insert({
                        user_id: userId,
                        product_id: productId,
                    })];
            case 2:
                error = (_e.sent()).error;
                if (error) {
                    console.error('Error recording product click:', error);
                    throw new Error(error.message);
                }
                return [2 /*return*/, true];
            case 3:
                error_6 = _e.sent();
                console.error('Unexpected error in recordProductClick:', error_6);
                return [2 /*return*/, false];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.recordProductClick = recordProductClick;
/**
 * 特定のタグを持つ商品を取得する
 */
var fetchProductsByTags = function (tags_1) {
    var args_1 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([tags_1], args_1, true), void 0, function (tags, limit, excludeIds) {
        var filteredProducts, query, _a, data, error, products, error_7;
        if (limit === void 0) { limit = 10; }
        if (excludeIds === void 0) { excludeIds = []; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 3, , 4]);
                    if (!tags || tags.length === 0) {
                        return [2 /*return*/, []];
                    }
                    if (USE_MOCK || __DEV__) {
                        filteredProducts = mockProducts_1.mockProducts
                            .filter(function (p) {
                            // 除外IDチェック
                            return !excludeIds.includes(p.id) &&
                                // タグの一致チェック（少なくとも1つ一致）
                                p.tags && p.tags.some(function (tag) { return tags.includes(tag); });
                        })
                            .slice(0, limit);
                        return [2 /*return*/, filteredProducts];
                    }
                    query = supabase_1.supabase
                        .from('products')
                        .select('*')
                        .contains('tags', tags)
                        .limit(limit);
                    // 除外IDがある場合
                    if (excludeIds.length > 0) {
                        query = query.not('id', 'in', excludeIds);
                    }
                    return [4 /*yield*/, query];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('Error fetching products by tags:', error);
                        throw new Error(error.message);
                    }
                    if (!data || data.length === 0) {
                        return [2 /*return*/, []];
                    }
                    products = data.map(function (item) { return ({
                        id: item.id,
                        title: item.title,
                        brand: item.brand,
                        price: item.price,
                        imageUrl: item.image_url,
                        description: item.description,
                        tags: item.tags || [],
                        category: item.category,
                        affiliateUrl: item.affiliate_url,
                        source: item.source,
                        createdAt: item.created_at,
                    }); });
                    // プリフェッチ
                    return [4 /*yield*/, (0, exports.prefetchImages)(products)];
                case 2:
                    // プリフェッチ
                    _b.sent();
                    return [2 /*return*/, products];
                case 3:
                    error_7 = _b.sent();
                    console.error('Unexpected error in fetchProductsByTags:', error_7);
                    if (__DEV__) {
                        // 開発モードではモックデータでの代替処理
                        return [2 /*return*/, mockProducts_1.mockProducts
                                .filter(function (p) {
                                return !excludeIds.includes(p.id) &&
                                    p.tags && p.tags.some(function (tag) { return tags.includes(tag); });
                            })
                                .slice(0, limit)];
                    }
                    throw error_7;
                case 4: return [2 /*return*/];
            }
        });
    });
};
exports.fetchProductsByTags = fetchProductsByTags;
