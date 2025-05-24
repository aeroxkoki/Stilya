"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.apiCallWithRetry = exports.apiDelete = exports.apiPut = exports.apiPost = exports.apiGet = exports.apiCall = exports.handleApiError = exports.ApiErrorType = void 0;
var axios_1 = __importDefault(require("axios"));
var react_native_1 = require("react-native");
// API関連のエラータイプ
var ApiErrorType;
(function (ApiErrorType) {
    ApiErrorType["NETWORK_ERROR"] = "NETWORK_ERROR";
    ApiErrorType["TIMEOUT_ERROR"] = "TIMEOUT_ERROR";
    ApiErrorType["SERVER_ERROR"] = "SERVER_ERROR";
    ApiErrorType["CLIENT_ERROR"] = "CLIENT_ERROR";
    ApiErrorType["UNKNOWN_ERROR"] = "UNKNOWN_ERROR";
})(ApiErrorType || (exports.ApiErrorType = ApiErrorType = {}));
// APIリクエストのデフォルト設定
var defaultConfig = {
    timeout: 30000, // 30秒
    headers: {
        'Content-Type': 'application/json',
    },
};
// APIエラーハンドリング
var handleApiError = function (error) {
    var _a;
    if (axios_1.default.isAxiosError(error)) {
        var axiosError = error;
        if (axiosError.response) {
            // サーバーからのレスポンスがあったがエラーコード
            var statusCode = axiosError.response.status;
            if (statusCode >= 400 && statusCode < 500) {
                return {
                    type: ApiErrorType.CLIENT_ERROR,
                    message: ((_a = axiosError.response) === null || _a === void 0 ? void 0 : _a.data) ? axiosError.response.data.message || 'クライアントエラーが発生しました' : 'クライアントエラーが発生しました',
                    statusCode: statusCode,
                    originalError: axiosError,
                };
            }
            if (statusCode >= 500) {
                return {
                    type: ApiErrorType.SERVER_ERROR,
                    message: 'サーバーエラーが発生しました',
                    statusCode: statusCode,
                    originalError: axiosError,
                };
            }
        }
        else if (axiosError.request) {
            // リクエストは送信されたが、レスポンスがない
            if (axiosError.code === 'ECONNABORTED') {
                return {
                    type: ApiErrorType.TIMEOUT_ERROR,
                    message: 'リクエストがタイムアウトしました',
                    originalError: axiosError,
                };
            }
            return {
                type: ApiErrorType.NETWORK_ERROR,
                message: 'ネットワークエラーが発生しました',
                originalError: axiosError,
            };
        }
    }
    // その他のエラー
    return {
        type: ApiErrorType.UNKNOWN_ERROR,
        message: error instanceof Error ? error.message : '予期せぬエラーが発生しました',
        originalError: error,
    };
};
exports.handleApiError = handleApiError;
// 共通のAPI呼び出し関数
var apiCall = function (url_1) {
    var args_1 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([url_1], args_1, true), void 0, function (url, method, data, config) {
        var mergedConfig, response, error_1, apiError;
        if (method === void 0) { method = 'GET'; }
        if (config === void 0) { config = {}; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 2, , 3]);
                    mergedConfig = __assign(__assign(__assign({}, defaultConfig), config), { method: method, url: url, data: data });
                    return [4 /*yield*/, (0, axios_1.default)(mergedConfig)];
                case 1:
                    response = _a.sent();
                    return [2 /*return*/, response.data];
                case 2:
                    error_1 = _a.sent();
                    apiError = (0, exports.handleApiError)(error_1);
                    // 開発環境ではコンソールにエラーを出力
                    console.error('API Error:', apiError);
                    // ユーザーへの表示
                    if (__DEV__) {
                        react_native_1.Alert.alert('API Error', apiError.message);
                    }
                    throw apiError;
                case 3: return [2 /*return*/];
            }
        });
    });
};
exports.apiCall = apiCall;
// GETリクエスト用の簡易関数
var apiGet = function (url_1) {
    var args_1 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([url_1], args_1, true), void 0, function (url, config) {
        if (config === void 0) { config = {}; }
        return __generator(this, function (_a) {
            return [2 /*return*/, (0, exports.apiCall)(url, 'GET', undefined, config)];
        });
    });
};
exports.apiGet = apiGet;
// POSTリクエスト用の簡易関数
var apiPost = function (url_1, data_1) {
    var args_1 = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args_1[_i - 2] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([url_1, data_1], args_1, true), void 0, function (url, data, config) {
        if (config === void 0) { config = {}; }
        return __generator(this, function (_a) {
            return [2 /*return*/, (0, exports.apiCall)(url, 'POST', data, config)];
        });
    });
};
exports.apiPost = apiPost;
// PUTリクエスト用の簡易関数
var apiPut = function (url_1, data_1) {
    var args_1 = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args_1[_i - 2] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([url_1, data_1], args_1, true), void 0, function (url, data, config) {
        if (config === void 0) { config = {}; }
        return __generator(this, function (_a) {
            return [2 /*return*/, (0, exports.apiCall)(url, 'PUT', data, config)];
        });
    });
};
exports.apiPut = apiPut;
// DELETEリクエスト用の簡易関数
var apiDelete = function (url_1) {
    var args_1 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([url_1], args_1, true), void 0, function (url, config) {
        if (config === void 0) { config = {}; }
        return __generator(this, function (_a) {
            return [2 /*return*/, (0, exports.apiCall)(url, 'DELETE', undefined, config)];
        });
    });
};
exports.apiDelete = apiDelete;
// 再試行可能なAPI呼び出し関数
var apiCallWithRetry = function (url_1) {
    var args_1 = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        args_1[_i - 1] = arguments[_i];
    }
    return __awaiter(void 0, __spreadArray([url_1], args_1, true), void 0, function (url, method, data, config, maxRetries, retryDelay) {
        var lastError, _loop_1, attempt, state_1;
        if (method === void 0) { method = 'GET'; }
        if (config === void 0) { config = {}; }
        if (maxRetries === void 0) { maxRetries = 3; }
        if (retryDelay === void 0) { retryDelay = 1000; }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _loop_1 = function (attempt) {
                        var _b, error_2, apiError;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    _c.trys.push([0, 2, , 5]);
                                    _b = {};
                                    return [4 /*yield*/, (0, exports.apiCall)(url, method, data, config)];
                                case 1: return [2 /*return*/, (_b.value = _c.sent(), _b)];
                                case 2:
                                    error_2 = _c.sent();
                                    lastError = error_2;
                                    apiError = error_2;
                                    if (!(apiError.type === ApiErrorType.SERVER_ERROR ||
                                        apiError.type === ApiErrorType.NETWORK_ERROR)) return [3 /*break*/, 4];
                                    if (!(attempt < maxRetries - 1)) return [3 /*break*/, 4];
                                    return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, retryDelay * (attempt + 1)); })];
                                case 3:
                                    _c.sent();
                                    return [2 /*return*/, "continue"];
                                case 4: 
                                // その他のエラーまたは最大試行回数を超えた場合はエラーをスロー
                                throw error_2;
                                case 5: return [2 /*return*/];
                            }
                        });
                    };
                    attempt = 0;
                    _a.label = 1;
                case 1:
                    if (!(attempt < maxRetries)) return [3 /*break*/, 4];
                    return [5 /*yield**/, _loop_1(attempt)];
                case 2:
                    state_1 = _a.sent();
                    if (typeof state_1 === "object")
                        return [2 /*return*/, state_1.value];
                    _a.label = 3;
                case 3:
                    attempt++;
                    return [3 /*break*/, 1];
                case 4: throw lastError;
            }
        });
    });
};
exports.apiCallWithRetry = apiCallWithRetry;
