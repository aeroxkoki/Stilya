import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import Toast from 'react-native-toast-message';
import { useNetwork } from './NetworkContext';

// エラーの種類を定義
export enum ErrorType {
  NETWORK = 'NETWORK',
  AUTH = 'AUTH',
  API = 'API',
  VALIDATION = 'VALIDATION',
  UNKNOWN = 'UNKNOWN',
}

// エラーメッセージの構造
interface ErrorMessage {
  id: string;
  type: ErrorType;
  message: string;
  details?: any;
  timestamp: Date;
  handled: boolean;
}

// エラーコンテキストの型定義
interface ErrorContextType {
  errors: ErrorMessage[];
  addError: (type: ErrorType, message: string, details?: any) => void;
  clearError: (id: string) => void;
  clearAllErrors: () => void;
  hasUnhandledErrors: boolean;
}

// コンテキストの作成
export const ErrorContext = createContext<ErrorContextType>({
  errors: [],
  addError: () => {},
  clearError: () => {},
  clearAllErrors: () => {},
  hasUnhandledErrors: false,
});

interface ErrorProviderProps {
  children: ReactNode;
}

export const ErrorProvider: React.FC<ErrorProviderProps> = ({ children }) => {
  const [errors, setErrors] = useState<ErrorMessage[]>([]);
  const { isConnected } = useNetwork();

  // エラーが未処理かどうかを計算
  const hasUnhandledErrors = errors.some((error) => !error.handled);

  // ネットワーク状態の変化を監視して、必要に応じてエラーメッセージを表示
  useEffect(() => {
    if (isConnected === false) {
      addError(
        ErrorType.NETWORK,
        'インターネット接続がありません。一部の機能が制限される場合があります。',
      );
    }
  }, [isConnected]);

  // エラーが追加されたら自動的にトーストで表示
  useEffect(() => {
    const unhandledErrors = errors.filter((error) => !error.handled);
    
    if (unhandledErrors.length > 0) {
      const latestError = unhandledErrors[unhandledErrors.length - 1];
      
      // トーストメッセージを表示
      Toast.show({
        type: getToastType(latestError.type),
        text1: getErrorTitle(latestError.type),
        text2: latestError.message,
        position: 'bottom',
        visibilityTime: 4000,
        autoHide: true,
        onHide: () => {
          // トーストが非表示になったらエラーをハンドル済みにマーク
          setErrors((prevErrors) =>
            prevErrors.map((err) => (err.id === latestError.id ? { ...err, handled: true } : err))
          );
        },
      });
    }
  }, [errors]);

  // エラータイプに応じたトーストタイプを取得
  const getToastType = (errorType: ErrorType): string => {
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
  const getErrorTitle = (errorType: ErrorType): string => {
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
  const addError = (type: ErrorType, message: string, details?: any) => {
    const newError: ErrorMessage = {
      id: Date.now().toString(),
      type,
      message,
      details,
      timestamp: new Date(),
      handled: false,
    };

    setErrors((prevErrors) => [...prevErrors, newError]);
  };

  // 特定のエラーをクリア
  const clearError = (id: string) => {
    setErrors((prevErrors) => prevErrors.filter((error) => error.id !== id));
  };

  // すべてのエラーをクリア
  const clearAllErrors = () => {
    setErrors([]);
  };

  return (
    <ErrorContext.Provider
      value={{
        errors,
        addError,
        clearError,
        clearAllErrors,
        hasUnhandledErrors,
      }}
    >
      {children}
    </ErrorContext.Provider>
  );
};

// カスタムフックの作成
export const useError = () => useContext(ErrorContext);
