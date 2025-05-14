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
exports.clearRecommendationCaches = exports.getRecommendationsByCategory = exports.getRecommendedProducts = exports.analyzeUserPreferences = void 0;
var supabase_1 = require("./supabase");
var swipeService_1 = require("./swipeService");
var productService_1 = require("./productService");
var viewHistoryService_1 = require("./viewHistoryService");
// タグの重み付けスコア
var TAG_SCORE_YES = 1.0; // YESスワイプの場合のスコア
var TAG_SCORE_NO = -0.5; // NOスワイプの場合のスコア
var TAG_SCORE_VIEW = 0.3; // 閲覧履歴の場合のスコア
var TAG_SCORE_CLICK = 0.5; // クリック（購入リンク）の場合のスコア
var TAG_BONUS_THRESHOLD = 3; // このスコア以上のタグを重要タグとして扱う
var MIN_CONFIDENCE_SCORE = 0.6; // この値以上のタグを使ったレコメンドを行う
// キャッシュ設定
var CACHE_TTL = 5 * 60 * 1000; // 5分（ミリ秒）
var userPreferenceCache = new Map();
/**
 * ユーザーの行動履歴から好みを分析する（強化版）
 *
 * スワイプ履歴、閲覧履歴、クリック履歴を組み合わせて、より精度の高い好み分析を行う
 * @param userId ユーザーID
 * @param skipCache キャッシュをスキップする場合はtrue
 * @returns ユーザーの好みタグとスコア
 */
var analyzeUserPreferences = function (userId_1) {
    var args_1 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([userId_1], args_1, true), void 0, function (userId, skipCache) {
        var cachedPreference, swipeHistory, viewHistory, yesProductIds, noProductIds, viewedProductIds, _a, clickLogs, clickError, clickedProductIds, _b, yesProducts, noProducts, clickedProducts, tagScores, result, error_1;
        if (skipCache === void 0) { skipCache = false; }
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    // キャッシュチェック
                    if (!skipCache) {
                        cachedPreference = userPreferenceCache.get(userId);
                        if (cachedPreference && (Date.now() - cachedPreference.timestamp < CACHE_TTL)) {
                            console.log('Using cached user preferences for user:', userId);
                            return [2 /*return*/, cachedPreference.data];
                        }
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 6, , 7]);
                    return [4 /*yield*/, (0, swipeService_1.getSwipeHistory)(userId)];
                case 2:
                    swipeHistory = _c.sent();
                    return [4 /*yield*/, (0, viewHistoryService_1.getProductViewHistory)(userId, 100)];
                case 3:
                    viewHistory = _c.sent();
                    // ユーザー行動がない場合はnullを返す
                    if (swipeHistory.length === 0 && viewHistory.length === 0) {
                        console.log('No user activity found for user:', userId);
                        return [2 /*return*/, null];
                    }
                    yesProductIds = swipeHistory
                        .filter(function (swipe) { return swipe.result === 'yes'; })
                        .map(function (swipe) { return swipe.productId; });
                    noProductIds = swipeHistory
                        .filter(function (swipe) { return swipe.result === 'no'; })
                        .map(function (swipe) { return swipe.productId; });
                    viewedProductIds = viewHistory.map(function (product) { return product.id; });
                    return [4 /*yield*/, supabase_1.supabase
                            .from('click_logs')
                            .select('product_id')
                            .eq('user_id', userId)
                            .order('created_at', { ascending: false })
                            .limit(50)];
                case 4:
                    _a = _c.sent(), clickLogs = _a.data, clickError = _a.error;
                    if (clickError) {
                        console.error('Error fetching click logs:', clickError);
                    }
                    clickedProductIds = (clickLogs && clickLogs.length > 0)
                        ? clickLogs.map(function (log) { return log.product_id; })
                        : [];
                    return [4 /*yield*/, Promise.all([
                            fetchProductsById(yesProductIds),
                            fetchProductsById(noProductIds),
                            fetchProductsById(clickedProductIds)
                        ])];
                case 5:
                    _b = _c.sent(), yesProducts = _b[0], noProducts = _b[1], clickedProducts = _b[2];
                    tagScores = calculateEnhancedTagScores(yesProducts, noProducts, viewHistory, clickedProducts);
                    result = {
                        userId: userId,
                        tagScores: tagScores,
                        lastUpdated: new Date().toISOString(),
                        topTags: getTopTags(tagScores, 10)
                    };
                    // キャッシュに保存
                    userPreferenceCache.set(userId, {
                        data: result,
                        timestamp: Date.now()
                    });
                    return [2 /*return*/, result];
                case 6:
                    error_1 = _c.sent();
                    console.error('Error analyzing user preferences:', error_1);
                    return [2 /*return*/, null];
                case 7: return [2 /*return*/];
            }
        });
    });
};
exports.analyzeUserPreferences = analyzeUserPreferences;
/**
 * 商品IDから商品データを取得する
 * @param productIds 商品IDの配列
 * @returns 商品データの配列
 */
