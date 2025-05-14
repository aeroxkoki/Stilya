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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearRakutenCache = exports.fetchRelatedProducts = exports.fetchRakutenGenreProducts = exports.fetchRakutenFashionProducts = void 0;
var axios_1 = __importDefault(require("axios"));
var expo_image_1 = require("expo-image");
var async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
// 楽天APIキー（.envファイルから読み込む想定）
var RAKUTEN_APP_ID = process.env.RAKUTEN_APP_ID || 'YOUR_RAKUTEN_APP_ID';
var RAKUTEN_AFFILIATE_ID = process.env.RAKUTEN_AFFILIATE_ID || 'YOUR_RAKUTEN_AFFILIATE_ID';
// キャッシュキー
var RAKUTEN_CACHE_KEY_PREFIX = 'rakuten_products_cache_';
var CACHE_EXPIRY = 60 * 60 * 1000; // 1時間
// キャッシュからデータを取得
var getFromCache = function (cacheKey) { return __awaiter(void 0, void 0, void 0, function () {
    var cachedData, _a, data, timestamp, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                return [4 /*yield*/, async_storage_1.default.getItem("".concat(RAKUTEN_CACHE_KEY_PREFIX).concat(cacheKey))];
            case 1:
                cachedData = _b.sent();
                if (cachedData) {
                    _a = JSON.parse(cachedData), data = _a.data, timestamp = _a.timestamp;
                    // キャッシュの有効期限をチェック
                    if (Date.now() - timestamp < CACHE_EXPIRY) {
                        return [2 /*return*/, data];
                    }
                }
                return [2 /*return*/, null];
            case 2:
                error_1 = _b.sent();
                console.error('Error getting data from cache:', error_1);
                return [2 /*return*/, null];
            case 3: return [2 /*return*/];
        }
    });
}); };
// キャッシュにデータを保存
var saveToCache = function (cacheKey, data) { return __awaiter(void 0, void 0, void 0, function () {
    var cacheData, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                cacheData = {
                    data: data,
                    timestamp: Date.now(),
                };
                return [4 /*yield*/, async_storage_1.default.setItem("".concat(RAKUTEN_CACHE_KEY_PREFIX).concat(cacheKey), JSON.stringify(cacheData))];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('Error saving data to cache:', error_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * 楽天商品検索APIからファッション商品を取得
 */
var fetchRakutenFashionProducts = function (keyword_1) {
    var args_1 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([keyword_1], args_1, true), void 0, function (keyword, genreId, // デフォルトは女性ファッション
    page, hits, forceRefresh) {
        var cacheKey, cachedData, params, response, _a, Items, count, pageCount, products, result, error_3;
        if (genreId === void 0) { genreId = 100371; }
        if (page === void 0) { page = 1; }
        if (hits === void 0) { hits = 30; }
        if (forceRefresh === void 0) { forceRefresh = false; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 6, , 7]);
                    cacheKey = "fashion_".concat(genreId, "_").concat(keyword || 'all', "_").concat(page, "_").concat(hits);
                    if (!!forceRefresh) return [3 /*break*/, 2];
                    return [4 /*yield*/, getFromCache(cacheKey)];
                case 1:
                    cachedData = _b.sent();
                    if (cachedData) {
                        console.log('Using cached Rakuten products data');
                        return [2 /*return*/, cachedData];
                    }
                    _b.label = 2;
                case 2:
                    params = {
                        applicationId: RAKUTEN_APP_ID,
                        affiliateId: RAKUTEN_AFFILIATE_ID,
                        genreId: genreId.toString(),
                        hits: hits,
                        page: page,
                        format: 'json',
                    };
                    // キーワードがあれば追加
                    if (keyword) {
                        params.keyword = keyword;
                    }
                    return [4 /*yield*/, axios_1.default.get('https://app.rakuten.co.jp/services/api/IchibaItem/Search/20170706', { params: params })];
                case 3:
                    response = _b.sent();
                    _a = response.data, Items = _a.Items, count = _a.count, pageCount = _a.pageCount;
                    if (!Items || Items.length === 0) {
                        return [2 /*return*/, {
                                products: [],
                                totalProducts: 0,
                                pageCount: 0,
                            }];
                    }
                    products = Items.map(function (item) {
                        var _a;
                        var product = item.Item;
                        return {
                            id: product.itemCode,
                            title: product.itemName,
                            price: product.itemPrice,
                            brand: product.shopName, // 楽天APIではshopNameが相当
                            imageUrl: ((_a = product.mediumImageUrls[0]) === null || _a === void 0 ? void 0 : _a.imageUrl.replace('?_ex=128x128', '?_ex=500x500')) || '',
                            description: product.itemCaption,
                            tags: extractTags(product.itemName, product.tagIds || []),
                            category: genreId.toString(),
                            affiliateUrl: product.affiliateUrl,
                            source: 'rakuten',
                            createdAt: new Date().toISOString(),
                        };
                    });
                    // 画像のプリフェッチ
                    return [4 /*yield*/, prefetchImages(products)];
                case 4:
                    // 画像のプリフェッチ
                    _b.sent();
                    result = {
                        products: products,
                        totalProducts: count,
                        pageCount: pageCount,
                    };
                    // 結果をキャッシュに保存
                    return [4 /*yield*/, saveToCache(cacheKey, result)];
                case 5:
                    // 結果をキャッシュに保存
                    _b.sent();
                    return [2 /*return*/, result];
                case 6:
                    error_3 = _b.sent();
                    console.error('Error fetching Rakuten products:', error_3);
                    throw error_3;
                case 7: return [2 /*return*/];
            }
        });
    });
};
exports.fetchRakutenFashionProducts = fetchRakutenFashionProducts;
/**
 * 特定のジャンルの商品を取得
 */
