// src/__tests__/utils/testUtils.ts
import React from 'react';
import { render } from '@testing-library/react-native';

// モックプロバイダー
export const TestProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  return React.createElement(React.Fragment, null, children);
};

// テスト用のレンダリングヘルパー
export const renderWithProviders = (ui: React.ReactElement) => {
  return render(React.createElement(TestProvider, null, ui));
};

// モックナビゲーション
export const mockNavigation = {
  navigate: jest.fn(),
  goBack: jest.fn(),
  setOptions: jest.fn(),
  addListener: jest.fn(() => jest.fn()),
  removeListener: jest.fn(),
};

// モックルート
export const mockRoute = {
  params: {},
};

// テスト用スタブデータ
export const mockProducts = [
  {
    id: 'product-1',
    title: 'テスト商品1',
    image_url: 'https://example.com/image1.jpg',
    price: 4500,
    brand: 'テストブランド',
    tags: ['カジュアル', 'トップス'],
    affiliate_url: 'https://example.com/product/1',
  },
  {
    id: 'product-2',
    title: 'テスト商品2',
    image_url: 'https://example.com/image2.jpg',
    price: 3000,
    brand: 'テストブランド2',
    tags: ['ストリート', 'ボトムス'],
    affiliate_url: 'https://example.com/product/2',
  },
];

// テスト用ユーザースタブ
export const mockUser = {
  id: 'user-1',
  email: 'test@example.com',
};

// テスト用スワイプデータ
export const mockSwipes = [
  {
    id: 'swipe-1',
    user_id: 'user-1',
    product_id: 'product-1',
    result: 'yes',
    created_at: '2023-01-01T00:00:00Z',
  },
  {
    id: 'swipe-2',
    user_id: 'user-1',
    product_id: 'product-2',
    result: 'no',
    created_at: '2023-01-02T00:00:00Z',
  },
];