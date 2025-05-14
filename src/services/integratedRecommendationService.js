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
exports.getOutfitRecommendations = exports.getEnhancedCategoryRecommendations = exports.getEnhancedRecommendations = void 0;
var recommendationService_1 = require("./recommendationService");
var rakutenService_1 = require("./rakutenService");
var recommendationService_2 = require("./recommendationService");
/**
 * 複数ソースから統合的なレコメンド結果を取得
 * 内部DB + 楽天API
 */
var getEnhancedRecommendations = function (userId_1) {
    var args_1 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([userId_1], args_1, true), void 0, function (userId, limit, excludeIds) {
        var _a, internalRecs, externalRecs, userPrefs, forYouProducts, additionalProducts, error_1;
        if (limit === void 0) { limit = 20; }
        if (excludeIds === void 0) { excludeIds = []; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 6, , 7]);
                    return [4 /*yield*/, Promise.all([
                            // 内部DBからの推薦
                            (0, recommendationService_1.getRecommendedProducts)(userId, Math.floor(limit / 2), excludeIds),
                            // 楽天APIからの商品取得（トレンド）
                            (0, rakutenService_1.fetchRakutenFashionProducts)(undefined, 100371, 1, Math.floor(limit / 2)),
                            // ユーザーの好み分析
                            (0, recommendationService_2.analyzeUserPreferences)(userId)
                        ])];
                case 1:
                    _a = _b.sent(), internalRecs = _a[0], externalRecs = _a[1], userPrefs = _a[2];
                    forYouProducts = [];
                    if (!(userPrefs && userPrefs.topTags && userPrefs.topTags.length > 0)) return [3 /*break*/, 3];
                    return [4 /*yield*/, (0, rakutenService_1.fetchRelatedProducts)(userPrefs.topTags, excludeIds, Math.floor(limit / 2))];
                case 2:
                    // タグベースで関連商品を取得
                    forYouProducts = _b.sent();
                    _b.label = 3;
                case 3:
                    if (!(forYouProducts.length < Math.floor(limit / 4))) return [3 /*break*/, 5];
                    return [4 /*yield*/, (0, rakutenService_1.fetchRakutenFashionProducts)('おすすめ', 100371, 1, Math.floor(limit / 4))];
                case 4:
                    additionalProducts = _b.sent();
                    forYouProducts = __spreadArray(__spreadArray([], forYouProducts, true), additionalProducts.products, true).slice(0, Math.floor(limit / 2));
                    _b.label = 5;
                case 5: return [2 /*return*/, {
                        recommended: internalRecs,
                        trending: externalRecs.products || [],
                        forYou: forYouProducts,
                        isLoading: false
                    }];
                case 6:
                    error_1 = _b.sent();
                    console.error('Error getting enhanced recommendations:', error_1);
                    // エラー時は部分的な結果でも返す
                    return [2 /*return*/, {
                            recommended: [],
                            trending: [],
                            forYou: [],
                            isLoading: false
                        }];
                case 7: return [2 /*return*/];
            }
        });
    });
};
exports.getEnhancedRecommendations = getEnhancedRecommendations;
/**
 * カテゴリ別のマルチソースレコメンド
 * 内部DB + 楽天API
 */