var fetchProductsById = function (productIds) { return __awaiter(void 0, void 0, void 0, function () {
    var BATCH_SIZE, batches, i, batchIds, batchResults, combinedData, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (productIds.length === 0)
                    return [2 /*return*/, []];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                BATCH_SIZE = 100;
                batches = [];
                // IDを適切なサイズのバッチに分割
                for (i = 0; i < productIds.length; i += BATCH_SIZE) {
                    batchIds = productIds.slice(i, i + BATCH_SIZE);
                    batches.push(batchIds);
                }
                return [4 /*yield*/, Promise.all(batches.map(function (batchIds) { return __awaiter(void 0, void 0, void 0, function () {
                        var _a, data, error;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0: return [4 /*yield*/, supabase_1.supabase
                                        .from('products')
                                        .select('*')
                                        .in('id', batchIds)];
                                case 1:
                                    _a = _b.sent(), data = _a.data, error = _a.error;
                                    if (error) {
                                        console.error('Error fetching products by IDs:', error);
                                        return [2 /*return*/, []];
                                    }
                                    return [2 /*return*/, data || []];
                            }
                        });
                    }); }))];
            case 2:
                batchResults = _a.sent();
                combinedData = batchResults.flat();
                // データの形式を変換
                return [2 /*return*/, combinedData.map(function (item) { return ({
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
                    }); })];
            case 3:
                error_2 = _a.sent();
                console.error('Unexpected error in fetchProductsById:', error_2);
                return [2 /*return*/, []];
            case 4: return [2 /*return*/];
        }
    });
}); };
/**
 * 閲覧履歴やクリック履歴も考慮してタグスコアを計算する（拡張版）
 * @param yesProducts YESスワイプされた商品
 * @param noProducts NOスワイプされた商品
 * @param viewedProducts 閲覧された商品
 * @param clickedProducts クリック（購入リンク）された商品
 * @returns タグとスコアのマップ
 */
