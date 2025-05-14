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
exports.clearOfflineQueue = exports.addToOfflineQueue = exports.setCacheData = exports.isCacheValid = exports.clearAllData = exports.getMultipleData = exports.storeMultipleData = exports.removeData = exports.getData = exports.storeData = exports.STORAGE_KEYS = void 0;
var async_storage_1 = __importDefault(require("@react-native-async-storage/async-storage"));
/**
 * ローカルストレージ操作のユーティリティ
 * キャッシュやオフライン対応のためのデータ永続化を担当
 */
// キー定数
exports.STORAGE_KEYS = {
    AUTH_TOKEN: '@stilya:auth_token',
    USER_PROFILE: '@stilya:user_profile',
    OFFLINE_SWIPES: '@stilya:offline_swipes',
    CACHE_PRODUCTS: '@stilya:cache_products',
    CACHE_TIMESTAMP: '@stilya:cache_timestamp',
    THEME_PREFERENCE: '@stilya:theme_preference',
    APP_SETTINGS: '@stilya:app_settings',
};
// データを保存する
var storeData = function (key, value) { return __awaiter(void 0, void 0, void 0, function () {
    var jsonValue, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                jsonValue = JSON.stringify(value);
                return [4 /*yield*/, async_storage_1.default.setItem(key, jsonValue)];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                error_1 = _a.sent();
                console.error("Error storing data for key ".concat(key, ":"), error_1);
                throw error_1;
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.storeData = storeData;
// データを取得する
var getData = function (key) { return __awaiter(void 0, void 0, void 0, function () {
    var jsonValue, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, async_storage_1.default.getItem(key)];
            case 1:
                jsonValue = _a.sent();
                return [2 /*return*/, jsonValue != null ? JSON.parse(jsonValue) : null];
            case 2:
                error_2 = _a.sent();
                console.error("Error retrieving data for key ".concat(key, ":"), error_2);
                return [2 /*return*/, null];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getData = getData;
// データを削除する
var removeData = function (key) { return __awaiter(void 0, void 0, void 0, function () {
    var error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, async_storage_1.default.removeItem(key)];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error("Error removing data for key ".concat(key, ":"), error_3);
                throw error_3;
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.removeData = removeData;
// 複数のデータを一度に保存する
var storeMultipleData = function (keyValuePairs) { return __awaiter(void 0, void 0, void 0, function () {
    var pairs, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                pairs = keyValuePairs.map(function (_a) {
                    var key = _a[0], value = _a[1];
                    return [key, JSON.stringify(value)];
                });
                return [4 /*yield*/, async_storage_1.default.multiSet(pairs)];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                console.error('Error storing multiple data:', error_4);
                throw error_4;
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.storeMultipleData = storeMultipleData;
// 複数のデータを一度に取得する
var getMultipleData = function (keys) { return __awaiter(void 0, void 0, void 0, function () {
    var pairs, error_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, async_storage_1.default.multiGet(keys)];
            case 1:
                pairs = _a.sent();
                return [2 /*return*/, pairs.reduce(function (acc, _a) {
                        var key = _a[0], value = _a[1];
                        if (value) {
                            acc[key] = JSON.parse(value);
                        }
                        return acc;
                    }, {})];
            case 2:
                error_5 = _a.sent();
                console.error('Error retrieving multiple data:', error_5);
                return [2 /*return*/, {}];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getMultipleData = getMultipleData;
// アプリのすべてのデータをクリアする（ログアウト時など）
var clearAllData = function () { return __awaiter(void 0, void 0, void 0, function () {
    var keysToKeep_1, allKeys, keysToRemove, error_6;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 4, , 5]);
                keysToKeep_1 = [exports.STORAGE_KEYS.THEME_PREFERENCE, exports.STORAGE_KEYS.APP_SETTINGS];
                return [4 /*yield*/, async_storage_1.default.getAllKeys()];
            case 1:
                allKeys = _a.sent();
                keysToRemove = allKeys.filter(function (key) { return !keysToKeep_1.includes(key); });
                if (!(keysToRemove.length > 0)) return [3 /*break*/, 3];
                return [4 /*yield*/, async_storage_1.default.multiRemove(keysToRemove)];
            case 2:
                _a.sent();
                _a.label = 3;
            case 3: return [3 /*break*/, 5];
            case 4:
                error_6 = _a.sent();
                console.error('Error clearing all data:', error_6);
                throw error_6;
            case 5: return [2 /*return*/];
        }
    });
}); };
exports.clearAllData = clearAllData;
// キャッシュのタイムスタンプを確認し、有効期限内かどうかをチェック
var isCacheValid = function (key, maxAge) { return __awaiter(void 0, void 0, void 0, function () {
    var timestampKey, timestamp, storedTime, currentTime, error_7;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                timestampKey = "".concat(key, "_timestamp");
                return [4 /*yield*/, async_storage_1.default.getItem(timestampKey)];
            case 1:
                timestamp = _a.sent();
                if (!timestamp)
                    return [2 /*return*/, false];
                storedTime = parseInt(timestamp, 10);
                currentTime = Date.now();
                // maxAgeはミリ秒単位
                return [2 /*return*/, currentTime - storedTime < maxAge];
            case 2:
                error_7 = _a.sent();
                console.error("Error checking cache validity for ".concat(key, ":"), error_7);
                return [2 /*return*/, false];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.isCacheValid = isCacheValid;
// キャッシュデータを保存し、タイムスタンプも更新
var setCacheData = function (key, data) { return __awaiter(void 0, void 0, void 0, function () {
    var timestampKey, currentTime, pairs, error_8;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                timestampKey = "".concat(key, "_timestamp");
                currentTime = Date.now().toString();
                pairs = [
                    [key, JSON.stringify(data)],
                    [timestampKey, currentTime]
                ];
                return [4 /*yield*/, async_storage_1.default.multiSet(pairs)];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                error_8 = _a.sent();
                console.error("Error setting cache data for ".concat(key, ":"), error_8);
                throw error_8;
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.setCacheData = setCacheData;
// オフラインデータ追加（配列に新しい要素を追加）
var addToOfflineQueue = function (key, item) { return __awaiter(void 0, void 0, void 0, function () {
    var existingData, updatedData, error_9;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                return [4 /*yield*/, (0, exports.getData)(key)];
            case 1:
                existingData = (_a.sent()) || [];
                updatedData = __spreadArray(__spreadArray([], existingData, true), [item], false);
                return [4 /*yield*/, (0, exports.storeData)(key, updatedData)];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                error_9 = _a.sent();
                console.error("Error adding to offline queue for ".concat(key, ":"), error_9);
                throw error_9;
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.addToOfflineQueue = addToOfflineQueue;
// オフラインキューをクリア
var clearOfflineQueue = function (key) { return __awaiter(void 0, void 0, void 0, function () {
    var error_10;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, exports.storeData)(key, [])];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                error_10 = _a.sent();
                console.error("Error clearing offline queue for ".concat(key, ":"), error_10);
                throw error_10;
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.clearOfflineQueue = clearOfflineQueue;
