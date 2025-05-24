/**
 * テスト用のユーティリティ関数
 */
import React, { ReactElement } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { NetworkProvider } from '../../contexts/NetworkContext';

// SafeAreaProviderをラップした全体のテスト用プロバイダー
export const TestWrapper = ({ children }: { children: ReactElement }) => {
  return (
    <SafeAreaProvider
      initialMetrics={{
        frame: { x: 0, y: 0, width: 390, height: 844 },
        insets: { top: 47, left: 0, right: 0, bottom: 34 }
      }}
    >
      <ThemeProvider>
        <NetworkProvider>
          {children}
        </NetworkProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

// モックデータ
export const mockProduct = {
  id: 'test-product-1',
  title: 'テスト商品',
  price: 5000,
  image_url: 'https://example.com/image.jpg',
  tags: ['カジュアル', '春'],
  affiliate_url: 'https://example.com/product',
  source: 'test'
};

export const mockUser = {
  id: 'test-user-1',
  email: 'test@example.com',
  created_at: '2025-05-22T00:00:00Z'
};

// テスト用の遅延関数
export const wait = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// テスト用のランダムID生成
export const generateTestId = (prefix: string = 'test'): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};