var calculateEnhancedTagScores = function (yesProducts, noProducts, viewedProducts, clickedProducts) {
    var tagScores = {};
    // YESスワイプの商品からタグスコアを加算
    yesProducts.forEach(function (product) {
        if (!product.tags || !Array.isArray(product.tags))
            return;
        product.tags.forEach(function (tag) {
            if (!tag)
                return; // 無効なタグをスキップ
            tagScores[tag] = (tagScores[tag] || 0) + TAG_SCORE_YES;
        });
    });
    // NOスワイプの商品からタグスコアを減算
    noProducts.forEach(function (product) {
        if (!product.tags || !Array.isArray(product.tags))
            return;
        product.tags.forEach(function (tag) {
            if (!tag)
                return;
            tagScores[tag] = (tagScores[tag] || 0) + TAG_SCORE_NO;
        });
    });
    // 閲覧履歴からタグスコアを加算（閲覧が複数回あると、より高いスコア）
    // 閲覧履歴はIDベースで重複を除去したカウントマップを作成
    var viewCountMap = {};
    viewedProducts.forEach(function (product) {
        viewCountMap[product.id] = (viewCountMap[product.id] || 0) + 1;
    });
    // ユニークな閲覧商品のタグを処理
    var uniqueViewedProducts = viewedProducts.filter(function (product, index, self) {
        return index === self.findIndex(function (p) { return p.id === product.id; });
    });
    uniqueViewedProducts.forEach(function (product) {
        if (!product.tags || !Array.isArray(product.tags))
            return;
        var viewCount = viewCountMap[product.id] || 1;
        var viewWeight = Math.min(viewCount, 3) * 0.1; // 最大3回まで重み付け（0.1, 0.2, 0.3）
        product.tags.forEach(function (tag) {
            if (!tag)
                return;
            tagScores[tag] = (tagScores[tag] || 0) + TAG_SCORE_VIEW + viewWeight;
        });
    });
    // クリック（購入リンク）履歴からタグスコアを加算
    clickedProducts.forEach(function (product) {
        if (!product.tags || !Array.isArray(product.tags))
            return;
        product.tags.forEach(function (tag) {
            if (!tag)
                return;
            tagScores[tag] = (tagScores[tag] || 0) + TAG_SCORE_CLICK;
        });
    });
    // 最終スコアを計算（スコアが3を超えるタグには追加ボーナス）
    Object.keys(tagScores).forEach(function (tag) {
        if (tagScores[tag] >= TAG_BONUS_THRESHOLD) {
            tagScores[tag] += 0.5; // 高スコアタグにボーナス
        }
    });
    return tagScores;
};
/**
 * 上位のタグを取得する
 * @param tagScores タグスコアのマップ
 * @param limit 取得するタグ数
 * @returns 上位のタグ配列
 */
var getTopTags = function (tagScores, limit) {
    return Object.entries(tagScores)
        .filter(function (_a) {
        var _ = _a[0], score = _a[1];
        return score > MIN_CONFIDENCE_SCORE;
    }) // スコアが一定以上のものだけ
        .sort(function (a, b) { return b[1] - a[1]; }) // スコアの高い順にソート
        .slice(0, limit) // 上位N個を取得
        .map(function (_a) {
        var tag = _a[0], _ = _a[1];
        return tag;
    }); // タグのみの配列に変換
};
var recommendationCache = new Map();
/**
 * ユーザーの好みに基づいて商品を推薦する
 * @param userId ユーザーID
 * @param limit 取得する商品数
 * @param excludeIds 除外する商品ID（すでにスワイプした商品など）
 * @param skipCache キャッシュをスキップする場合はtrue
 * @returns 推薦商品の配列
 */
