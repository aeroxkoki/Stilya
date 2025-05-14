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
exports.fetchAllAffiliateProducts = exports.saveProductsToSupabase = exports.searchRakutenProducts = exports.searchLinkShareProducts = void 0;
var api_1 = require("@/utils/api");
var env_1 = require("@/utils/env");
var supabase_1 = require("./supabase");
// LinkShare APIのエンドポイント
var LINKSHARE_ENDPOINT = 'https://api.linksynergy.com/search/product';
// 楽天アフィリエイトAPIのエンドポイント
var RAKUTEN_ENDPOINT = 'https://app.rakuten.co.jp/services/api/IchibaItem/Search/20220601';
// LinkShareからアパレル商品検索
var searchLinkShareProducts = function () {
    var args_1 = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args_1[_i] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (keyword, category, limit, page) {
        var params, queryParams, response, error_1;
        if (keyword === void 0) { keyword = ''; }
        if (category === void 0) { category = 'apparel'; }
        if (limit === void 0) { limit = 20; }
        if (page === void 0) { page = 1; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    // サンプルとテスト用にモック応答を返す（開発時のみ）
                    if (__DEV__ && !env_1.LINKSHARE_API_TOKEN) {
                        console.warn('Using mock LinkShare response due to missing API token');
                        return [2 /*return*/, getMockLinkShareProducts(limit)];
                    }
                    params = {
                        token: env_1.LINKSHARE_API_TOKEN,
                        keyword: keyword,
                        cat: category,
                        max: limit,
                        pagenumber: page,
                    };
                    queryParams = Object.entries(params)
                        .filter(function (_a) {
                        var _ = _a[0], value = _a[1];
                        return value;
                    })
                        .map(function (_a) {
                        var key = _a[0], value = _a[1];
                        return "".concat(key, "=").concat(encodeURIComponent(String(value)));
                    })
                        .join('&');
                    return [4 /*yield*/, (0, api_1.apiGet)("".concat(LINKSHARE_ENDPOINT, "?").concat(queryParams))];
                case 1:
                    response = _a.sent();
                    // LinkShare商品データをアプリの商品型に変換
                    return [2 /*return*/, response.products.map(function (item) {
                            var _a;
                            return ({
                                id: item.productId,
                                title: item.productName,
                                imageUrl: item.imageUrl,
                                brand: item.merchantName,
                                price: parseFloat(item.price),
                                category: item.category,
                                tags: ((_a = item.keywords) === null || _a === void 0 ? void 0 : _a.split(',').map(function (tag) { return tag.trim(); })) || [],
                                affiliateUrl: item.productUrl,
                                source: 'LinkShare',
                                createdAt: new Date().toISOString(),
                            });
                        })];
                case 2:
                    error_1 = _a.sent();
                    console.error('Error searching LinkShare products:', error_1);
                    // 開発時はモックデータを返す
                    if (__DEV__) {
                        console.warn('Using mock LinkShare data due to API error');
                        return [2 /*return*/, getMockLinkShareProducts(limit)];
                    }
                    throw error_1;
                case 3: return [2 /*return*/];
            }
        });
    });
};
exports.searchLinkShareProducts = searchLinkShareProducts;
// 楽天アフィリエイトAPI商品検索
var searchRakutenProducts = function () {
    var args_1 = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args_1[_i] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (keyword, category, limit, page) {
        var params, queryParams, response, error_2;
        if (keyword === void 0) { keyword = ''; }
        if (category === void 0) { category = ''; }
        if (limit === void 0) { limit = 20; }
        if (page === void 0) { page = 1; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    // サンプルとテスト用にモック応答を返す（開発時のみ）
                    if (__DEV__ && !env_1.RAKUTEN_APP_ID) {
                        console.warn('Using mock Rakuten response due to missing API ID');
                        return [2 /*return*/, getMockRakutenProducts(limit)];
                    }
                    params = {
                        applicationId: env_1.RAKUTEN_APP_ID,
                        affiliateId: env_1.RAKUTEN_AFFILIATE_ID,
                        keyword: keyword,
                        genreId: category,
                        hits: limit,
                        page: page,
                        format: 'json',
                    };
                    queryParams = Object.entries(params)
                        .filter(function (_a) {
                        var _ = _a[0], value = _a[1];
                        return value;
                    })
                        .map(function (_a) {
                        var key = _a[0], value = _a[1];
                        return "".concat(key, "=").concat(encodeURIComponent(String(value)));
                    })
                        .join('&');
                    return [4 /*yield*/, (0, api_1.apiGet)("".concat(RAKUTEN_ENDPOINT, "?").concat(queryParams))];
                case 1:
                    response = _a.sent();
                    // 楽天商品データをアプリの商品型に変換
                    return [2 /*return*/, response.Items.map(function (item) {
                            var _a;
                            var product = item.Item;
                            return {
                                id: product.itemCode,
                                title: product.itemName,
                                imageUrl: ((_a = product.mediumImageUrls[0]) === null || _a === void 0 ? void 0 : _a.imageUrl) || '',
                                brand: product.shopName,
                                price: product.itemPrice,
                                category: product.categoryId,
                                tags: product.tagIds || [],
                                affiliateUrl: product.itemUrl,
                                source: 'Rakuten',
                                createdAt: new Date().toISOString(),
                            };
                        })];
                case 2:
                    error_2 = _a.sent();
                    console.error('Error searching Rakuten products:', error_2);
                    // 開発時はモックデータを返す
                    if (__DEV__) {
                        console.warn('Using mock Rakuten data due to API error');
                        return [2 /*return*/, getMockRakutenProducts(limit)];
                    }
                    throw error_2;
                case 3: return [2 /*return*/];
            }
        });
    });
};
exports.searchRakutenProducts = searchRakutenProducts;
// アフィリエイト商品をSupabaseに保存
var saveProductsToSupabase = function (products) { return __awaiter(void 0, void 0, void 0, function () {
    var supabaseProducts, error, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                supabaseProducts = products.map(function (product) { return ({
                    id: product.id,
                    title: product.title,
                    image_url: product.imageUrl,
                    brand: product.brand,
                    price: product.price,
                    tags: product.tags || [],
                    category: product.category || '',
                    affiliate_url: product.affiliateUrl,
                    source: product.source,
                    created_at: new Date().toISOString(),
                }); });
                return [4 /*yield*/, supabase_1.supabase
                        .from('products')
                        .upsert(supabaseProducts, { onConflict: 'id' })];
            case 1:
                error = (_a.sent()).error;
                if (error)
                    throw error;
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('Error saving products to Supabase:', error_3);
                throw error_3;
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.saveProductsToSupabase = saveProductsToSupabase;
// LinkShareモックデータの生成 (開発とテスト用)
var getMockLinkShareProducts = function (count) {
    var brands = ['ZARA', 'H&M', 'UNIQLO', 'GAP', 'MUJI', 'adidas', 'NIKE'];
    var categories = ['トップス', 'ボトムス', 'アウター', 'シューズ', 'バッグ'];
    var products = [];
    for (var i = 0; i < count; i++) {
        var brand = brands[Math.floor(Math.random() * brands.length)];
        var category = categories[Math.floor(Math.random() * categories.length)];
        var price = Math.floor(Math.random() * 10000) + 1000;
        products.push({
            id: "ls-".concat(i, "-").concat(Date.now()),
            title: "".concat(brand, " \u30B5\u30F3\u30D7\u30EB").concat(category, " ").concat(i),
            imageUrl: "https://picsum.photos/400/600?random=".concat(i),
            brand: brand,
            price: price,
            category: category,
            tags: [category, brand, 'サンプル'],
            affiliateUrl: "https://example.com/affiliate/".concat(i),
            source: 'LinkShare (Mock)',
            createdAt: new Date().toISOString(),
        });
    }
    return products;
};
// 楽天モックデータの生成 (開発とテスト用)
var getMockRakutenProducts = function (count) {
    var brands = ['ユニクロ', 'GU', 'ビームス', 'ユナイテッドアローズ', 'ナノユニバース'];
    var categories = ['シャツ', 'パンツ', 'ジャケット', 'スニーカー', 'アクセサリー'];
    var products = [];
    for (var i = 0; i < count; i++) {
        var brand = brands[Math.floor(Math.random() * brands.length)];
        var category = categories[Math.floor(Math.random() * categories.length)];
        var price = Math.floor(Math.random() * 10000) + 1000;
        products.push({
            id: "rk-".concat(i, "-").concat(Date.now()),
            title: "".concat(brand, " \u30B5\u30F3\u30D7\u30EB").concat(category, " ").concat(i),
            imageUrl: "https://picsum.photos/400/600?random=".concat(i + 100),
            brand: brand,
            price: price,
            category: category,
            tags: [category, brand, 'サンプル'],
            affiliateUrl: "https://example.com/rakuten/".concat(i),
            source: 'Rakuten (Mock)',
            createdAt: new Date().toISOString(),
        });
    }
    return products;
};
// すべてのソースから商品を取得して結合（開発時に使用）
var fetchAllAffiliateProducts = function () {
    var args_1 = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args_1[_i] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (keyword, limit) {
        var _a, linkShareProducts, rakutenProducts, error_4, mockProducts;
        if (keyword === void 0) { keyword = ''; }
        if (limit === void 0) { limit = 20; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, Promise.all([
                            (0, exports.searchLinkShareProducts)(keyword, 'apparel', limit / 2),
                            (0, exports.searchRakutenProducts)(keyword, '', limit / 2),
                        ])];
                case 1:
                    _a = _b.sent(), linkShareProducts = _a[0], rakutenProducts = _a[1];
                    // 結果を結合
                    return [2 /*return*/, __spreadArray(__spreadArray([], linkShareProducts, true), rakutenProducts, true)];
                case 2:
                    error_4 = _b.sent();
                    console.error('Error fetching all affiliate products:', error_4);
                    // 開発時はモックデータを返す
                    if (__DEV__) {
                        mockProducts = __spreadArray(__spreadArray([], getMockLinkShareProducts(limit / 2), true), getMockRakutenProducts(limit / 2), true);
                        return [2 /*return*/, mockProducts];
                    }
                    throw error_4;
                case 3: return [2 /*return*/];
            }
        });
    });
};
exports.fetchAllAffiliateProducts = fetchAllAffiliateProducts;
