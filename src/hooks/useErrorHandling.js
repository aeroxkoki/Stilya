"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useErrorHandling = void 0;
var ErrorContext_1 = require("@/contexts/ErrorContext");
/**
 * エラーハンドリングフックの使用例
 * 各画面やコンポーネントで必要に応じて呼び出す
 */
var useErrorHandling = function () {
    var _a = (0, ErrorContext_1.useError)(), addError = _a.addError, clearError = _a.clearError, clearAllErrors = _a.clearAllErrors;
    // API通信などでのエラーハンドリング
    var handleApiError = function (error) {
        console.error('API Error:', error);
        // 認証エラーの場合
        if (error.status === 401 || (error.response && error.response.status === 401)) {
            addError(ErrorContext_1.ErrorType.AUTH, '認証エラーが発生しました。再度ログインしてください。', error);
            return;
        }
        // その他のAPIエラー
        addError(ErrorContext_1.ErrorType.API, error.message || 'サーバーとの通信中にエラーが発生しました。', error);
    };
    // フォームバリデーションエラーなどのハンドリング
    var handleValidationError = function (message, details) {
        addError(ErrorContext_1.ErrorType.VALIDATION, message, details);
    };
    // ネットワークエラーのハンドリング
    var handleNetworkError = function (error) {
        addError(ErrorContext_1.ErrorType.NETWORK, 'ネットワークに接続できません。インターネット接続を確認してください。', error);
    };
    // 一般的なエラーハンドリング
    var handleGenericError = function (error) {
        var errorMessage = error.message || 'エラーが発生しました。';
        addError(ErrorContext_1.ErrorType.UNKNOWN, errorMessage, error);
    };
    return {
        handleApiError: handleApiError,
        handleValidationError: handleValidationError,
        handleNetworkError: handleNetworkError,
        handleGenericError: handleGenericError,
        clearError: clearError,
        clearAllErrors: clearAllErrors,
    };
};
exports.useErrorHandling = useErrorHandling;