var getRecommendedProducts = function (userId_1) {
    var args_1 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([userId_1], args_1, true), void 0, function (userId, limit, excludeIds, skipCache) {
        var cacheKey, cached, userPreference, popularProducts, recommendedProducts, validTags, stringTags, stringTags, popularProducts, popularProducts, result, error_3;
        if (limit === void 0) { limit = 10; }
        if (excludeIds === void 0) { excludeIds = []; }
        if (skipCache === void 0) { skipCache = false; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 10, , 11]);
                    cacheKey = "".concat(userId, "_").concat(limit, "_").concat(excludeIds.join(','));
                    // キャッシュチェック
                    if (!skipCache) {
                        cached = recommendationCache.get(cacheKey);
                        if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
                            console.log('Using cached recommendations for:', cacheKey);
                            return [2 /*return*/, cached.products];
                        }
                    }
                    return [4 /*yield*/, (0, exports.analyzeUserPreferences)(userId)];
                case 1:
                    userPreference = _a.sent();
                    if (!(!userPreference || !userPreference.topTags || userPreference.topTags.length === 0)) return [3 /*break*/, 3];
                    console.log('No user preferences found, using popular products instead');
                    return [4 /*yield*/, getPopularProducts(limit, excludeIds)];
                case 2:
                    popularProducts = _a.sent();
                    // キャッシュに保存
                    recommendationCache.set(cacheKey, {
                        products: popularProducts,
                        timestamp: Date.now()
                    });
                    return [2 /*return*/, popularProducts];
                case 3:
                    recommendedProducts = [];
                    validTags = [];
                    // userPreferenceからタグを抽出（型安全性を確保）
                    if (userPreference.topTags && Array.isArray(userPreference.topTags)) {
                        stringTags = userPreference.topTags.filter(function (tag) { return typeof tag === 'string'; });
                        validTags.push.apply(validTags, stringTags);
                    }
                    if (!(validTags.length > 0)) return [3 /*break*/, 5];
                    console.log("Searching with ".concat(validTags.length, " tags:"), validTags);
                    stringTags = validTags.filter(function (tag) { return typeof tag === 'string'; });
                    return [4 /*yield*/, (0, productService_1.fetchProductsByTags)(stringTags, limit * 2, // 多めに取得して後でフィルタリング
                        excludeIds)];
                case 4:
                    // タグ型の互換性を確保
                    recommendedProducts = _a.sent();
                    return [3 /*break*/, 7];
                case 5:
                    console.log('No valid tags found for search, using popular products instead');
                    return [4 /*yield*/, getPopularProducts(limit, excludeIds)];
                case 6:
                    popularProducts = _a.sent();
                    // キャッシュに保存
                    recommendationCache.set(cacheKey, {
                        products: popularProducts,
                        timestamp: Date.now()
                    });
                    return [2 /*return*/, popularProducts];
                case 7:
                    if (!(recommendedProducts.length === 0)) return [3 /*break*/, 9];
                    return [4 /*yield*/, getPopularProducts(limit, excludeIds)];
                case 8:
                    popularProducts = _a.sent();
                    // キャッシュに保存
                    recommendationCache.set(cacheKey, {
                        products: popularProducts,
                        timestamp: Date.now()
                    });
                    return [2 /*return*/, popularProducts];
                case 9:
                    // タグスコアを使用して商品をランク付け
                    recommendedProducts = rankProductsByTagScores(recommendedProducts, userPreference.tagScores);
                    result = recommendedProducts.slice(0, limit);
                    // キャッシュに保存
                    recommendationCache.set(cacheKey, {
                        products: result,
                        timestamp: Date.now()
                    });
                    return [2 /*return*/, result];
                case 10:
                    error_3 = _a.sent();
                    console.error('Error getting recommended products:', error_3);
                    // エラー時は空配列を返す（UIがクラッシュしないように）
                    return [2 /*return*/, []];
                case 11: return [2 /*return*/];
            }
        });
    });
};
exports.getRecommendedProducts = getRecommendedProducts;
/**
 * ユーザーの好みに合わせて商品をランク付けする
 * @param products 商品配列
 * @param tagScores タグスコアのマップ
 * @returns ランク付けされた商品配列
 */
var rankProductsByTagScores = function (products, tagScores) {
    // 各商品にスコアを設定
    var productsWithScore = products.map(function (product) {
        var score = 0;
        // 商品のタグごとにスコアを加算
        if (product.tags && Array.isArray(product.tags)) {
            product.tags.forEach(function (tag) {
                if (tagScores[tag]) {
                    score += tagScores[tag];
                }
            });
        }
        return { product: product, score: score };
    });
    // スコアの高い順にソート
    productsWithScore.sort(function (a, b) { return b.score - a.score; });
    // 商品のみの配列に変換
    return productsWithScore.map(function (item) { return item.product; });
};
// 人気商品のキャッシュ
var popularProductsCache = new Map();
/**
 * 人気商品を取得する（好みが分析できない場合のフォールバック）
 * @param limit 取得する商品数
 * @param excludeIds 除外する商品ID
 * @returns 人気商品の配列
 */
