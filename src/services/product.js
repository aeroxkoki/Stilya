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
exports.logProductClick = exports.searchProducts = exports.fetchRecommendedProducts = exports.fetchProductById = exports.fetchProducts = void 0;
var supabase_1 = require("./supabase");
var dummyData_1 = require("@/utils/dummyData");
// Supabaseから商品データを取得
var fetchProducts = function () {
    var args_1 = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args_1[_i] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (limit, page, filters) {
        var query_1, offset, _a, data, error, error_1;
        if (limit === void 0) { limit = 20; }
        if (page === void 0) { page = 0; }
        if (filters === void 0) { filters = {}; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    query_1 = supabase_1.supabase.from('products').select('*');
                    // フィルター適用
                    Object.entries(filters).forEach(function (_a) {
                        var key = _a[0], value = _a[1];
                        if (value) {
                            if (Array.isArray(value)) {
                                // タグなどの配列フィルターはoverlap演算子を使用
                                query_1 = query_1.overlaps(key, value);
                            }
                            else {
                                // 通常のフィルターはeq演算子を使用
                                query_1 = query_1.eq(key, value);
                            }
                        }
                    });
                    offset = page * limit;
                    query_1 = query_1.range(offset, offset + limit - 1);
                    // 並び替え（最新順）
                    query_1 = query_1.order('createdAt', { ascending: false });
                    return [4 /*yield*/, query_1];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('Error fetching products:', error);
                        throw error;
                    }
                    // データをProduct型に変換
                    return [2 /*return*/, (data || []).map(function (item) { return ({
                            id: item.id,
                            title: item.title,
                            imageUrl: item.image_url,
                            brand: item.brand,
                            price: item.price,
                            tags: item.tags,
                            category: item.category,
                            affiliateUrl: item.affiliate_url,
                            source: item.source,
                            createdAt: item.created_at,
                        }); })];
                case 2:
                    error_1 = _b.sent();
                    console.error('Error in fetchProducts:', error_1);
                    // 開発中はエラー時にダミーデータを返す（本番では適切なエラーハンドリングを行う）
                    if (__DEV__) {
                        console.warn('Using dummy data due to API error');
                        return [2 /*return*/, (0, dummyData_1.generateDummyProducts)(limit)];
                    }
                    throw error_1;
                case 3: return [2 /*return*/];
            }
        });
    });
};
exports.fetchProducts = fetchProducts;
// 商品詳細を取得
var fetchProductById = function (id) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, error, error_2, dummyProducts;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                return [4 /*yield*/, supabase_1.supabase
                        .from('products')
                        .select('*')
                        .eq('id', id)
                        .single()];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error) {
                    console.error('Error fetching product:', error);
                    throw error;
                }
                if (!data)
                    return [2 /*return*/, null];
                // データをProduct型に変換
                return [2 /*return*/, {
                        id: data.id,
                        title: data.title,
                        imageUrl: data.image_url,
                        brand: data.brand,
                        price: data.price,
                        tags: data.tags,
                        category: data.category,
                        affiliateUrl: data.affiliate_url,
                        source: data.source,
                        createdAt: data.created_at,
                    }];
            case 2:
                error_2 = _b.sent();
                console.error('Error in fetchProductById:', error_2);
                // 開発中はエラー時にダミーデータを返す
                if (__DEV__) {
                    console.warn('Using dummy product due to API error');
                    dummyProducts = (0, dummyData_1.generateDummyProducts)(10);
                    return [2 /*return*/, dummyProducts.find(function (p) { return p.id === id; }) || dummyProducts[0]];
                }
                throw error_2;
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.fetchProductById = fetchProductById;
// ユーザーの好みに基づいた商品レコメンド
var fetchRecommendedProducts = function (userId_1) {
    var args_1 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([userId_1], args_1, true), void 0, function (userId, limit) {
        var _a, swipes, swipeError, productIds, _b, products, productError, tagCounts_1, popularTags, _c, recommendations, recError, error_3;
        if (limit === void 0) { limit = 20; }
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    _d.trys.push([0, 4, , 5]);
                    return [4 /*yield*/, supabase_1.supabase
                            .from('swipes')
                            .select('product_id')
                            .eq('user_id', userId)
                            .eq('result', 'yes')];
                case 1:
                    _a = _d.sent(), swipes = _a.data, swipeError = _a.error;
                    if (swipeError)
                        throw swipeError;
                    // スワイプがない場合は新着商品を返す
                    if (!swipes || swipes.length === 0) {
                        return [2 /*return*/, (0, exports.fetchProducts)(limit, 0)];
                    }
                    productIds = swipes.map(function (swipe) { return swipe.product_id; });
                    return [4 /*yield*/, supabase_1.supabase
                            .from('products')
                            .select('tags')
                            .in('id', productIds)];
                case 2:
                    _b = _d.sent(), products = _b.data, productError = _b.error;
                    if (productError)
                        throw productError;
                    tagCounts_1 = {};
                    products.forEach(function (product) {
                        if (product.tags) {
                            product.tags.forEach(function (tag) {
                                tagCounts_1[tag] = (tagCounts_1[tag] || 0) + 1;
                            });
                        }
                    });
                    popularTags = Object.entries(tagCounts_1)
                        .sort(function (_a, _b) {
                        var countA = _a[1];
                        var countB = _b[1];
                        return countB - countA;
                    })
                        .slice(0, 5)
                        .map(function (_a) {
                        var tag = _a[0];
                        return tag;
                    });
                    return [4 /*yield*/, supabase_1.supabase
                            .from('products')
                            .select('*')
                            .not('id', 'in', productIds)
                            .overlaps('tags', popularTags)
                            .limit(limit)];
                case 3:
                    _c = _d.sent(), recommendations = _c.data, recError = _c.error;
                    if (recError)
                        throw recError;
                    // データをProduct型に変換
                    return [2 /*return*/, (recommendations || []).map(function (item) { return ({
                            id: item.id,
                            title: item.title,
                            imageUrl: item.image_url,
                            brand: item.brand,
                            price: item.price,
                            tags: item.tags,
                            category: item.category,
                            affiliateUrl: item.affiliate_url,
                            source: item.source,
                            createdAt: item.created_at,
                        }); })];
                case 4:
                    error_3 = _d.sent();
                    console.error('Error in fetchRecommendedProducts:', error_3);
                    // 開発中はエラー時にダミーデータを返す
                    if (__DEV__) {
                        console.warn('Using dummy recommendations due to API error');
                        return [2 /*return*/, (0, dummyData_1.generateDummyProducts)(limit)];
                    }
                    throw error_3;
                case 5: return [2 /*return*/];
            }
        });
    });
};
exports.fetchRecommendedProducts = fetchRecommendedProducts;
// 商品検索
var searchProducts = function (query_2) {
    var args_1 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([query_2], args_1, true), void 0, function (query, limit) {
        var _a, data, error, error_4, dummyProducts;
        if (limit === void 0) { limit = 20; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, supabase_1.supabase
                            .from('products')
                            .select('*')
                            .or("title.ilike.%".concat(query, "%, brand.ilike.%").concat(query, "%, category.ilike.%").concat(query, "%"))
                            .limit(limit)];
                case 1:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error)
                        throw error;
                    // データをProduct型に変換
                    return [2 /*return*/, (data || []).map(function (item) { return ({
                            id: item.id,
                            title: item.title,
                            imageUrl: item.image_url,
                            brand: item.brand,
                            price: item.price,
                            tags: item.tags,
                            category: item.category,
                            affiliateUrl: item.affiliate_url,
                            source: item.source,
                            createdAt: item.created_at,
                        }); })];
                case 2:
                    error_4 = _b.sent();
                    console.error('Error in searchProducts:', error_4);
                    // 開発中はエラー時にダミーデータを返す
                    if (__DEV__) {
                        console.warn('Using dummy search results due to API error');
                        dummyProducts = (0, dummyData_1.generateDummyProducts)(limit * 2);
                        return [2 /*return*/, dummyProducts.filter(function (p) {
                                return p.title.toLowerCase().includes(query.toLowerCase()) ||
                                    (p.brand && p.brand.toLowerCase().includes(query.toLowerCase())) ||
                                    (p.category && p.category.toLowerCase().includes(query.toLowerCase()));
                            }).slice(0, limit)];
                    }
                    throw error_4;
                case 3: return [2 /*return*/];
            }
        });
    });
};
exports.searchProducts = searchProducts;
// クリックログの記録
var logProductClick = function (userId, productId) { return __awaiter(void 0, void 0, void 0, function () {
    var error, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, supabase_1.supabase
                        .from('click_logs')
                        .insert([{
                            user_id: userId,
                            product_id: productId,
                            created_at: new Date().toISOString(),
                        }])];
            case 1:
                error = (_a.sent()).error;
                if (error)
                    throw error;
                return [3 /*break*/, 3];
            case 2:
                error_5 = _a.sent();
                // クリックログはユーザー体験に影響しないのでコンソールに記録するだけ
                console.error('Error logging product click:', error_5);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.logProductClick = logProductClick;
