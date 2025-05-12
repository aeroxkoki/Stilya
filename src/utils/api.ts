import axios, { AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Alert } from 'react-native';

// API関連のエラータイプ
export enum ApiErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  CLIENT_ERROR = 'CLIENT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',
}

// APIエラーインターフェース
export interface ApiError {
  type: ApiErrorType;
  message: string;
  statusCode?: number;
  originalError?: any;
}

// APIリクエストのデフォルト設定
const defaultConfig: AxiosRequestConfig = {
  timeout: 30000, // 30秒
  headers: {
    'Content-Type': 'application/json',
  },
};

// APIエラーハンドリング
export const handleApiError = (error: AxiosError | Error): ApiError => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    
    if (axiosError.response) {
      // サーバーからのレスポンスがあったがエラーコード
      const statusCode = axiosError.response.status;
      
      if (statusCode >= 400 && statusCode < 500) {
        return {
          type: ApiErrorType.CLIENT_ERROR,
          message: axiosError.response.data?.message || 'クライアントエラーが発生しました',
          statusCode,
          originalError: axiosError,
        };
      }
      
      if (statusCode >= 500) {
        return {
          type: ApiErrorType.SERVER_ERROR,
          message: 'サーバーエラーが発生しました',
          statusCode,
          originalError: axiosError,
        };
      }
    } else if (axiosError.request) {
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
    message: error.message || '予期せぬエラーが発生しました',
    originalError: error,
  };
};

// 共通のAPI呼び出し関数
export const apiCall = async <T>(
  url: string,
  method: string = 'GET',
  data?: any,
  config: AxiosRequestConfig = {}
): Promise<T> => {
  try {
    const mergedConfig: AxiosRequestConfig = {
      ...defaultConfig,
      ...config,
      method,
      url,
      data,
    };
    
    const response: AxiosResponse<T> = await axios(mergedConfig);
    return response.data;
  } catch (error) {
    const apiError = handleApiError(error as Error);
    
    // 開発環境ではコンソールにエラーを出力
    console.error('API Error:', apiError);
    
    // ユーザーへの表示
    if (__DEV__) {
      Alert.alert('API Error', apiError.message);
    }
    
    throw apiError;
  }
};

// GETリクエスト用の簡易関数
export const apiGet = async <T>(url: string, config: AxiosRequestConfig = {}): Promise<T> => {
  return apiCall<T>(url, 'GET', undefined, config);
};

// POSTリクエスト用の簡易関数
export const apiPost = async <T>(url: string, data: any, config: AxiosRequestConfig = {}): Promise<T> => {
  return apiCall<T>(url, 'POST', data, config);
};

// PUTリクエスト用の簡易関数
export const apiPut = async <T>(url: string, data: any, config: AxiosRequestConfig = {}): Promise<T> => {
  return apiCall<T>(url, 'PUT', data, config);
};

// DELETEリクエスト用の簡易関数
export const apiDelete = async <T>(url: string, config: AxiosRequestConfig = {}): Promise<T> => {
  return apiCall<T>(url, 'DELETE', undefined, config);
};

// 再試行可能なAPI呼び出し関数
export const apiCallWithRetry = async <T>(
  url: string,
  method: string = 'GET',
  data?: any,
  config: AxiosRequestConfig = {},
  maxRetries: number = 3,
  retryDelay: number = 1000
): Promise<T> => {
  let lastError: any;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await apiCall<T>(url, method, data, config);
    } catch (error) {
      lastError = error;
      const apiError = error as ApiError;
      
      // サーバーエラーかネットワークエラーの場合のみ再試行
      if (
        apiError.type === ApiErrorType.SERVER_ERROR ||
        apiError.type === ApiErrorType.NETWORK_ERROR
      ) {
        // 最後の試行以外は待機して再試行
        if (attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, retryDelay * (attempt + 1)));
          continue;
        }
      }
      
      // その他のエラーまたは最大試行回数を超えた場合はエラーをスロー
      throw error;
    }
  }
  
  throw lastError;
};