var getPopularProducts = function () {
    var args_1 = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args_1[_i] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (limit, excludeIds) {
        var cacheKey, cached, query, filterExcludedProducts, _a, data_1, error_5, filteredData, result_1, _b, data, error, result, error_4;
        if (limit === void 0) { limit = 10; }
        if (excludeIds === void 0) { excludeIds = []; }
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    cacheKey = "popular_".concat(limit, "_").concat(excludeIds.join(','));
                    cached = popularProductsCache.get(cacheKey);
                    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
                        return [2 /*return*/, cached.products];
                    }
                    _c.label = 1;
                case 1:
                    _c.trys.push([1, 6, , 7]);
                    query = supabase_1.supabase
                        .from('products')
                        .select('*')
                        .limit(limit);
                    if (!(excludeIds.length > 0)) return [3 /*break*/, 4];
                    if (!(excludeIds.length > 100)) return [3 /*break*/, 3];
                    filterExcludedProducts = function (products) {
                        var excludeSet = new Set(excludeIds);
                        return products.filter(function (product) { return !excludeSet.has(product.id); });
                    };
                    return [4 /*yield*/, supabase_1.supabase
                            .from('products')
                            .select('*')
                            .limit(limit * 3)];
                case 2:
                    _a = _c.sent(), data_1 = _a.data, error_5 = _a.error;
                    if (error_5) {
                        console.error('Error fetching popular products:', error_5);
                        throw new Error(error_5.message);
                    }
                    if (!data_1 || data_1.length === 0) {
                        return [2 /*return*/, []];
                    }
                    filteredData = filterExcludedProducts(data_1);
                    result_1 = filteredData.slice(0, limit).map(function (item) { return ({
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
                    // キャッシュに保存
                    popularProductsCache.set(cacheKey, {
                        products: result_1,
                        timestamp: Date.now()
                    });
                    return [2 /*return*/, result_1];
                case 3:
                    // 除外IDの数が少ない場合は通常のクエリ
                    query = query.not('id', 'in', excludeIds);
                    _c.label = 4;
                case 4: return [4 /*yield*/, query];
                case 5:
                    _b = _c.sent(), data = _b.data, error = _b.error;
                    if (error) {
                        console.error('Error fetching popular products:', error);
                        throw new Error(error.message);
                    }
                    if (!data || data.length === 0) {
                        return [2 /*return*/, []];
                    }
                    result = data.map(function (item) { return ({
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
                    // キャッシュに保存
                    popularProductsCache.set(cacheKey, {
                        products: result,
                        timestamp: Date.now()
                    });
                    return [2 /*return*/, result];
                case 6:
                    error_4 = _c.sent();
                    console.error('Unexpected error in getPopularProducts:', error_4);
                    return [2 /*return*/, []];
                case 7: return [2 /*return*/];
            }
        });
    });
};
// カテゴリ別レコメンドのキャッシュ
var categoryRecommendationCache = new Map();
/**
 * カテゴリ別におすすめ商品を取得する
 * @param userId ユーザーID
 * @param categories 取得するカテゴリの配列
 * @param limit カテゴリごとの取得数
 * @param skipCache キャッシュをスキップする場合はtrue
 * @returns カテゴリごとの商品リスト
 */
var getRecommendationsByCategory = function (userId_1) {
    var args_1 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([userId_1], args_1, true), void 0, function (userId, categories, limit, skipCache) {
        var cacheKey, cached, result_2, userPreference_1, swipeHistory, swipedProductIds_1, categoryPromises, categoryResults, error_6;
        if (categories === void 0) { categories = ['tops', 'bottoms', 'outerwear', 'accessories']; }
        if (limit === void 0) { limit = 5; }
        if (skipCache === void 0) { skipCache = false; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 4, , 5]);
                    cacheKey = "".concat(userId, "_").concat(categories.join(','), "_").concat(limit);
                    // キャッシュチェック
                    if (!skipCache) {
                        cached = categoryRecommendationCache.get(cacheKey);
                        if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
                            console.log('Using cached category recommendations for:', cacheKey);
                            return [2 /*return*/, cached.data];
                        }
                    }
                    result_2 = {};
                    return [4 /*yield*/, (0, exports.analyzeUserPreferences)(userId)];
                case 1:
                    userPreference_1 = _a.sent();
                    return [4 /*yield*/, (0, swipeService_1.getSwipeHistory)(userId)];
                case 2:
                    swipeHistory = _a.sent();
                    swipedProductIds_1 = swipeHistory.map(function (swipe) { return swipe.productId; });
                    categoryPromises = categories.map(function (category) { return __awaiter(void 0, void 0, void 0, function () {
                        var products, validTags, stringTags, error_7;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    _a.trys.push([0, 8, , 9]);
                                    products = [];
                                    if (!(userPreference_1 && userPreference_1.topTags && userPreference_1.topTags.length > 0)) return [3 /*break*/, 5];
                                    validTags = [];
                                    // userPreferenceからタグを抽出（型安全性を確保）
                                    if (userPreference_1.topTags && Array.isArray(userPreference_1.topTags)) {
                                        stringTags = userPreference_1.topTags.filter(function (tag) { return typeof tag === 'string'; });
                                        validTags.push.apply(validTags, stringTags);
                                    }
                                    if (!(validTags.length > 0)) return [3 /*break*/, 2];
                                    return [4 /*yield*/, fetchProductsByCategoryAndTags(category, validTags, limit, swipedProductIds_1)];
                                case 1:
                                    // タグ型の互換性を確保
                                    products = _a.sent();
                                    return [3 /*break*/, 4];
                                case 2: return [4 /*yield*/, fetchProductsByCategory(category, limit, swipedProductIds_1)];
                                case 3:
                                    // タグが見つからない場合はカテゴリのみで検索
                                    products = _a.sent();
                                    _a.label = 4;
                                case 4:
                                    if (products.length > 0 && userPreference_1.tagScores) {
                                        // タグスコアを使用してランク付け
                                        products = rankProductsByTagScores(products, userPreference_1.tagScores);
                                    }
                                    _a.label = 5;
                                case 5:
                                    if (!(products.length === 0)) return [3 /*break*/, 7];
                                    return [4 /*yield*/, fetchProductsByCategory(category, limit, swipedProductIds_1)];
                                case 6:
                                    products = _a.sent();
                                    _a.label = 7;
                                case 7: return [2 /*return*/, { category: category, products: products }];
                                case 8:
                                    error_7 = _a.sent();
                                    console.error("Error fetching products for category ".concat(category, ":"), error_7);
                                    return [2 /*return*/, { category: category, products: [] }];
                                case 9: return [2 /*return*/];
                            }
                        });
                    }); });
                    return [4 /*yield*/, Promise.all(categoryPromises)];
                case 3:
                    categoryResults = _a.sent();
                    // 結果をマージ
                    categoryResults.forEach(function (_a) {
                        var category = _a.category, products = _a.products;
                        result_2[category] = products;
                    });
                    // キャッシュに保存
                    categoryRecommendationCache.set(cacheKey, {
                        data: result_2,
                        timestamp: Date.now()
                    });
                    return [2 /*return*/, result_2];
                case 4:
                    error_6 = _a.sent();
                    console.error('Error getting recommendations by category:', error_6);
                    return [2 /*return*/, {}];
                case 5: return [2 /*return*/];
            }
        });
    });
};
exports.getRecommendationsByCategory = getRecommendationsByCategory;
/**
 * カテゴリとタグで商品を検索する
 */
