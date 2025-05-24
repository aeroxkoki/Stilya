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
exports.getSwipeForProduct = exports.getSwipeHistory = exports.syncOfflineSwipes = exports.saveSwipeResult = void 0;
var supabase_1 = require("./supabase");
var async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
var netinfo_1 = __importDefault(require("@react-native-community/netinfo"));
// オフラインスワイプキャッシュ用のキー
var OFFLINE_SWIPES_KEY = 'stilya_offline_swipes';
/**
 * スワイプ結果を保存する
 * @param userId ユーザーID
 * @param productId 商品ID
 * @param result 'yes' または 'no'
 */
var saveSwipeResult = function (userId, productId, result) { return __awaiter(void 0, void 0, void 0, function () {
    var netInfo, swipeData, _a, data, error, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 7, , 8]);
                // 開発モード（__DEV__）ではモック処理としてログ出力のみ行い、
                // 成功したことにする
                if (__DEV__) {
                    console.log("[DEV] Saved swipe result: ".concat(userId, " ").concat(result, " ").concat(productId));
                    return [2 /*return*/, {
                            id: 'mock-id',
                            userId: userId,
                            productId: productId,
                            result: result,
                            createdAt: new Date().toISOString(),
                        }];
                }
                return [4 /*yield*/, netinfo_1.default.fetch()];
            case 1:
                netInfo = _b.sent();
                swipeData = {
                    user_id: userId,
                    product_id: productId,
                    result: result,
                    created_at: new Date().toISOString(),
                };
                if (!!netInfo.isConnected) return [3 /*break*/, 3];
                return [4 /*yield*/, saveSwipeOffline(userId, productId, result)];
            case 2:
                _b.sent();
                // オフラインでの仮のレスポンスを返す
                return [2 /*return*/, {
                        id: "offline-".concat(Date.now()),
                        userId: userId,
                        productId: productId,
                        result: result,
                        createdAt: new Date().toISOString(),
                    }];
            case 3: return [4 /*yield*/, supabase_1.supabase
                    .from('swipes')
                    .insert([swipeData])
                    .select()
                    .single()];
            case 4:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (!error) return [3 /*break*/, 6];
                console.error('Error saving swipe result:', error);
                // エラー時もオフラインキャッシュに保存
                return [4 /*yield*/, saveSwipeOffline(userId, productId, result)];
            case 5:
                // エラー時もオフラインキャッシュに保存
                _b.sent();
                throw new Error(error.message);
            case 6: 
            // Supabaseからの応答をアプリの型に変換
            return [2 /*return*/, {
                    id: data.id,
                    userId: data.user_id,
                    productId: data.product_id,
                    result: data.result,
                    createdAt: data.created_at,
                }];
            case 7:
                error_1 = _b.sent();
                console.error('Failed to save swipe result:', error_1);
                return [2 /*return*/, null];
            case 8: return [2 /*return*/];
        }
    });
}); };
exports.saveSwipeResult = saveSwipeResult;
/**
 * オフラインスワイプデータをローカルに保存
 */
var saveSwipeOffline = function (userId, productId, result) { return __awaiter(void 0, void 0, void 0, function () {
    var offlineSwipesJSON, offlineSwipes, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, async_storage_1.default.getItem(OFFLINE_SWIPES_KEY)];
            case 1:
                offlineSwipesJSON = _a.sent();
                offlineSwipes = [];
                if (offlineSwipesJSON) {
                    offlineSwipes = JSON.parse(offlineSwipesJSON);
                }
                // 新しいスワイプを追加
                offlineSwipes.push({
                    userId: userId,
                    productId: productId,
                    result: result,
                    timestamp: new Date().toISOString(),
                });
                // 保存
                return [4 /*yield*/, async_storage_1.default.setItem(OFFLINE_SWIPES_KEY, JSON.stringify(offlineSwipes))];
            case 2:
                // 保存
                _a.sent();
                console.log('Swipe saved offline. Will sync when online.');
                return [3 /*break*/, 4];
            case 3:
                error_2 = _a.sent();
                console.error('Error saving swipe offline:', error_2);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
/**
 * オフラインスワイプデータを同期する（オンラインに戻った時に呼び出す）
 */
var syncOfflineSwipes = function () { return __awaiter(void 0, void 0, void 0, function () {
    var netInfo, offlineSwipesJSON, offlineSwipes, swipesForInsert, error, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 5, , 6]);
                return [4 /*yield*/, netinfo_1.default.fetch()];
            case 1:
                netInfo = _a.sent();
                if (!netInfo.isConnected) {
                    console.log('Still offline. Cannot sync swipes.');
                    return [2 /*return*/, false];
                }
                return [4 /*yield*/, async_storage_1.default.getItem(OFFLINE_SWIPES_KEY)];
            case 2:
                offlineSwipesJSON = _a.sent();
                if (!offlineSwipesJSON) {
                    return [2 /*return*/, true]; // 同期するデータがない
                }
                offlineSwipes = JSON.parse(offlineSwipesJSON);
                if (offlineSwipes.length === 0) {
                    return [2 /*return*/, true]; // 同期するデータがない
                }
                console.log("Syncing ".concat(offlineSwipes.length, " offline swipes..."));
                swipesForInsert = offlineSwipes.map(function (swipe) { return ({
                    user_id: swipe.userId,
                    product_id: swipe.productId,
                    result: swipe.result,
                    created_at: swipe.timestamp,
                }); });
                return [4 /*yield*/, supabase_1.supabase
                        .from('swipes')
                        .insert(swipesForInsert)];
            case 3:
                error = (_a.sent()).error;
                if (error) {
                    console.error('Error syncing offline swipes:', error);
                    return [2 /*return*/, false];
                }
                // 同期に成功したらローカルデータをクリア
                return [4 /*yield*/, async_storage_1.default.removeItem(OFFLINE_SWIPES_KEY)];
            case 4:
                // 同期に成功したらローカルデータをクリア
                _a.sent();
                console.log('Offline swipes synced successfully');
                return [2 /*return*/, true];
            case 5:
                error_3 = _a.sent();
                console.error('Failed to sync offline swipes:', error_3);
                return [2 /*return*/, false];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.syncOfflineSwipes = syncOfflineSwipes;
/**
 * ユーザーのスワイプ履歴を取得する
 * @param userId ユーザーID
 * @param result 結果でフィルタリング（オプション）
 * @param limit 取得数の上限
 */
var getSwipeHistory = function (userId_1, result_1) {
    var args_1 = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args_1[_i - 2] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([userId_1, result_1], args_1, true), void 0, function (userId, result, limit) {
        var netInfo, offlineSwipes, query, _a, data, error, error_4;
        if (limit === void 0) { limit = 50; }
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, , 6]);
                    return [4 /*yield*/, netinfo_1.default.fetch()];
                case 1:
                    netInfo = _b.sent();
                    if (!!netInfo.isConnected) return [3 /*break*/, 3];
                    return [4 /*yield*/, getOfflineSwipes(userId, result)];
                case 2:
                    offlineSwipes = _b.sent();
                    return [2 /*return*/, offlineSwipes];
                case 3:
                    query = supabase_1.supabase
                        .from('swipes')
                        .select('*')
                        .eq('user_id', userId)
                        .order('created_at', { ascending: false })
                        .limit(limit);
                    // 結果でフィルターする場合
                    if (result) {
                        query = query.eq('result', result);
                    }
                    return [4 /*yield*/, query];
                case 4:
                    _a = _b.sent(), data = _a.data, error = _a.error;
                    if (error) {
                        console.error('Error fetching swipe history:', error);
                        throw new Error(error.message);
                    }
                    // Supabaseからの応答をアプリの型に変換
                    return [2 /*return*/, data.map(function (item) { return ({
                            id: item.id,
                            userId: item.user_id,
                            productId: item.product_id,
                            result: item.result,
                            createdAt: item.created_at,
                        }); })];
                case 5:
                    error_4 = _b.sent();
                    console.error('Failed to fetch swipe history:', error_4);
                    return [2 /*return*/, []];
                case 6: return [2 /*return*/];
            }
        });
    });
};
exports.getSwipeHistory = getSwipeHistory;
/**
 * ローカルに保存されたオフラインスワイプを取得
 */
