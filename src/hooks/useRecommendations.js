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
exports.useRecommendations = void 0;
var react_1 = require("react");
var useAuth_1 = require("@/hooks/useAuth");
var recommendationService_1 = require("@/services/recommendationService");
var swipeService_1 = require("@/services/swipeService");
/**
 * レコメンデーション機能用のカスタムフック（最適化版）
 * キャッシュ機能、バッチ処理などのパフォーマンス最適化を追加
 */
var useRecommendations = function (limit, categories) {
    if (limit === void 0) { limit = 20; }
    if (categories === void 0) { categories = ['tops', 'bottoms', 'outerwear', 'accessories']; }
    var user = (0, useAuth_1.useAuth)().user;
    var _a = (0, react_1.useState)([]), recommendations = _a[0], setRecommendations = _a[1];
    var _b = (0, react_1.useState)({}), categoryRecommendations = _b[0], setCategoryRecommendations = _b[1];
    var _c = (0, react_1.useState)(null), userPreference = _c[0], setUserPreference = _c[1];
    var _d = (0, react_1.useState)(true), isLoading = _d[0], setIsLoading = _d[1];
    var _e = (0, react_1.useState)(null), error = _e[0], setError = _e[1];
    // ローディング中のフラグ（並行リクエスト防止）
    var isLoadingRef = (0, react_1.useRef)(false);
    /**
     * ユーザー好みの分析とレコメンデーション取得
     * @param skipCache キャッシュをスキップする場合はtrue
     */
    var loadRecommendations = (0, react_1.useCallback)(function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (skipCache) {
            var swipeHistory, swipedProductIds, _a, preferences, recs, catRecs, err_1;
            if (skipCache === void 0) { skipCache = false; }
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!user) {
                            setError('ユーザー情報が取得できません。ログインしてください。');
                            setIsLoading(false);
                            return [2 /*return*/];
                        }
                        // すでにローディング中なら処理をスキップ（連打防止）
                        if (isLoadingRef.current) {
                            console.log('Already loading recommendations, request ignored');
                            return [2 /*return*/];
                        }
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 4, 5, 6]);
                        setIsLoading(true);
                        setError(null);
                        isLoadingRef.current = true;
                        return [4 /*yield*/, (0, swipeService_1.getSwipeHistory)(user.id)];
                    case 2:
                        swipeHistory = _b.sent();
                        swipedProductIds = swipeHistory.map(function (swipe) { return swipe.productId; });
                        return [4 /*yield*/, Promise.all([
                                // ユーザーの好みを分析
                                (0, recommendationService_1.analyzeUserPreferences)(user.id, skipCache),
                                // 全体のレコメンデーション取得
                                (0, recommendationService_1.getRecommendedProducts)(user.id, limit, swipedProductIds, skipCache),
                                // カテゴリ別レコメンデーション取得
                                (0, recommendationService_1.getRecommendationsByCategory)(user.id, categories, 5, skipCache)
                            ])];
                    case 3:
                        _a = _b.sent(), preferences = _a[0], recs = _a[1], catRecs = _a[2];
                        // ステート更新
                        setUserPreference(preferences);
                        setRecommendations(recs);
                        setCategoryRecommendations(catRecs);
                        return [3 /*break*/, 6];
                    case 4:
                        err_1 = _b.sent();
                        console.error('Error loading recommendations:', err_1);
                        setError('おすすめ商品の読み込みに失敗しました。');
                        return [3 /*break*/, 6];
                    case 5:
                        setIsLoading(false);
                        isLoadingRef.current = false;
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    }, [user, limit, categories]);
    // 初回レンダリング時にレコメンデーションを読み込む
    (0, react_1.useEffect)(function () {
        if (user) {
            loadRecommendations();
        }
    }, [loadRecommendations, user]);
    // キャッシュをスキップして更新する場合のフラグ付き更新関数
    var refreshRecommendations = (0, react_1.useCallback)(function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (skipCache) {
            if (skipCache === void 0) { skipCache = true; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, loadRecommendations(skipCache)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    }, [loadRecommendations]);
    // キャッシュをクリアする関数
    var clearCache = (0, react_1.useCallback)(function () {
        (0, recommendationService_1.clearRecommendationCaches)();
    }, []);
    /**
     * フィルターを適用してレコメンデーション商品を絞り込む
     * キャッシュなし - 毎回新しく計算（UIの即時反応のため）
     */
    var getFilteredRecommendations = (0, react_1.useCallback)(function (filters) {
        // すべての商品を集める（重複排除済み）
        var allProductsMap = new Map();
        // メインのレコメンデーション商品を追加
        recommendations.forEach(function (product) {
            allProductsMap.set(product.id, product);
        });
        // カテゴリ別商品も追加
        Object.values(categoryRecommendations).forEach(function (products) {
            products.forEach(function (product) {
                if (!allProductsMap.has(product.id)) {
                    allProductsMap.set(product.id, product);
                }
            });
        });
        // Map から配列へ変換
        var allProducts = Array.from(allProductsMap.values());
        // フィルタリング適用
        return allProducts.filter(function (product) {
            // カテゴリフィルター
            if (filters.categories.length > 0 && product.category) {
                if (!filters.categories.includes(product.category)) {
                    return false;
                }
            }
            // 価格フィルター
            if (product.price < filters.priceRange[0] || product.price > filters.priceRange[1]) {
                return false;
            }
            // タグフィルター
            if (filters.selectedTags.length > 0 && product.tags) {
                // いずれかのタグが含まれていればOK
                var hasAnyTag = filters.selectedTags.some(function (tag) { var _a; return (_a = product.tags) === null || _a === void 0 ? void 0 : _a.includes(tag); });
                if (!hasAnyTag) {
                    return false;
                }
            }
            return true;
        });
    }, [recommendations, categoryRecommendations]);
    return {
        recommendations: recommendations,
        categoryRecommendations: categoryRecommendations,
        userPreference: userPreference,
        isLoading: isLoading,
        error: error,
        refreshRecommendations: refreshRecommendations,
        getFilteredRecommendations: getFilteredRecommendations,
        clearCache: clearCache
    };
};
exports.useRecommendations = useRecommendations;