var fetchProductsByCategoryAndTags = function (category_1, tags_1, limit_1) {
    var args_1 = [];
    for (var _i = 3; _i < arguments.length; _i++) {
        args_1[_i - 3] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([category_1, tags_1, limit_1], args_1, true), void 0, function (category, tags, limit, excludeIds) {
        var usedTags, query, _a, data_2, error_9, excludeSet_1, filteredData, _b, data, error, error_8;
        if (excludeIds === void 0) { excludeIds = []; }
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 5, , 6]);
                    if (!tags || tags.length === 0) {
                        return [2 /*return*/, fetchProductsByCategory(category, limit, excludeIds)];
                    }
                    usedTags = tags.length > 5 ? tags.slice(0, 5) : tags;
                    query = supabase_1.supabase
                        .from('products')
                        .select('*')
                        .eq('category', category)
                        .contains('tags', usedTags)
                        .limit(limit);
                    if (!(excludeIds.length > 0)) return [3 /*break*/, 3];
                    if (!(excludeIds.length > 100)) return [3 /*break*/, 2];
                    return [4 /*yield*/, query];
                case 1:
                    _a = _c.sent(), data_2 = _a.data, error_9 = _a.error;
                    if (error_9) {
                        console.error('Error fetching products by category and tags:', error_9);
                        throw new Error(error_9.message);
                    }
                    if (!data_2 || data_2.length === 0) {
                        return [2 /*return*/, []];
                    }
                    excludeSet_1 = new Set(excludeIds);
                    filteredData = data_2.filter(function (item) { return !excludeSet_1.has(item.id); });
                    // データの形式を変換
                    return [2 /*return*/, filteredData.slice(0, limit).map(function (item) { return ({
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
                        }); })];
                case 2:
                    query = query.not('id', 'in', excludeIds);
                    _c.label = 3;
                case 3: return [4 /*yield*/, query];
                case 4:
                    _b = _c.sent(), data = _b.data, error = _b.error;
                    if (error) {
                        console.error('Error fetching products by category and tags:', error);
                        throw new Error(error.message);
                    }
                    if (!data || data.length === 0) {
                        return [2 /*return*/, []];
                    }
                    // データの形式を変換
                    return [2 /*return*/, data.map(function (item) { return ({
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
                        }); })];
                case 5:
                    error_8 = _c.sent();
                    console.error('Unexpected error in fetchProductsByCategoryAndTags:', error_8);
                    return [2 /*return*/, []];
                case 6: return [2 /*return*/];
            }
        });
    });
};
/**
 * カテゴリで商品を検索する
 */
