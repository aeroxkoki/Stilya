import React from 'react';
import { render } from '@testing-library/react-native';
import renderer from 'react-test-renderer';
import { ThemeProvider } from '../../contexts/ThemeContext';
import SwipeCard from '../../components/swipe/SwipeCard';
import Button from '../../components/common/Button';
import { mockDeviceShape, resetDeviceMock, mockLandscapeOrientation } from '../utils/deviceTestUtils';

// テスト用のデータ
const mockProduct = {
  id: 'product-1',
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

// ThemeContextをモック
jest.mock('../../contexts/ThemeContext', () => {
  const originalModule = jest.requireActual('../../contexts/ThemeContext');
  
  return {
    ...originalModule,
    useTheme: () => ({
      theme: {
        colors: {
          primary: '#3B82F6',
          secondary: '#6366F1',
          text: {
            primary: '#1F2937',
            secondary: '#6B7280',
            inverse: '#FFFFFF',
          },
          background: {
            main: '#FFFFFF',
            card: '#F9FAFB',
          },
          border: {
            light: '#E5E7EB',
          },
        },
        spacing: {
          xs: 4,
          s: 8,
          m: 16,
          l: 24,
          xl: 32,
        },
        fontSizes: {
          xs: 12,
          s: 14,
          m: 16,
          l: 18,
          xl: 20,
        },
        fontWeights: {
          regular: '400',
          medium: '500',
          bold: '700',
        },
        radius: {
          s: 8,
          m: 12,
          l: 16,
        },
      },
      isDarkMode: false,
    }),
  };
});

describe('Device Compatibility Tests', () => {
  // 各テスト後にモックをリセット
  afterEach(() => {
    resetDeviceMock();
    jest.clearAllMocks();
  });

  describe('SwipeCard Component', () => {
    // モックコールバック関数
    const onSwipeLeftMock = jest.fn();
    const onSwipeRightMock = jest.fn();
    const onCardPressMock = jest.fn();

    it('renders correctly on small screen device (iPhone SE)', () => {
      // iPhone SE相当の画面サイズをモック
      mockDeviceShape('iphone-se');
      
      const tree = renderer.create(
        <ThemeProvider>
          <SwipeCard
            product={mockProduct}
            onSwipeLeft={onSwipeLeftMock}
            onSwipeRight={onSwipeRightMock}
            onCardPress={onCardPressMock}
            testID="swipe-card"
          />
        </ThemeProvider>
      ).toJSON();
      
      expect(tree).toMatchSnapshot();
    });

    it('renders correctly on large screen device (iPhone 14 Plus)', () => {
      // iPhone 14 Plus相当の画面サイズをモック
      mockDeviceShape('iphone-14-plus');
      
      const tree = renderer.create(
        <ThemeProvider>
          <SwipeCard
            product={mockProduct}
            onSwipeLeft={onSwipeLeftMock}
            onSwipeRight={onSwipeRightMock}
            onCardPress={onCardPressMock}
            testID="swipe-card"
          />
        </ThemeProvider>
      ).toJSON();
      
      expect(tree).toMatchSnapshot();
    });

    it('renders correctly on iPad', () => {
      // iPad相当の画面サイズをモック
      mockDeviceShape('ipad');
      
      const tree = renderer.create(
        <ThemeProvider>
          <SwipeCard
            product={mockProduct}
            onSwipeLeft={onSwipeLeftMock}
            onSwipeRight={onSwipeRightMock}
            onCardPress={onCardPressMock}
            testID="swipe-card"
          />
        </ThemeProvider>
      ).toJSON();
      
      expect(tree).toMatchSnapshot();
    });

    it('renders correctly on landscape orientation', () => {
      // iPhone 13 Miniの横向き画面をモック
      mockLandscapeOrientation('iphone-13-mini');
      
      const tree = renderer.create(
        <ThemeProvider>
          <SwipeCard
            product={mockProduct}
            onSwipeLeft={onSwipeLeftMock}
            onSwipeRight={onSwipeRightMock}
            onCardPress={onCardPressMock}
            testID="swipe-card"
          />
        </ThemeProvider>
      ).toJSON();
      
      expect(tree).toMatchSnapshot();
    });

    it('renders correctly with large font size', () => {
      // 大きいフォントサイズをモック
      mockDeviceShape('large-font');
      
      const tree = renderer.create(
        <ThemeProvider>
          <SwipeCard
            product={mockProduct}
            onSwipeLeft={onSwipeLeftMock}
            onSwipeRight={onSwipeRightMock}
            onCardPress={onCardPressMock}
            testID="swipe-card"
          />
        </ThemeProvider>
      ).toJSON();
      
      expect(tree).toMatchSnapshot();
    });

    it('renders correctly on RTL layout', () => {
      // RTLレイアウトをモック
      mockDeviceShape('rtl-device');
      
      const tree = renderer.create(
        <ThemeProvider>
          <SwipeCard
            product={mockProduct}
            onSwipeLeft={onSwipeLeftMock}
            onSwipeRight={onSwipeRightMock}
            onCardPress={onCardPressMock}
            testID="swipe-card"
          />
        </ThemeProvider>
      ).toJSON();
      
      expect(tree).toMatchSnapshot();
    });
  });

  describe('Button Component', () => {
    it('renders correctly at different screen sizes', () => {
      // 異なる画面サイズでのボタンサイズを検証
      const screenSizes = ['iphone-se', 'android-medium', 'iphone-14-pro-max', 'ipad'];
      
      screenSizes.forEach(deviceName => {
        mockDeviceShape(deviceName);
        
        const { getByText } = render(
          <ThemeProvider>
            <Button
              title="テストボタン"
              onPress={jest.fn()}
              variant="primary"
              size="medium"
              testID="test-button"
            />
          </ThemeProvider>
        );
        
        const buttonElement = getByText('テストボタン');
        expect(buttonElement).toBeTruthy();
        
        // ボタンのスタイルを取得（実装によって異なるため、適宜調整が必要）
        const buttonStyle = buttonElement.parent.props.style;
        
        // スナップショットテスト
        expect(buttonStyle).toMatchSnapshot(`Button style on ${deviceName}`);
        
        resetDeviceMock();
      });
    });

    it('adjusts font size based on device fontScale', () => {
      // 標準フォントサイズでのレンダリング
      mockDeviceShape({ fontScale: 1.0 });
      
      const normalRender = render(
        <ThemeProvider>
          <Button
            title="テストボタン"
            onPress={jest.fn()}
            variant="primary"
            size="medium"
          />
        </ThemeProvider>
      );
      
      const normalButton = normalRender.getByText('テストボタン');
      const normalTextStyle = normalButton.props.style;
      
      // 大きいフォントサイズでのレンダリング
      resetDeviceMock();
      mockDeviceShape({ fontScale: 1.6 });
      
      const largeRender = render(
        <ThemeProvider>
          <Button
            title="テストボタン"
            onPress={jest.fn()}
            variant="primary"
            size="medium"
          />
        </ThemeProvider>
      );
      
      const largeButton = largeRender.getByText('テストボタン');
      const largeTextStyle = largeButton.props.style;
      
      // フォントスケーリングが適用されていることを検証
      // ※実装によっては異なるため、適宜調整が必要
      expect(normalTextStyle).not.toEqual(largeTextStyle);
    });
  });
});
