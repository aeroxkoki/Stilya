import { ErrorType } from '@/contexts/ErrorContext';
import { AuthError } from '@supabase/supabase-js';

/**
 * エラーメッセージをわかりやすく変換するユーティリティ
 */

// Supabaseの認証エラーを適切なメッセージに変換
export const getAuthErrorMessage = (error: AuthError): string => {
  const errorMessages: Record<string, string> = {
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
  const message = errorMessages[error.message] || error.message;
  return message;
};

// APIエラーを適切なメッセージに変換
export const getApiErrorMessage = (error: any): string => {
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

// エラーの種類を特定する
export const getErrorTypeFromError = (error: any): ErrorType => {
  // Supabaseの認証エラー
  if (error && error.status && error.message) {
    return ErrorType.AUTH;
  }

  // ネットワークエラー
  if (error.message === 'Network Error' || error.name === 'NetworkError') {
    return ErrorType.NETWORK;
  }

  // APIエラー（ステータスコードあり）
  if (error.response && error.response.status) {
    // 認証エラー
    if ([401, 403].includes(error.response.status)) {
      return ErrorType.AUTH;
    }
    
    // それ以外のAPIエラー
    return ErrorType.API;
  }

  // バリデーションエラー
  if (error.name === 'ValidationError' || error.validationErrors) {
    return ErrorType.VALIDATION;
  }

  // 不明なエラー
  return ErrorType.UNKNOWN;
};

// エラーのハンドリングヘルパー
export const handleError = (
  error: any, 
  addError: (type: ErrorType, message: string, details?: any) => void
): void => {
  console.error('エラー発生:', error);
  
  // エラーの種類を特定
  const errorType = getErrorTypeFromError(error);
  let errorMessage: string;
  
  // エラータイプに応じてメッセージを取得
  switch (errorType) {
    case ErrorType.AUTH:
      errorMessage = getAuthErrorMessage(error);
      break;
    case ErrorType.API:
      errorMessage = getApiErrorMessage(error);
      break;
    case ErrorType.NETWORK:
      errorMessage = 'インターネット接続に問題があります。ネットワーク状態を確認してください。';
      break;
    case ErrorType.VALIDATION:
      errorMessage = error.message || '入力内容に誤りがあります。確認してください。';
      break;
    default:
      errorMessage = error.message || 'エラーが発生しました。再度お試しください。';
  }
  
  // コンテキストにエラーを追加
  addError(errorType, errorMessage, error);
};

// オフラインエラー用
export const isNetworkError = (error: any): boolean => {
  return (
    error.message === 'Network Error' ||
    error.name === 'NetworkError' ||
    error.code === 'NETWORK_ERROR' ||
    (error.response && error.response.status === 0)
  );
};