var getEnhancedCategoryRecommendations = function (userId_1) {
    var args_1 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([userId_1], args_1, true), void 0, function (userId, categories, limit) {
        var internalRecs, categoryMappings_1, externalRecsPromises, externalRecsResults, externalRecs_1, error_2;
        if (categories === void 0) { categories = ['tops', 'bottoms', 'outerwear', 'accessories']; }
        if (limit === void 0) { limit = 5; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, (0, recommendationService_1.getRecommendationsByCategory)(userId, categories, limit)];
                case 1:
                    internalRecs = _a.sent();
                    categoryMappings_1 = {
                        'tops': 100371, // レディーストップス（例）
                        'bottoms': 565990, // レディースボトムス（例）
                        'outerwear': 566092, // レディースアウター（例）
                        'accessories': 215783, // アクセサリー（例）
                    };
                    externalRecsPromises = categories.map(function (category) { return __awaiter(void 0, void 0, void 0, function () {
                        var genreId, products, error_3;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    genreId = categoryMappings_1[category] || 100371;
                                    _a.label = 1;
                                case 1:
                                    _a.trys.push([1, 3, , 4]);
                                    return [4 /*yield*/, (0, rakutenService_1.fetchRakutenFashionProducts)(category, // カテゴリ名をキーワードとして使用
                                        genreId, 1, limit)];
                                case 2:
                                    products = (_a.sent()).products;
                                    return [2 /*return*/, { category: category, products: products }];
                                case 3:
                                    error_3 = _a.sent();
                                    console.error("Error fetching external products for category ".concat(category, ":"), error_3);
                                    return [2 /*return*/, { category: category, products: [] }];
                                case 4: return [2 /*return*/];
                            }
                        });
                    }); });
                    return [4 /*yield*/, Promise.all(externalRecsPromises)];
                case 2:
                    externalRecsResults = _a.sent();
                    externalRecs_1 = {};
                    externalRecsResults.forEach(function (_a) {
                        var category = _a.category, products = _a.products;
                        externalRecs_1[category] = products;
                    });
                    return [2 /*return*/, {
                            internalRecs: internalRecs,
                            externalRecs: externalRecs_1,
                            isLoading: false
                        }];
                case 3:
                    error_2 = _a.sent();
                    console.error('Error getting enhanced category recommendations:', error_2);
                    return [2 /*return*/, {
                            internalRecs: {},
                            externalRecs: {},
                            isLoading: false
                        }];
                case 4: return [2 /*return*/];
            }
        });
    });
};
exports.getEnhancedCategoryRecommendations = getEnhancedCategoryRecommendations;
/**
 * コーディネート提案
 * 上下アイテムの組み合わせを提案
 */
var getOutfitRecommendations = function (userId_1) {
    var args_1 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([userId_1], args_1, true), void 0, function (userId, limit) {
        var _a, internalRecs, externalRecs, tops, bottoms, outerwear, accessories, outfits, i, outfit, error_4;
        if (limit === void 0) { limit = 5; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 2, , 3]);
                    return [4 /*yield*/, (0, exports.getEnhancedCategoryRecommendations)(userId, ['tops', 'bottoms', 'outerwear', 'accessories'], limit * 2 // 組み合わせの多様性を確保するため多めに取得
                        )];
                case 1:
                    _a = _b.sent(), internalRecs = _a.internalRecs, externalRecs = _a.externalRecs;
                    tops = __spreadArray(__spreadArray([], (internalRecs['tops'] || []), true), (externalRecs['tops'] || []), true);
                    bottoms = __spreadArray(__spreadArray([], (internalRecs['bottoms'] || []), true), (externalRecs['bottoms'] || []), true);
                    outerwear = __spreadArray(__spreadArray([], (internalRecs['outerwear'] || []), true), (externalRecs['outerwear'] || []), true);
                    accessories = __spreadArray(__spreadArray([], (internalRecs['accessories'] || []), true), (externalRecs['accessories'] || []), true);
                    outfits = [];
                    for (i = 0; i < limit; i++) {
                        outfit = {
                            top: tops[i % tops.length] || null,
                            bottom: bottoms[i % bottoms.length] || null,
                            outerwear: i % 2 === 0 ? outerwear[i % outerwear.length] || null : null, // 半分のコーデのみアウターを追加
                            accessories: i % 3 === 0 ? accessories[i % accessories.length] || null : null, // 1/3のコーデにアクセサリー
                        };
                        // 最低限トップスまたはボトムスがあるものだけ追加
                        if (outfit.top || outfit.bottom) {
                            outfits.push(outfit);
                        }
                    }
                    return [2 /*return*/, { outfits: outfits }];
                case 2:
                    error_4 = _b.sent();
                    console.error('Error getting outfit recommendations:', error_4);
                    return [2 /*return*/, { outfits: [] }];
                case 3: return [2 /*return*/];
            }
        });
    });
};
exports.getOutfitRecommendations = getOutfitRecommendations;
