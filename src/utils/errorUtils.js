"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isNetworkError = exports.handleError = exports.getErrorTypeFromError = exports.getApiErrorMessage = exports.getAuthErrorMessage = void 0;
var ErrorContext_1 = require("@/contexts/ErrorContext");
/**
 * エラーメッセージをわかりやすく変換するユーティリティ
 */
// Supabaseの認証エラーを適切なメッセージに変換
var getAuthErrorMessage = function (error) {
    var errorMessages = {
        // 認証エラー
        'Invalid login credentials': 'メールアドレスまたはパスワードが正しくありません。',
        'Email not confirmed': 'メールアドレスの確認が完了していません。受信トレイをご確認ください。',
        'User already registered': 'このメールアドレスは既に登録されています。',
        'Email link is invalid or has expired': 'リンクが無効または期限切れです。再度お試しください。',
        // トークンエラー
        'JWT expired': 'セッションの有効期限が切れました。再度ログインしてください。',
        'JWT must have claim "exp"': '認証情報が不正です。',
        // その他
        'Password should be at least 6 characters': 'パスワードは6文字以上である必要があります。',
    };
    // エラーコードに基づいてメッセージを取得
    var message = errorMessages[error.message] || error.message;
    return message;
};
exports.getAuthErrorMessage = getAuthErrorMessage;
// APIエラーを適切なメッセージに変換
var getApiErrorMessage = function (error) {
    // ネットワークエラーの場合
    if (error.message === 'Network Error') {
        return 'サーバーに接続できませんでした。インターネット接続を確認してください。';
    }
    // ステータスコードがある場合
    if (error.response && error.response.status) {
        switch (error.response.status) {
            case 400:
                return 'リクエストが不正です。入力内容を確認してください。';
            case 401:
                return '認証情報が無効です。再度ログインしてください。';
            case 403:
                return 'この操作を行う権限がありません。';
            case 404:
                return 'リクエストされたリソースが見つかりませんでした。';
            case 429:
                return 'リクエスト数が制限を超えました。しばらく経ってから再度お試しください。';
            case 500:
            case 502:
            case 503:
                return 'サーバーエラーが発生しました。しばらく経ってから再度お試しください。';
            default:
                break;
        }
    }
    // サーバーからのエラーメッセージがある場合はそれを使用
    if (error.response && error.response.data && error.response.data.message) {
        return error.response.data.message;
    }
    // それ以外の場合はデフォルトメッセージ
    return error.message || 'エラーが発生しました。再度お試しください。';
};
exports.getApiErrorMessage = getApiErrorMessage;
// エラーの種類を特定する
var getErrorTypeFromError = function (error) {
    // Supabaseの認証エラー
    if (error && error.status && error.message) {
        return ErrorContext_1.ErrorType.AUTH;
    }
    // ネットワークエラー
    if (error.message === 'Network Error' || error.name === 'NetworkError') {
        return ErrorContext_1.ErrorType.NETWORK;
    }
    // APIエラー（ステータスコードあり）
    if (error.response && error.response.status) {
        // 認証エラー
        if ([401, 403].includes(error.response.status)) {
            return ErrorContext_1.ErrorType.AUTH;
        }
        // それ以外のAPIエラー
        return ErrorContext_1.ErrorType.API;
    }
    // バリデーションエラー
    if (error.name === 'ValidationError' || error.validationErrors) {
        return ErrorContext_1.ErrorType.VALIDATION;
    }
    // 不明なエラー
    return ErrorContext_1.ErrorType.UNKNOWN;
};
exports.getErrorTypeFromError = getErrorTypeFromError;
// エラーのハンドリングヘルパー
var handleError = function (error, addError) {
    console.error('エラー発生:', error);
    // エラーの種類を特定
    var errorType = (0, exports.getErrorTypeFromError)(error);
    var errorMessage;
    // エラータイプに応じてメッセージを取得
    switch (errorType) {
        case ErrorContext_1.ErrorType.AUTH:
            errorMessage = (0, exports.getAuthErrorMessage)(error);
            break;
        case ErrorContext_1.ErrorType.API:
            errorMessage = (0, exports.getApiErrorMessage)(error);
            break;
        case ErrorContext_1.ErrorType.NETWORK:
            errorMessage = 'インターネット接続に問題があります。ネットワーク状態を確認してください。';
            break;
        case ErrorContext_1.ErrorType.VALIDATION:
            errorMessage = error.message || '入力内容に誤りがあります。確認してください。';
            break;
        default:
            errorMessage = error.message || 'エラーが発生しました。再度お試しください。';
    }
    // コンテキストにエラーを追加
    addError(errorType, errorMessage, error);
};
exports.handleError = handleError;
// オフラインエラー用
var isNetworkError = function (error) {
    return (error.message === 'Network Error' ||
        error.name === 'NetworkError' ||
        error.code === 'NETWORK_ERROR' ||
        (error.response && error.response.status === 0));
};
exports.isNetworkError = isNetworkError;
