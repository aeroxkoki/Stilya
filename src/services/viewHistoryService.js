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
exports.recordProductClick = exports.getProductViewHistory = exports.recordProductView = void 0;
var supabase_1 = require("./supabase");
/**
 * ユーザーの閲覧履歴を記録する
 * @param userId ユーザーID
 * @param productId 商品ID
 * @returns 結果
 */
var recordProductView = function (userId, productId) { return __awaiter(void 0, void 0, void 0, function () {
    var existingLogs, lastViewedTime, currentTime, timeDiff, error, err_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, supabase_1.supabase
                        .from('view_logs')
                        .select('*')
                        .eq('user_id', userId)
                        .eq('product_id', productId)
                        .limit(1)];
            case 1:
                existingLogs = (_a.sent()).data;
                // 最近の閲覧履歴がある場合は更新せずに終了（同じ商品を短時間に複数回閲覧するケース）
                if (existingLogs && existingLogs.length > 0) {
                    lastViewedTime = new Date(existingLogs[0].created_at);
                    currentTime = new Date();
                    timeDiff = currentTime.getTime() - lastViewedTime.getTime();
                    // 30分以内の閲覧は記録しない（制限）
                    if (timeDiff < 30 * 60 * 1000) {
                        return [2 /*return*/, true];
                    }
                }
                return [4 /*yield*/, supabase_1.supabase
                        .from('view_logs')
                        .insert({
                        user_id: userId,
                        product_id: productId,
                        created_at: new Date().toISOString(),
                    })];
            case 2:
                error = (_a.sent()).error;
                if (error) {
                    console.error('Failed to record product view:', error);
                    return [2 /*return*/, false];
                }
                return [2 /*return*/, true];
            case 3:
                err_1 = _a.sent();
                console.error('Error recording product view:', err_1);
                return [2 /*return*/, false];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.recordProductView = recordProductView;
/**
 * ユーザーの閲覧履歴を取得する
 * @param userId ユーザーID
 * @param limit 取得する最大数
 * @returns 閲覧履歴の配列
 */
var getProductViewHistory = function (userId_1) {
    var args_1 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([userId_1], args_1, true), void 0, function (userId, limit) {
        var _a, viewLogs, error, productIds, _b, products, productsError, productIdToIndex_1, err_2;
        if (limit === void 0) { limit = 50; }
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    _c.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, supabase_1.supabase
                            .from('view_logs')
                            .select('product_id, created_at')
                            .eq('user_id', userId)
                            .order('created_at', { ascending: false })
                            .limit(limit)];
                case 1:
                    _a = _c.sent(), viewLogs = _a.data, error = _a.error;
                    if (error) {
                        console.error('Failed to fetch view history:', error);
                        return [2 /*return*/, []];
                    }
                    if (!viewLogs || viewLogs.length === 0) {
                        return [2 /*return*/, []];
                    }
                    productIds = viewLogs.map(function (log) { return log.product_id; });
                    return [4 /*yield*/, supabase_1.supabase
                            .from('products')
                            .select('*')
                            .in('id', productIds)];
                case 2:
                    _b = _c.sent(), products = _b.data, productsError = _b.error;
                    if (productsError) {
                        console.error('Failed to fetch products for view history:', productsError);
                        return [2 /*return*/, []];
                    }
                    if (!products || products.length === 0) {
                        return [2 /*return*/, []];
                    }
                    productIdToIndex_1 = new Map();
                    viewLogs.forEach(function (log, index) {
                        productIdToIndex_1.set(log.product_id, index);
                    });
                    // データ形式を変換しつつ、閲覧順に並べ替え
                    return [2 /*return*/, products
                            .map(function (item) { return ({
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
                        }); })
                            .sort(function (a, b) {
                            var indexA = productIdToIndex_1.get(a.id) || 0;
                            var indexB = productIdToIndex_1.get(b.id) || 0;
                            return indexA - indexB;
                        })];
                case 3:
                    err_2 = _c.sent();
                    console.error('Error getting product view history:', err_2);
                    return [2 /*return*/, []];
                case 4: return [2 /*return*/];
            }
        });
    });
};
exports.getProductViewHistory = getProductViewHistory;
/**
 * ユーザーのクリックログ記録する
 * @param userId ユーザーID
 * @param productId 商品ID
 * @returns 結果
 */
var recordProductClick = function (userId, productId) { return __awaiter(void 0, void 0, void 0, function () {
    var error, err_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, supabase_1.supabase
                        .from('click_logs')
                        .insert({
                        user_id: userId,
                        product_id: productId,
                        created_at: new Date().toISOString(),
                    })];
            case 1:
                error = (_a.sent()).error;
                if (error) {
                    console.error('Failed to record product click:', error);
                    return [2 /*return*/, false];
                }
                return [2 /*return*/, true];
            case 2:
                err_3 = _a.sent();
                console.error('Error recording product click:', err_3);
                return [2 /*return*/, false];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.recordProductClick = recordProductClick;
