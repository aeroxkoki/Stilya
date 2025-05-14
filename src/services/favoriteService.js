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
exports.clearFavoriteCache = exports.toggleFavorite = exports.isFavorite = exports.getFavorites = void 0;
var supabase_1 = require("./supabase");
var mockProducts_1 = require("@/mocks/mockProducts");
// モック使用フラグ
var USE_MOCK = true; // 本番環境では必ず false にすること
var favoriteCache = {};
// キャッシュタイムアウト (1時間)
var CACHE_TIMEOUT = 60 * 60 * 1000;
/**
 * ユーザーのお気に入り商品一覧を取得する
 */
var getFavorites = function (userId) { return __awaiter(void 0, void 0, void 0, function () {
    var favorites, _a, data, error, favoriteIds, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                // キャッシュチェック
                if (favoriteCache[userId] &&
                    Date.now() - favoriteCache[userId].timestamp < CACHE_TIMEOUT) {
                    return [2 /*return*/, favoriteCache[userId].favorites];
                }
                if (USE_MOCK || __DEV__) {
                    // 開発用：ランダムなお気に入りを生成
                    console.log('Using mock favorites data');
                    favorites = mockProducts_1.mockProducts
                        .slice(0, 5) // 最初の5つだけを選択
                        .map(function (product) { return product.id; });
                    // キャッシュ更新
                    favoriteCache[userId] = {
                        favorites: favorites,
                        timestamp: Date.now(),
                    };
                    return [2 /*return*/, favorites];
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from('favorites')
                        .select('product_id')
                        .eq('user_id', userId)];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error) {
                    console.error('Error fetching favorites:', error);
                    throw new Error(error.message);
                }
                favoriteIds = data.map(function (item) { return item.product_id; });
                // キャッシュ更新
                favoriteCache[userId] = {
                    favorites: favoriteIds,
                    timestamp: Date.now(),
                };
                return [2 /*return*/, favoriteIds];
            case 2:
                error_1 = _b.sent();
                console.error('Unexpected error in getFavorites:', error_1);
                // エラー時は空配列を返す
                return [2 /*return*/, []];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getFavorites = getFavorites;
/**
 * 商品がお気に入りに入っているか確認する
 */
var isFavorite = function (userId, productId) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, data, error, error_2;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                // キャッシュチェック
                if (favoriteCache[userId] &&
                    Date.now() - favoriteCache[userId].timestamp < CACHE_TIMEOUT) {
                    return [2 /*return*/, favoriteCache[userId].favorites.includes(productId)];
                }
                if (USE_MOCK || __DEV__) {
                    // 開発用：ランダムにお気に入りを判定
                    return [2 /*return*/, Math.random() > 0.7]; // 30%の確率でお気に入り済みとする
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from('favorites')
                        .select('id')
                        .eq('user_id', userId)
                        .eq('product_id', productId)
                        .single()];
            case 1:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error && error.code !== 'PGRST116') { // PGRST116: ノーデータ時のエラー
                    console.error('Error checking favorite status:', error);
                    return [2 /*return*/, false];
                }
                return [2 /*return*/, !!data];
            case 2:
                error_2 = _b.sent();
                console.error('Unexpected error in isFavorite:', error_2);
                return [2 /*return*/, false];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.isFavorite = isFavorite;
/**
 * お気に入りに追加/削除を切り替える
 */
var toggleFavorite = function (userId, productId) { return __awaiter(void 0, void 0, void 0, function () {
    var isCurrentlyFavorite, error, error, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 6, , 7]);
                return [4 /*yield*/, (0, exports.isFavorite)(userId, productId)];
            case 1:
                isCurrentlyFavorite = _a.sent();
                if (USE_MOCK || __DEV__) {
                    console.log("Mock: ".concat(isCurrentlyFavorite ? 'Removing' : 'Adding', " product ").concat(productId, " ").concat(isCurrentlyFavorite ? 'from' : 'to', " favorites"));
                    // キャッシュを更新
                    if (favoriteCache[userId]) {
                        if (isCurrentlyFavorite) {
                            // 削除
                            favoriteCache[userId] = {
                                favorites: favoriteCache[userId].favorites.filter(function (id) { return id !== productId; }),
                                timestamp: Date.now(),
                            };
                        }
                        else {
                            // 追加
                            favoriteCache[userId] = {
                                favorites: __spreadArray(__spreadArray([], favoriteCache[userId].favorites, true), [productId], false),
                                timestamp: Date.now(),
                            };
                        }
                    }
                    else {
                        // 新規作成
                        favoriteCache[userId] = {
                            favorites: [productId],
                            timestamp: Date.now(),
                        };
                    }
                    return [2 /*return*/, !isCurrentlyFavorite];
                }
                if (!isCurrentlyFavorite) return [3 /*break*/, 3];
                return [4 /*yield*/, supabase_1.supabase
                        .from('favorites')
                        .delete()
                        .match({ user_id: userId, product_id: productId })];
            case 2:
                error = (_a.sent()).error;
                if (error) {
                    console.error('Error removing favorite:', error);
                    throw new Error(error.message);
                }
                // キャッシュ更新
                if (favoriteCache[userId]) {
                    favoriteCache[userId] = {
                        favorites: favoriteCache[userId].favorites.filter(function (id) { return id !== productId; }),
                        timestamp: Date.now(),
                    };
                }
                return [2 /*return*/, false];
            case 3: return [4 /*yield*/, supabase_1.supabase
                    .from('favorites')
                    .insert({
                    user_id: userId,
                    product_id: productId,
                })];
            case 4:
                error = (_a.sent()).error;
                if (error) {
                    console.error('Error adding favorite:', error);
                    throw new Error(error.message);
                }
                // キャッシュ更新
                if (favoriteCache[userId]) {
                    favoriteCache[userId] = {
                        favorites: __spreadArray(__spreadArray([], favoriteCache[userId].favorites, true), [productId], false),
                        timestamp: Date.now(),
                    };
                }
                else {
                    favoriteCache[userId] = {
                        favorites: [productId],
                        timestamp: Date.now(),
                    };
                }
                return [2 /*return*/, true];
            case 5: return [3 /*break*/, 7];
            case 6:
                error_3 = _a.sent();
                console.error('Unexpected error in toggleFavorite:', error_3);
                throw error_3;
            case 7: return [2 /*return*/];
        }
    });
}); };
exports.toggleFavorite = toggleFavorite;
/**
 * キャッシュをクリアする
 */
var clearFavoriteCache = function (userId) {
    if (userId) {
        delete favoriteCache[userId];
    }
    else {
        Object.keys(favoriteCache).forEach(function (key) {
            delete favoriteCache[key];
        });
    }
    console.log('Favorites cache cleared');
};
exports.clearFavoriteCache = clearFavoriteCache;
