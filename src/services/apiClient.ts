import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { getData, STORAGE_KEYS } from '@/utils/storageUtils';
import { handleError, isNetworkError } from '@/utils/errorUtils';
import NetInfo from '@react-native-community/netinfo';
import { ErrorType } from '@/contexts/ErrorContext';

// APIのベースURL
const BASE_URL = 'https://your-api-url/'; // 実際のAPIエンドポイントに変更する

// ErrorContext経由でエラーを処理するための型
type ErrorHandler = (type: ErrorType, message: string, details?: any) => void;

// axiosインスタンスを作成
const createApiClient = (errorHandler?: ErrorHandler): AxiosInstance => {
  const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 10000, // 10秒でタイムアウト
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // リクエストインターセプター
  apiClient.interceptors.request.use(
    async (config) => {
      // ネットワーク接続を確認
      const networkState = await NetInfo.fetch();
      if (!networkState.isConnected) {
        // オフラインの場合はエラーをスロー
        const error = new Error('デバイスがオフラインです');
        error.name = 'NetworkError';
        throw error;
      }

      // 認証トークンがあれば追加
      const token = await getData<string>(STORAGE_KEYS.AUTH_TOKEN);
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    },
    (error) => {
      // リクエスト前のエラーは通常、クライアント側の問題
      if (errorHandler) {
        handleError(error, errorHandler);
      }
      return Promise.reject(error);
    }
  );

  // レスポンスインターセプター
  apiClient.interceptors.response.use(
    (response) => {
      // 成功レスポンスはそのまま返す
      return response;
    },
    async (error: AxiosError) => {
      // エラーがネットワーク関連かどうかを確認
      if (isNetworkError(error)) {
        // エラーハンドラーが提供されていればエラーを報告
        if (errorHandler) {
          handleError(error, errorHandler);
        }

        // ここでオフラインキューに追加するなどの対応が可能
        // 注: 実装は使用コンテキストに依存
      } else if (error.response) {
        // サーバーからのレスポンスがある場合
        const status = error.response.status;

        // 401/403エラーの場合は認証関連の処理を追加可能
        if (status === 401 || status === 403) {
          // 例: 認証エラー時の処理（トークン更新やログアウトなど）
          console.warn('Authentication error:', status);
        }

        // エラー情報をハンドラーに渡す
        if (errorHandler) {
          handleError(error, errorHandler);
        }
      } else {
        // その他のエラー
        if (errorHandler) {
          handleError(error, errorHandler);
        }
      }

      // エラーを再スロー
      return Promise.reject(error);
    }
  );

  return apiClient;
};

// APIクライアントのラッパー関数（オフライン対応付き）
export const apiRequest = async <T>(
  method: string,
  url: string,
  data?: any,
  options?: AxiosRequestConfig,
  errorHandler?: ErrorHandler
): Promise<T> => {
  try {
    // ネットワーク接続を確認
    const networkState = await NetInfo.fetch();
    if (!networkState.isConnected) {
      // オフラインキャッシュ対応
      // ここでは例として単純にエラーをスローしていますが、
      // 実際にはキャッシュからデータを取得するなどの対応が必要
      throw new Error('デバイスがオフラインです');
    }

    // API通信を実行
    const apiClient = createApiClient(errorHandler);
    let response: AxiosResponse<T>;

    switch (method.toUpperCase()) {
      case 'GET':
        response = await apiClient.get<T>(url, options);
        break;
      case 'POST':
        response = await apiClient.post<T>(url, data, options);
        break;
      case 'PUT':
        response = await apiClient.put<T>(url, data, options);
        break;
      case 'DELETE':
        response = await apiClient.delete<T>(url, options);
        break;
      default:
        throw new Error(`サポートされていないHTTPメソッド: ${method}`);
    }

    return response.data;
  } catch (error) {
    // エラーハンドリング（オフライン対応など）
    if (isNetworkError(error)) {
      console.warn('Network error during API request:', url);
      // オフライン時の処理（キャッシュからのデータ取得など）
    }

    // エラーハンドラーが提供されている場合はエラーを報告
    if (errorHandler) {
      handleError(error, errorHandler);
    }

    throw error;
  }
};

// デフォルトのAPIクライアントをエクスポート
export default createApiClient;
