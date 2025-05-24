import { useError, ErrorType } from '@/contexts/ErrorContext';

/**
 * エラーハンドリングフックの使用例
 * 各画面やコンポーネントで必要に応じて呼び出す
 */
export const useErrorHandling = () => {
  const { addError, clearError, clearAllErrors } = useError();

  // API通信などでのエラーハンドリング
  const handleApiError = (error: any) => {
    console.error('API Error:', error);
    
    // 認証エラーの場合
    if (error.status === 401 || (error.response && error.response.status === 401)) {
      addError(
        ErrorType.AUTH,
        '認証エラーが発生しました。再度ログインしてください。',
        error
      );
      return;
    }
    
    // その他のAPIエラー
    addError(
      ErrorType.API,
      error.message || 'サーバーとの通信中にエラーが発生しました。',
      error
    );
  };

  // フォームバリデーションエラーなどのハンドリング
  const handleValidationError = (message: string, details?: any) => {
    addError(ErrorType.VALIDATION, message, details);
  };

  // ネットワークエラーのハンドリング
  const handleNetworkError = (error: any) => {
    addError(
      ErrorType.NETWORK,
      'ネットワークに接続できません。インターネット接続を確認してください。',
      error
    );
  };

  // 一般的なエラーハンドリング
  const handleGenericError = (error: any) => {
    const errorMessage = error.message || 'エラーが発生しました。';
    addError(ErrorType.UNKNOWN, errorMessage, error);
  };

  return {
    handleApiError,
    handleValidationError,
    handleNetworkError,
    handleGenericError,
    clearError,
    clearAllErrors,
  };
};
