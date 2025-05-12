import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { PanResponder } from 'react-native';
import SwipeCard from '../../components/SwipeCard';
import { ThemeProvider } from '../../contexts/ThemeContext';

// ThemeContextをモック
jest.mock('../../contexts/ThemeContext', () => {
  const originalModule = jest.requireActual('../../contexts/ThemeContext');
  
  return {
    ...originalModule,
    useTheme: () => ({
      theme: {
        colors: {
          primary: '#3B82F6',
          text: {
            primary: '#1F2937',
            secondary: '#6B7280',
            inverse: '#FFFFFF',
          },
        },
      },
      isDarkMode: false,
    }),
  };
});

// PanResponderをモック
jest.mock('react-native/Libraries/Interaction/PanResponder', () => ({
  create: jest.fn(() => ({
    panHandlers: {
      onStartShouldSetResponder: jest.fn(),
      onMoveShouldSetResponder: jest.fn(),
      onStartShouldSetResponderCapture: jest.fn(),
      onMoveShouldSetResponderCapture: jest.fn(),
      onResponderGrant: jest.fn(),
      onResponderReject: jest.fn(),
      onResponderMove: jest.fn(),
      onResponderRelease: jest.fn(),
      onResponderTerminationRequest: jest.fn(),
      onResponderTerminate: jest.fn(),
    },
  })),
}));

const mockProduct = {
  id: '1',
  title: 'テスト商品',
  brand: 'テストブランド',
  price: 1990,
  imageUrl: 'https://example.com/image.jpg',
  description: 'テスト説明',
  tags: ['タグ1', 'タグ2', 'タグ3'],
  category: 'トップス',
  affiliateUrl: 'https://example.com',
  source: 'test',
};

describe('SwipeCard Component', () => {
  const onSwipeLeftMock = jest.fn();
  const onSwipeRightMock = jest.fn();
  const onCardPressMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders correctly with product data', () => {
    const { getByText } = render(
      <ThemeProvider>
        <SwipeCard
          product={mockProduct}
          onSwipeLeft={onSwipeLeftMock}
          onSwipeRight={onSwipeRightMock}
          onCardPress={onCardPressMock}
        />
      </ThemeProvider>
    );

    expect(getByText(mockProduct.title)).toBeTruthy();
    expect(getByText(mockProduct.brand)).toBeTruthy();
    expect(getByText('¥1,990')).toBeTruthy(); // フォーマットされた価格
  });

  it('displays correct number of tags', () => {
    const { getAllByText } = render(
      <ThemeProvider>
        <SwipeCard
          product={mockProduct}
          onSwipeLeft={onSwipeLeftMock}
          onSwipeRight={onSwipeRightMock}
          onCardPress={onCardPressMock}
        />
      </ThemeProvider>
    );

    // 表示されるタグの数を確認（デフォルトでは3つまで表示）
    expect(getAllByText(/タグ/).length).toBeLessThanOrEqual(3);
  });

  it('calls onCardPress when card is pressed', () => {
    const { getByTestId } = render(
      <ThemeProvider>
        <SwipeCard
          product={mockProduct}
          onSwipeLeft={onSwipeLeftMock}
          onSwipeRight={onSwipeRightMock}
          onCardPress={onCardPressMock}
          testID="swipe-card"
        />
      </ThemeProvider>
    );

    fireEvent.press(getByTestId('swipe-card'));
    expect(onCardPressMock).toHaveBeenCalledTimes(1);
  });

  it('sets up PanResponder correctly', () => {
    render(
      <ThemeProvider>
        <SwipeCard
          product={mockProduct}
          onSwipeLeft={onSwipeLeftMock}
          onSwipeRight={onSwipeRightMock}
          onCardPress={onCardPressMock}
        />
      </ThemeProvider>
    );

    expect(PanResponder.create).toHaveBeenCalled();
  });
});