var getOfflineSwipes = function (userId, result) { return __awaiter(void 0, void 0, void 0, function () {
    var offlineSwipesJSON, offlineSwipes, filteredSwipes, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, async_storage_1.default.getItem(OFFLINE_SWIPES_KEY)];
            case 1:
                offlineSwipesJSON = _a.sent();
                if (!offlineSwipesJSON) {
                    return [2 /*return*/, []];
                }
                offlineSwipes = JSON.parse(offlineSwipesJSON);
                filteredSwipes = offlineSwipes.filter(function (swipe) { return swipe.userId === userId; });
                // 結果でフィルタリング（オプション）
                if (result) {
                    filteredSwipes = filteredSwipes.filter(function (swipe) { return swipe.result === result; });
                }
                // Swipe型に変換
                return [2 /*return*/, filteredSwipes.map(function (swipe) { return ({
                        id: "offline-".concat(swipe.timestamp),
                        userId: swipe.userId,
                        productId: swipe.productId,
                        result: swipe.result,
                        createdAt: swipe.timestamp,
                    }); })];
            case 2:
                error_5 = _a.sent();
                console.error('Error getting offline swipes:', error_5);
                return [2 /*return*/, []];
            case 3: return [2 /*return*/];
        }
    });
}); };
/**
 * 特定の商品に対するスワイプ結果を取得する
 * @param userId ユーザーID
 * @param productId 商品ID
 */
var getSwipeForProduct = function (userId, productId) { return __awaiter(void 0, void 0, void 0, function () {
    var netInfo, offlineSwipes, offlineSwipe, _a, data, error, error_6;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 5, , 6]);
                return [4 /*yield*/, netinfo_1.default.fetch()];
            case 1:
                netInfo = _b.sent();
                if (!!netInfo.isConnected) return [3 /*break*/, 3];
                return [4 /*yield*/, getOfflineSwipes(userId)];
            case 2:
                offlineSwipes = _b.sent();
                offlineSwipe = offlineSwipes.find(function (swipe) { return swipe.productId === productId; });
                return [2 /*return*/, offlineSwipe || null];
            case 3: return [4 /*yield*/, supabase_1.supabase
                    .from('swipes')
                    .select('*')
                    .eq('user_id', userId)
                    .eq('product_id', productId)
                    .single()];
            case 4:
                _a = _b.sent(), data = _a.data, error = _a.error;
                if (error) {
                    if (error.code === 'PGRST116') {
                        // レコードが見つからない場合
                        return [2 /*return*/, null];
                    }
                    console.error('Error fetching swipe for product:', error);
                    throw new Error(error.message);
                }
                // Supabaseからの応答をアプリの型に変換
                return [2 /*return*/, {
                        id: data.id,
                        userId: data.user_id,
                        productId: data.product_id,
                        result: data.result,
                        createdAt: data.created_at,
                    }];
            case 5:
                error_6 = _b.sent();
                console.error('Failed to fetch swipe for product:', error_6);
                return [2 /*return*/, null];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.getSwipeForProduct = getSwipeForProduct;
