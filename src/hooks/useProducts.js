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
exports.useProducts = void 0;
var react_1 = require("react");
var productService_1 = require("@/services/productService");
var useAuth_1 = require("@/hooks/useAuth");
var swipeService_1 = require("@/services/swipeService");
/**
 * 商品データとスワイプ管理のためのカスタムフック
 */
var useProducts = function () {
    var user = (0, useAuth_1.useAuth)().user;
    var _a = (0, react_1.useState)({
        products: [],
        hasMore: true,
        totalFetched: 0
    }), productsData = _a[0], setProductsData = _a[1];
    var _b = (0, react_1.useState)(0), currentIndex = _b[0], setCurrentIndex = _b[1];
    var _c = (0, react_1.useState)(true), isLoading = _c[0], setIsLoading = _c[1];
    var _d = (0, react_1.useState)(null), error = _d[0], setError = _d[1];
    var _e = (0, react_1.useState)(0), page = _e[0], setPage = _e[1];
    var _f = (0, react_1.useState)(false), refreshing = _f[0], setRefreshing = _f[1];
    var pageSize = 10;
    // 現在表示中の商品
    var currentProduct = productsData.products[currentIndex];
    // 商品データを取得
    var loadProducts = (0, react_1.useCallback)(function () {
        var args_1 = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args_1[_i] = arguments[_i];
        }
        return __awaiter(void 0, __spreadArray([], args_1, true), void 0, function (reset) {
            var swipedProductIds_1, swipeHistory, err_1, newProducts, filteredProducts_1, hasMoreProducts_1, err_2;
            if (reset === void 0) { reset = false; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 6, 7, 8]);
                        if (reset) {
                            setIsLoading(true);
                            setCurrentIndex(0);
                            setPage(0);
                            setProductsData({
                                products: [],
                                hasMore: true,
                                totalFetched: 0
                            });
                            setError(null);
                        }
                        else if (!productsData.hasMore) {
                            return [2 /*return*/];
                        }
                        // ローディング状態を管理
                        setIsLoading(function (prevState) { return reset ? true : prevState; });
                        swipedProductIds_1 = [];
                        if (!user) return [3 /*break*/, 4];
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, (0, swipeService_1.getSwipeHistory)(user.id)];
                    case 2:
                        swipeHistory = _a.sent();
                        swipedProductIds_1 = swipeHistory.map(function (swipe) { return swipe.productId; });
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        console.error('Error fetching swipe history:', err_1);
                        return [3 /*break*/, 4];
                    case 4: return [4 /*yield*/, (0, productService_1.fetchProducts)(pageSize, page * pageSize)];
                    case 5:
                        newProducts = _a.sent();
                        filteredProducts_1 = Array.isArray(newProducts) ? newProducts.filter(function (product) { return !swipedProductIds_1.includes(product.id); }) : [];
                        // 結果が十分でない場合の処理
                        if (filteredProducts_1.length === 0 && (Array.isArray(newProducts) ? newProducts.length > 0 : false)) {
                            // スワイプ済みを除外した結果、商品がない場合は次のページを試みる
                            setPage(function (prevPage) { return prevPage + 1; });
                            if (!reset) {
                                loadProducts(false);
                            }
                            return [2 /*return*/];
                        }
                        hasMoreProducts_1 = Array.isArray(newProducts) ? newProducts.length >= pageSize : false;
                        // 商品データを更新
                        setProductsData(function (prev) {
                            var updatedProducts = reset
                                ? filteredProducts_1
                                : __spreadArray(__spreadArray([], prev.products, true), filteredProducts_1.filter(function (p) { return !prev.products.some(function (existing) { return existing.id === p.id; }); }), true);
                            return {
                                products: updatedProducts,
                                hasMore: hasMoreProducts_1,
                                totalFetched: prev.totalFetched + filteredProducts_1.length
                            };
                        });
                        return [3 /*break*/, 8];
                    case 6:
                        err_2 = _a.sent();
                        setError('商品データの読み込みに失敗しました。');
                        console.error('Error loading products:', err_2);
                        return [3 /*break*/, 8];
                    case 7:
                        setIsLoading(false);
                        setRefreshing(false);
                        return [7 /*endfinally*/];
                    case 8: return [2 /*return*/];
                }
            });
        });
    }, [user, page, pageSize, productsData.hasMore]);
    // 初回マウント時に商品データを取得
    (0, react_1.useEffect)(function () {
        loadProducts(true);
    }, [loadProducts]);
    // 追加データ読み込み
    var loadMore = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (isLoading || !productsData.hasMore)
                        return [2 /*return*/];
                    setPage(function (prevPage) { return prevPage + 1; });
                    return [4 /*yield*/, loadProducts(false)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [isLoading, productsData.hasMore, loadProducts]);
    // データリセット
    var resetProducts = (0, react_1.useCallback)(function () {
        loadProducts(true);
    }, [loadProducts]);
    // データ更新（引っ張り更新など）
    var refreshProducts = (0, react_1.useCallback)(function () { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    setRefreshing(true);
                    return [4 /*yield*/, loadProducts(true)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }, [loadProducts]);
    // スワイプハンドラー
    var handleSwipe = (0, react_1.useCallback)(function (product, direction) {
        // 次の商品へ
        setCurrentIndex(function (prevIndex) {
            var nextIndex = prevIndex + 1;
            // 残りの商品が少なくなったら追加ロード
            if (productsData.products.length - nextIndex <= 5 && productsData.hasMore && !isLoading) {
                loadMore();
            }
            return nextIndex;
        });
    }, [productsData.products.length, productsData.hasMore, isLoading, loadMore]);
    return {
        products: productsData.products,
        currentIndex: currentIndex,
        currentProduct: currentProduct,
        isLoading: isLoading,
        error: error,
        loadMore: loadMore,
        resetProducts: resetProducts,
        refreshProducts: refreshProducts,
        handleSwipe: handleSwipe,
        hasMore: productsData.hasMore,
        totalFetched: productsData.totalFetched
    };
};
exports.useProducts = useProducts;
