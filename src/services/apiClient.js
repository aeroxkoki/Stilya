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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.apiRequest = void 0;
var axios_1 = __importDefault(require("axios"));
var storageUtils_1 = require("@/utils/storageUtils");
var errorUtils_1 = require("@/utils/errorUtils");
var netinfo_1 = __importDefault(require("@react-native-community/netinfo"));
// APIのベースURL
var BASE_URL = 'https://your-api-url/'; // 実際のAPIエンドポイントに変更する
// axiosインスタンスを作成
var createApiClient = function (errorHandler) {
    var apiClient = axios_1.default.create({
        baseURL: BASE_URL,
        timeout: 10000, // 10秒でタイムアウト
        headers: {
            'Content-Type': 'application/json',
        },
    });
    // リクエストインターセプター
    apiClient.interceptors.request.use(function (config) { return __awaiter(void 0, void 0, void 0, function () {
        var networkState, error, token;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, netinfo_1.default.fetch()];
                case 1:
                    networkState = _a.sent();
                    if (!networkState.isConnected) {
                        error = new Error('デバイスがオフラインです');
                        error.name = 'NetworkError';
                        throw error;
                    }
                    return [4 /*yield*/, (0, storageUtils_1.getData)(storageUtils_1.STORAGE_KEYS.AUTH_TOKEN)];
                case 2:
                    token = _a.sent();
                    if (token) {
                        config.headers.Authorization = "Bearer ".concat(token);
                    }
                    return [2 /*return*/, config];
            }
        });
    }); }, function (error) {
        // リクエスト前のエラーは通常、クライアント側の問題
        if (errorHandler) {
            (0, errorUtils_1.handleError)(error, errorHandler);
        }
        return Promise.reject(error);
    });
    // レスポンスインターセプター
    apiClient.interceptors.response.use(function (response) {
        // 成功レスポンスはそのまま返す
        return response;
    }, function (error) { return __awaiter(void 0, void 0, void 0, function () {
        var status_1;
        return __generator(this, function (_a) {
            // エラーがネットワーク関連かどうかを確認
            if ((0, errorUtils_1.isNetworkError)(error)) {
                // エラーハンドラーが提供されていればエラーを報告
                if (errorHandler) {
                    (0, errorUtils_1.handleError)(error, errorHandler);
                }
                // ここでオフラインキューに追加するなどの対応が可能
                // 注: 実装は使用コンテキストに依存
            }
            else if (error.response) {
                status_1 = error.response.status;
                // 401/403エラーの場合は認証関連の処理を追加可能
                if (status_1 === 401 || status_1 === 403) {
                    // 例: 認証エラー時の処理（トークン更新やログアウトなど）
                    console.warn('Authentication error:', status_1);
                }
                // エラー情報をハンドラーに渡す
                if (errorHandler) {
                    (0, errorUtils_1.handleError)(error, errorHandler);
                }
            }
            else {
                // その他のエラー
                if (errorHandler) {
                    (0, errorUtils_1.handleError)(error, errorHandler);
                }
            }
            // エラーを再スロー
            return [2 /*return*/, Promise.reject(error)];
        });
    }); });
    return apiClient;
};
// APIクライアントのラッパー関数（オフライン対応付き）
var apiRequest = function (method, url, data, options, errorHandler) { return __awaiter(void 0, void 0, void 0, function () {
    var networkState, apiClient, response, _a, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 12, , 13]);
                return [4 /*yield*/, netinfo_1.default.fetch()];
            case 1:
                networkState = _b.sent();
                if (!networkState.isConnected) {
                    // オフラインキャッシュ対応
                    // ここでは例として単純にエラーをスローしていますが、
                    // 実際にはキャッシュからデータを取得するなどの対応が必要
                    throw new Error('デバイスがオフラインです');
                }
                apiClient = createApiClient(errorHandler);
                response = void 0;
                _a = method.toUpperCase();
                switch (_a) {
                    case 'GET': return [3 /*break*/, 2];
                    case 'POST': return [3 /*break*/, 4];
                    case 'PUT': return [3 /*break*/, 6];
                    case 'DELETE': return [3 /*break*/, 8];
                }
                return [3 /*break*/, 10];
            case 2: return [4 /*yield*/, apiClient.get(url, options)];
            case 3:
                response = _b.sent();
                return [3 /*break*/, 11];
            case 4: return [4 /*yield*/, apiClient.post(url, data, options)];
            case 5:
                response = _b.sent();
                return [3 /*break*/, 11];
            case 6: return [4 /*yield*/, apiClient.put(url, data, options)];
            case 7:
                response = _b.sent();
                return [3 /*break*/, 11];
            case 8: return [4 /*yield*/, apiClient.delete(url, options)];
            case 9:
                response = _b.sent();
                return [3 /*break*/, 11];
            case 10: throw new Error("\u30B5\u30DD\u30FC\u30C8\u3055\u308C\u3066\u3044\u306A\u3044HTTP\u30E1\u30BD\u30C3\u30C9: ".concat(method));
            case 11: return [2 /*return*/, response.data];
            case 12:
                error_1 = _b.sent();
                // エラーハンドリング（オフライン対応など）
                if ((0, errorUtils_1.isNetworkError)(error_1)) {
                    console.warn('Network error during API request:', url);
                    // オフライン時の処理（キャッシュからのデータ取得など）
                }
                // エラーハンドラーが提供されている場合はエラーを報告
                if (errorHandler) {
                    (0, errorUtils_1.handleError)(error_1, errorHandler);
                }
                throw error_1;
            case 13: return [2 /*return*/];
        }
    });
}); };
exports.apiRequest = apiRequest;
// デフォルトのAPIクライアントをエクスポート
exports.default = createApiClient;
