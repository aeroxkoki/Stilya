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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.useError = exports.ErrorProvider = exports.ErrorContext = exports.ErrorType = void 0;
var react_1 = __importStar(require("react"));
var react_native_toast_message_1 = __importDefault(require("react-native-toast-message"));
var NetworkContext_1 = require("./NetworkContext");
// エラーの種類を定義
var ErrorType;
(function (ErrorType) {
    ErrorType["NETWORK"] = "NETWORK";
    ErrorType["AUTH"] = "AUTH";
    ErrorType["API"] = "API";
    ErrorType["VALIDATION"] = "VALIDATION";
    ErrorType["UNKNOWN"] = "UNKNOWN";
})(ErrorType || (exports.ErrorType = ErrorType = {}));
// コンテキストの作成
exports.ErrorContext = (0, react_1.createContext)({
    errors: [],
    addError: function () { },
    clearError: function () { },
    clearAllErrors: function () { },
    hasUnhandledErrors: false,
});
var ErrorProvider = function (_a) {
    var children = _a.children;
    var _b = (0, react_1.useState)([]), errors = _b[0], setErrors = _b[1];
    var isConnected = (0, NetworkContext_1.useNetwork)().isConnected;
    // エラーが未処理かどうかを計算
    var hasUnhandledErrors = errors.some(function (error) { return !error.handled; });
    // ネットワーク状態の変化を監視して、必要に応じてエラーメッセージを表示
    (0, react_1.useEffect)(function () {
        if (isConnected === false) {
            addError(ErrorType.NETWORK, 'インターネット接続がありません。一部の機能が制限される場合があります。');
        }
    }, [isConnected]);
    // エラーが追加されたら自動的にトーストで表示
    (0, react_1.useEffect)(function () {
        var unhandledErrors = errors.filter(function (error) { return !error.handled; });
        if (unhandledErrors.length > 0) {
            var latestError_1 = unhandledErrors[unhandledErrors.length - 1];
            // トーストメッセージを表示
            react_native_toast_message_1.default.show({
                type: getToastType(latestError_1.type),
                text1: getErrorTitle(latestError_1.type),
                text2: latestError_1.message,
                position: 'bottom',
                visibilityTime: 4000,
                autoHide: true,
                onHide: function () {
                    // トーストが非表示になったらエラーをハンドル済みにマーク
                    setErrors(function (prevErrors) {
                        return prevErrors.map(function (err) { return (err.id === latestError_1.id ? __assign(__assign({}, err), { handled: true }) : err); });
                    });
                },
            });
        }
    }, [errors]);
    // エラータイプに応じたトーストタイプを取得
    var getToastType = function (errorType) {
        switch (errorType) {
            case ErrorType.NETWORK:
                return 'info';
            case ErrorType.AUTH:
                return 'error';
            case ErrorType.API:
                return 'error';
            case ErrorType.VALIDATION:
                return 'warning';
            default:
                return 'error';
        }
    };
    // エラータイプに応じたエラータイトルを取得
    var getErrorTitle = function (errorType) {
        switch (errorType) {
            case ErrorType.NETWORK:
                return '接続エラー';
            case ErrorType.AUTH:
                return '認証エラー';
            case ErrorType.API:
                return 'サーバーエラー';
            case ErrorType.VALIDATION:
                return '入力エラー';
            default:
                return 'エラーが発生しました';
        }
    };
    // 新しいエラーを追加
    var addError = function (type, message, details) {
        var newError = {
            id: Date.now().toString(),
            type: type,
            message: message,
            details: details,
            timestamp: new Date(),
            handled: false,
        };
        setErrors(function (prevErrors) { return __spreadArray(__spreadArray([], prevErrors, true), [newError], false); });
    };
    // 特定のエラーをクリア
    var clearError = function (id) {
        setErrors(function (prevErrors) { return prevErrors.filter(function (error) { return error.id !== id; }); });
    };
    // すべてのエラーをクリア
    var clearAllErrors = function () {
        setErrors([]);
    };
    return (<exports.ErrorContext.Provider value={{
            errors: errors,
            addError: addError,
            clearError: clearError,
            clearAllErrors: clearAllErrors,
            hasUnhandledErrors: hasUnhandledErrors,
        }}>
      {children}
    </exports.ErrorContext.Provider>);
};
exports.ErrorProvider = ErrorProvider;
// カスタムフックの作成
var useError = function () { return (0, react_1.useContext)(exports.ErrorContext); };
exports.useError = useError;