var fetchProductsByCategory = function (category_1, limit_1) {
    var args_1 = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args_1[_i - 2] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([category_1, limit_1], args_1, true), void 0, function (category, limit, excludeIds) {
        var query, _a, data_3, error_11, excludeSet_2, filteredData, _b, data, error, error_10;
        if (excludeIds === void 0) { excludeIds = []; }
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 5, , 6]);
                    query = supabase_1.supabase
                        .from('products')
                        .select('*')
                        .eq('category', category)
                        .limit(limit);
                    if (!(excludeIds.length > 0)) return [3 /*break*/, 3];
                    if (!(excludeIds.length > 100)) return [3 /*break*/, 2];
                    return [4 /*yield*/, query];
                case 1:
                    _a = _c.sent(), data_3 = _a.data, error_11 = _a.error;
                    if (error_11) {
                        console.error('Error fetching products by category:', error_11);
                        throw new Error(error_11.message);
                    }
                    if (!data_3 || data_3.length === 0) {
                        return [2 /*return*/, []];
                    }
                    excludeSet_2 = new Set(excludeIds);
                    filteredData = data_3.filter(function (item) { return !excludeSet_2.has(item.id); });
                    // データの形式を変換
                    return [2 /*return*/, filteredData.slice(0, limit).map(function (item) { return ({
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
                        }); })];
                case 2:
                    query = query.not('id', 'in', excludeIds);
                    _c.label = 3;
                case 3: return [4 /*yield*/, query];
                case 4:
                    _b = _c.sent(), data = _b.data, error = _b.error;
                    if (error) {
                        console.error('Error fetching products by category:', error);
                        throw new Error(error.message);
                    }
                    if (!data || data.length === 0) {
                        return [2 /*return*/, []];
                    }
                    // データの形式を変換
                    return [2 /*return*/, data.map(function (item) { return ({
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
                        }); })];
                case 5:
                    error_10 = _c.sent();
                    console.error('Unexpected error in fetchProductsByCategory:', error_10);
                    return [2 /*return*/, []];
                case 6: return [2 /*return*/];
            }
        });
    });
};
/**
 * キャッシュを削除する（テスト用）
 */
var clearRecommendationCaches = function () {
    userPreferenceCache.clear();
    recommendationCache.clear();
    popularProductsCache.clear();
    categoryRecommendationCache.clear();
    console.log('All recommendation caches cleared');
};
exports.clearRecommendationCaches = clearRecommendationCaches;
