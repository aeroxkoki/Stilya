import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { ErrorProvider } from '../../contexts/ErrorContext';
import { NetworkProvider } from '../../contexts/NetworkContext';
import AuthScreen from '../../screens/auth/AuthScreen';
import OnboardingScreen from '../../screens/onboarding/OnboardingScreen';
import SwipeScreen from '../../screens/swipe/SwipeScreen';
import RecommendationsScreen from '../../screens/recommend/RecommendScreen';
import ProfileScreen from '../../screens/profile/ProfileScreen';
import ProductDetailScreen from '../../screens/detail/ProductDetailScreen';

// モックの作成
jest.mock('../../services/supabase', () => ({
  supabase: {
    auth: {
      signInWithPassword: jest.fn(),
      signUp: jest.fn(),
      signOut: jest.fn(),
      getSession: jest.fn(() => ({ data: { session: { user: { id: 'test-user-id' } } } })),
      onAuthStateChange: jest.fn(() => ({ data: { subscription: { unsubscribe: jest.fn() } } })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          single: jest.fn(() => ({ data: { id: 'test-user-id', email: 'test@example.com' } })),
        })),
      })),
      insert: jest.fn(() => ({ select: jest.fn() })),
      update: jest.fn(),
      upsert: jest.fn(),
    })),
  },
}));

jest.mock('../../services/productService', () => ({
  fetchProducts: jest.fn(() => Promise.resolve([
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
    {
      id: 'product-2',
      title: 'テスト商品2',
      brand: 'テストブランド2',
      price: 2990,
      imageUrl: 'https://example.com/image2.jpg',
      description: 'テスト説明2',
      tags: ['タグ2', 'タグ3'],
      category: 'ボトムス',
      affiliateUrl: 'https://example.com/product2',
      source: 'test',
    },
  ])),
  fetchProductById: jest.fn((id) => Promise.resolve({
    id,
    title: `テスト商品${id.split('-')[1]}`,
    brand: 'テストブランド',
    price: 1990,
    imageUrl: 'https://example.com/image.jpg',
    description: 'テスト説明',
    tags: ['タグ1', 'タグ2'],
    category: 'トップス',
    affiliateUrl: 'https://example.com/product',
    source: 'test',
  })),
}));

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => null),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));

jest.mock('expo-image', () => ({
  Image: 'Image',
  ImageBackground: 'ImageBackground',
}));

// タイプ定義
type RootStackParamList = {
  Auth: undefined;
  Onboarding: undefined;
  Swipe: undefined;
  Recommendations: undefined;
  Profile: undefined;
  ProductDetail: { productId: string };
};

const Stack = createStackNavigator<RootStackParamList>();

const TestNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Auth">
        <Stack.Screen name="Auth" component={AuthScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Swipe" component={SwipeScreen} />
        <Stack.Screen name="Recommendations" component={RecommendationsScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen 
          name="ProductDetail" 
          component={ProductDetailScreen} 
          initialParams={{ productId: 'product-1' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

describe('User Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('Login to Onboarding to Swipe Flow', async () => {
    const { getByTestId, getByText, getByPlaceholderText } = render(
      <NetworkProvider>
        <ErrorProvider>
          <ThemeProvider>
            <TestNavigator />
          </ThemeProvider>
        </ErrorProvider>
      </NetworkProvider>
    );

    // 1. ログイン画面
    await waitFor(() => expect(getByText(/ログイン/i)).toBeTruthy());
    
    // メールアドレスとパスワードを入力
    fireEvent.changeText(getByPlaceholderText(/メールアドレス/i), 'test@example.com');
    fireEvent.changeText(getByPlaceholderText(/パスワード/i), 'password123');
    
    // ログインボタンをタップ
    fireEvent.press(getByTestId('login-button'));
    
    // 2. オンボーディング画面に遷移するのを待つ
    await waitFor(() => expect(getByTestId('onboarding-screen')).toBeTruthy());
    
    // 性別選択
    fireEvent.press(getByTestId('gender-male'));
    
    // 次へボタンをタップ
    fireEvent.press(getByTestId('next-button'));
    
    // スタイル好み選択
    await waitFor(() => expect(getByTestId('style-preference-screen')).toBeTruthy());
    fireEvent.press(getByTestId('style-casual'));
    
    // 次へボタンをタップ
    fireEvent.press(getByTestId('next-button'));
    
    // 年代選択
    await waitFor(() => expect(getByTestId('age-group-screen')).toBeTruthy());
    fireEvent.press(getByTestId('age-20s'));
    
    // 完了ボタンをタップ
    fireEvent.press(getByTestId('complete-button'));
    
    // 3. スワイプ画面に遷移するのを待つ
    await waitFor(() => expect(getByTestId('swipe-screen')).toBeTruthy());
    
    // 商品カードが表示されていることを確認
    expect(getByTestId('swipe-card')).toBeTruthy();
    
    // 右スワイプ（Yes）
    fireEvent(getByTestId('swipe-card'), 'swipe', { dx: 200 });
    
    // おすすめ商品が表示されることを確認
    await waitFor(() => expect(getByText(/おすすめ/i)).toBeTruthy());
  });

  it('Navigate to Product Detail and Back', async () => {
    const { getByTestId, getByText, getAllByTestId } = render(
      <NetworkProvider>
        <ErrorProvider>
          <ThemeProvider>
            <TestNavigator />
          </ThemeProvider>
        </ErrorProvider>
      </NetworkProvider>
    );

    // ログイン→オンボーディングをスキップして、スワイプ画面からスタート
    // (実際のテストではこのプロセスも含める必要がありますが、簡略化のため省略)

    // スワイプ画面が表示されるのを待つ
    await waitFor(() => expect(getByTestId('swipe-screen')).toBeTruthy());
    
    // 商品カードをタップして詳細画面へ
    fireEvent.press(getByTestId('swipe-card'));
    
    // 商品詳細画面が表示されるのを待つ
    await waitFor(() => expect(getByTestId('product-detail-screen')).toBeTruthy());
    
    // 商品タイトルが表示されていることを確認
    expect(getByText(/テスト商品/i)).toBeTruthy();
    
    // 購入ボタンが表示されていることを確認
    expect(getByTestId('purchase-button')).toBeTruthy();
    
    // 戻るボタンをタップ
    fireEvent.press(getByTestId('back-button'));
    
    // スワイプ画面に戻ることを確認
    await waitFor(() => expect(getByTestId('swipe-screen')).toBeTruthy());
  });

  it('Navigate from Swipe to Recommendations tab', async () => {
    const { getByTestId, getByText } = render(
      <NetworkProvider>
        <ErrorProvider>
          <ThemeProvider>
            <TestNavigator />
          </ThemeProvider>
        </ErrorProvider>
      </NetworkProvider>
    );

    // スワイプ画面が表示されるのを待つ
    await waitFor(() => expect(getByTestId('swipe-screen')).toBeTruthy());
    
    // おすすめタブをタップ
    fireEvent.press(getByText(/おすすめ/i));
    
    // おすすめ画面に遷移することを確認
    await waitFor(() => expect(getByTestId('recommendations-screen')).toBeTruthy());
    
    // おすすめ商品リストが表示されていることを確認
    expect(getByTestId('recommendation-list')).toBeTruthy();
  });

  it('Navigate from Swipe to Profile tab and logout', async () => {
    const { getByTestId, getByText } = render(
      <NetworkProvider>
        <ErrorProvider>
          <ThemeProvider>
            <TestNavigator />
          </ThemeProvider>
        </ErrorProvider>
      </NetworkProvider>
    );

    // スワイプ画面が表示されるのを待つ
    await waitFor(() => expect(getByTestId('swipe-screen')).toBeTruthy());
    
    // マイページタブをタップ
    fireEvent.press(getByText(/マイページ/i));
    
    // プロフィール画面に遷移することを確認
    await waitFor(() => expect(getByTestId('profile-screen')).toBeTruthy());
    
    // ログアウトボタンをタップ
    fireEvent.press(getByTestId('logout-button'));
    
    // 確認ダイアログが表示されるのを待つ
    await waitFor(() => expect(getByText(/ログアウトしますか/i)).toBeTruthy());
    
    // 確認ボタンをタップ
    fireEvent.press(getByTestId('confirm-button'));
    
    // ログイン画面に遷移することを確認
    await waitFor(() => expect(getByText(/ログイン/i)).toBeTruthy());
  });
});
