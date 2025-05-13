import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { NetworkProvider, useNetwork } from '../../contexts/NetworkContext';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { ErrorProvider } from '../../contexts/ErrorContext';
import AuthScreen from '../../screens/auth/AuthScreen';
import SwipeScreen from '../../screens/swipe/SwipeScreen';
import RecommendationsScreen from '../../screens/recommend/RecommendScreen';
import Toast from 'react-native-toast-message';

// モックの作成
jest.mock('../../services/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(() => ({ data: { session: { user: { id: 'test-user-id' } } } })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(),
        })),
      })),
    })),
  },
}));

jest.mock('../../services/productService', () => ({
  fetchProducts: jest.fn(),
  fetchProductById: jest.fn(),
}));

jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
  hide: jest.fn(),
  setConfig: jest.fn(),
  __esModule: true,
  default: {
    show: jest.fn(),
    hide: jest.fn(),
    setConfig: jest.fn(),
  },
}));

jest.mock('../../contexts/NetworkContext', () => {
  const original = jest.requireActual('../../contexts/NetworkContext');
  return {
    ...original,
    useNetwork: jest.fn(),
  };
});

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

// ネットワーク接続状態を制御する
const mockUseNetwork = (isConnected: boolean) => {
  (useNetwork as jest.Mock).mockImplementation(() => ({
    isConnected,
    isInternetReachable: isConnected,
  }));
};

describe('Edge Case Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseNetwork(true); // デフォルトは接続状態
  });

  describe('Network Connectivity Tests', () => {
    it('shows offline notice when network is disconnected', async () => {
      mockUseNetwork(false); // ネットワーク切断状態をモック
      
      const { getByTestId } = render(
        <NetworkProvider>
          <ErrorProvider>
            <ThemeProvider>
              <SwipeScreen />
            </ThemeProvider>
          </ErrorProvider>
        </NetworkProvider>
      );
      
      // オフライン通知が表示されることを確認
      await waitFor(() => expect(getByTestId('offline-notice')).toBeTruthy());
    });
    
    it('disables swipe functionality when offline', async () => {
      mockUseNetwork(false); // ネットワーク切断状態をモック
      
      // 商品取得をモック（オフライン時にもローカルキャッシュから取得できると仮定）
      const mockFetchProducts = require('../../services/productService').fetchProducts;
      mockFetchProducts.mockResolvedValueOnce([
        {
          id: 'product-1',
          title: 'テスト商品1',
          brand: 'テストブランド',
          price: 1990,
          imageUrl: 'https://example.com/image1.jpg',
          description: 'テスト説明1',
          tags: ['タグ1', 'タグ2'],
          category: 'トップス',
          affiliateUrl: 'https://example.com/product1',
          source: 'test',
        },
      ]);
      
      const { getByTestId } = render(
        <NetworkProvider>
          <ErrorProvider>
            <ThemeProvider>
              <SwipeScreen />
            </ThemeProvider>
          </ErrorProvider>
        </NetworkProvider>
      );
      
      // スワイプカードは表示されるが、スワイプボタンが無効になっていることを確認
      await waitFor(() => expect(getByTestId('swipe-card')).toBeTruthy());
      expect(getByTestId('swipe-left-button')).toBeDisabled();
      expect(getByTestId('swipe-right-button')).toBeDisabled();
    });
    
    it('shows error toast when trying to fetch recommendations offline', async () => {
      mockUseNetwork(false); // ネットワーク切断状態をモック
      
      render(
        <NetworkProvider>
          <ErrorProvider>
            <ThemeProvider>
              <RecommendationsScreen />
            </ThemeProvider>
          </ErrorProvider>
        </NetworkProvider>
      );
      
      // トーストが表示されることを確認
      await waitFor(() => {
        expect(Toast.show).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'error',
            text1: expect.stringContaining('オフライン'),
          })
        );
      });
    });
  });
  
  describe('Input Validation Tests', () => {
    it('shows error for invalid email format', async () => {
      const { getByTestId, getByText, getByPlaceholderText } = render(
        <NetworkProvider>
          <ErrorProvider>
            <ThemeProvider>
              <AuthScreen />
            </ThemeProvider>
          </ErrorProvider>
        </NetworkProvider>
      );
      
      // 不正なメールアドレスを入力
      fireEvent.changeText(getByPlaceholderText(/メールアドレス/i), 'invalid-email');
      fireEvent.changeText(getByPlaceholderText(/パスワード/i), 'password123');
      
      // ログインボタンをタップ
      fireEvent.press(getByTestId('login-button'));
      
      // エラーメッセージが表示されることを確認
      await waitFor(() => {
        expect(getByText(/有効なメールアドレスを入力してください/i)).toBeTruthy();
      });
    });
    
    it('shows error for too short password', async () => {
      const { getByTestId, getByText, getByPlaceholderText } = render(
        <NetworkProvider>
          <ErrorProvider>
            <ThemeProvider>
              <AuthScreen />
            </ThemeProvider>
          </ErrorProvider>
        </NetworkProvider>
      );
      
      // 有効なメールアドレスと短すぎるパスワードを入力
      fireEvent.changeText(getByPlaceholderText(/メールアドレス/i), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText(/パスワード/i), '123');
      
      // ログインボタンをタップ
      fireEvent.press(getByTestId('login-button'));
      
      // エラーメッセージが表示されることを確認
      await waitFor(() => {
        expect(getByText(/パスワードは6文字以上で入力してください/i)).toBeTruthy();
      });
    });
  });
  
  describe('Error Handling Tests', () => {
    it('handles authentication errors gracefully', async () => {
      // 認証エラーをモック
      const mockSignIn = require('../../services/supabase').supabase.auth.signInWithPassword;
      mockSignIn.mockRejectedValueOnce(new Error('Invalid login credentials'));
      
      const { getByTestId, getByPlaceholderText } = render(
        <NetworkProvider>
          <ErrorProvider>
            <ThemeProvider>
              <AuthScreen />
            </ThemeProvider>
          </ErrorProvider>
        </NetworkProvider>
      );
      
      // メールアドレスとパスワードを入力
      fireEvent.changeText(getByPlaceholderText(/メールアドレス/i), 'test@example.com');
      fireEvent.changeText(getByPlaceholderText(/パスワード/i), 'password123');
      
      // ログインボタンをタップ
      fireEvent.press(getByTestId('login-button'));
      
      // エラートーストが表示されることを確認
      await waitFor(() => {
        expect(Toast.show).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'error',
            text1: expect.stringContaining('ログインに失敗しました'),
          })
        );
      });
    });
    
    it('handles product fetch errors gracefully', async () => {
      // 商品取得エラーをモック
      const mockFetchProducts = require('../../services/productService').fetchProducts;
      mockFetchProducts.mockRejectedValueOnce(new Error('Failed to fetch products'));
      
      render(
        <NetworkProvider>
          <ErrorProvider>
            <ThemeProvider>
              <SwipeScreen />
            </ThemeProvider>
          </ErrorProvider>
        </NetworkProvider>
      );
      
      // エラートーストが表示されることを確認
      await waitFor(() => {
        expect(Toast.show).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'error',
            text1: expect.stringContaining('商品の取得に失敗しました'),
          })
        );
      });
    });
  });
});