var fetchRakutenGenreProducts = function (genreId_1) {
    var args_1 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([genreId_1], args_1, true), void 0, function (genreId, page, hits) {
        var products, error_4;
        if (page === void 0) { page = 1; }
        if (hits === void 0) { hits = 30; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, exports.fetchRakutenFashionProducts)(undefined, genreId, page, hits)];
                case 1:
                    products = (_a.sent()).products;
                    return [2 /*return*/, products];
                case 2:
                    error_4 = _a.sent();
                    console.error("Error fetching genre ".concat(genreId, " products:"), error_4);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
};
exports.fetchRakutenGenreProducts = fetchRakutenGenreProducts;
/**
 * 関連商品（同じタグを持つ商品）を取得
 */
var fetchRelatedProducts = function (tags_1) {
    var args_1 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([tags_1], args_1, true), void 0, function (tags, excludeIds, limit) {
        var tagKeyword, products, filteredProducts, error_5;
        if (excludeIds === void 0) { excludeIds = []; }
        if (limit === void 0) { limit = 10; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    if (!tags || tags.length === 0) {
                        return [2 /*return*/, []];
                    }
                    tagKeyword = tags.slice(0, 2).join(' ');
                    return [4 /*yield*/, (0, exports.fetchRakutenFashionProducts)(tagKeyword, undefined, 1, limit * 2 // 多めに取得して除外IDをフィルタリング
                        )];
                case 1:
                    products = (_a.sent()).products;
                    filteredProducts = products.filter(function (product) { return !excludeIds.includes(product.id); }).slice(0, limit);
                    return [2 /*return*/, filteredProducts];
                case 2:
                    error_5 = _a.sent();
                    console.error('Error fetching related products:', error_5);
                    return [2 /*return*/, []];
                case 3: return [2 /*return*/];
            }
        });
    });
};
exports.fetchRelatedProducts = fetchRelatedProducts;
/**
 * 商品名やタグからタグ情報を抽出
 */
var extractTags = function (itemName, tagIds) {
    var tags = [];
    // タグIDからジャンル名を推測（本来はAPIでジャンル名を取得するべき）
    if (tagIds.includes(100371)) {
        tags.push('レディース');
    }
    if (tagIds.includes(551177)) {
        tags.push('メンズ');
    }
    // 商品名から特徴を抽出
    var keywordMap = {
        'シャツ': 'シャツ',
        'ブラウス': 'ブラウス',
        'Tシャツ': 'Tシャツ',
        'カットソー': 'カットソー',
        'ワンピース': 'ワンピース',
        'スカート': 'スカート',
        'パンツ': 'パンツ',
        'デニム': 'デニム',
        'ジーンズ': 'ジーンズ',
        'ジャケット': 'ジャケット',
        'コート': 'コート',
        'セーター': 'セーター',
        'ニット': 'ニット',
        'カジュアル': 'カジュアル',
        'フォーマル': 'フォーマル',
        '春': '春',
        '夏': '夏',
        '秋': '秋',
        '冬': '冬',
        'オフィス': 'オフィス',
        'デート': 'デート',
    };
    // 商品名から特徴を抽出
    Object.entries(keywordMap).forEach(function (_a) {
        var keyword = _a[0], tag = _a[1];
        if (itemName.includes(keyword) && !tags.includes(tag)) {
            tags.push(tag);
        }
    });
    return tags;
};
/**
 * 画像をプリフェッチ
 */
var prefetchImages = function (products) { return __awaiter(void 0, void 0, void 0, function () {
    var prefetchPromises, error_6;
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
                error_6 = _a.sent();
                console.error('Error prefetching images:', error_6);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * キャッシュをクリア
 */
var clearRakutenCache = function () { return __awaiter(void 0, void 0, void 0, function () {
    var keys, rakutenCacheKeys, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                return [4 /*yield*/, async_storage_1.default.getAllKeys()];
            case 1:
                keys = _a.sent();
                rakutenCacheKeys = keys.filter(function (key) {
                    return key.startsWith(RAKUTEN_CACHE_KEY_PREFIX);
                });
                if (!(rakutenCacheKeys.length > 0)) return [3 /*break*/, 3];
                return [4 /*yield*/, async_storage_1.default.multiRemove(rakutenCacheKeys)];
            case 2:
                _a.sent();
                console.log("Cleared ".concat(rakutenCacheKeys.length, " Rakuten cache items"));
                _a.label = 3;
            case 3: return [3 /*break*/, 5];
            case 4:
                error_7 = _a.sent();
                console.error('Error clearing Rakuten cache:', error_7);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.clearRakutenCache = clearRakutenCache;
