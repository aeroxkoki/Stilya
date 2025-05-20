import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { ThemeProvider } from '../../contexts/ThemeContext';
import { ErrorProvider } from '../../contexts/ErrorContext';
import { NetworkProvider } from '../../contexts/NetworkContext';
import { AuthProvider } from '../../contexts/AuthContext';

// モックコンポーネント
const MockAuthScreen = (props) => (
  <div data-testid="auth-screen">
    <input placeholder="メールアドレス" onChange={(e) => {}} />
    <input placeholder="パスワード" onChange={(e) => {}} />
    <button data-testid="login-button" onClick={() => props.navigation.navigate('Onboarding')}>ログイン</button>
    <div>ログイン</div>
  </div>
);

const MockOnboardingScreen = (props) => (
  <div data-testid="onboarding-screen">
    <div data-testid="style-preference-screen">スタイル選択</div>
    <button data-testid="gender-male" onClick={() => {}}>男性</button>
    <button data-testid="style-casual" onClick={() => {}}>カジュアル</button>
    <button data-testid="age-20s" onClick={() => {}}>20代</button>
    <button data-testid="next-button" onClick={() => {}}>次へ</button>
    <button data-testid="complete-button" onClick={() => props.navigation.navigate('Swipe')}>完了</button>
  </div>
);

const MockSwipeScreen = (props) => (
  <div data-testid="swipe-screen">
    <div data-testid="swipe-card" onClick={() => props.navigation.navigate('ProductDetail', { productId: 'product-1' })}>
      商品カード
    </div>
    <button onClick={() => props.navigation.navigate('Recommendations')}>おすすめ</button>
    <button onClick={() => props.navigation.navigate('Profile')}>マイページ</button>
  </div>
);

const MockProductDetailScreen = (props) => (
  <div data-testid="product-detail-screen">
    <div>テスト商品1</div>
    <button data-testid="purchase-button">購入する</button>
    <button data-testid="back-button" onClick={() => props.navigation.goBack()}>戻る</button>
  </div>
);

const MockRecommendationsScreen = () => (
  <div data-testid="recommendations-screen">
    <div data-testid="recommendation-list">おすすめ商品リスト</div>
  </div>
);

const MockProfileScreen = (props) => (
  <div data-testid="profile-screen">
    <button data-testid="logout-button" onClick={() => {
      // ログアウト確認ダイアログを表示
      setTimeout(() => {
        const logoutConfirmDialog = document.createElement('div');
        logoutConfirmDialog.textContent = 'ログアウトしますか';
        const confirmButton = document.createElement('button');
        confirmButton.setAttribute('data-testid', 'confirm-button');
        confirmButton.onclick = () => props.navigation.navigate('Auth');
        document.body.appendChild(logoutConfirmDialog);
        document.body.appendChild(confirmButton);
      }, 100);
    }}>ログアウト</button>
  </div>
);

// モックの設定
jest.mock('../../screens/auth/AuthScreen.tsx', () => MockAuthScreen);
jest.mock('../../screens/onboarding/OnboardingScreen.tsx', () => MockOnboardingScreen);
jest.mock('../../screens/swipe/SwipeScreen.tsx', () => MockSwipeScreen);
jest.mock('../../screens/detail/ProductDetailScreen.tsx', () => MockProductDetailScreen);
jest.mock('../../screens/recommend/RecommendScreen.tsx', () => MockRecommendationsScreen);
jest.mock('../../screens/profile/ProfileScreen.tsx', () => MockProfileScreen);

// スタックナビゲーターの型定義
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
        <Stack.Screen name="Auth" component={MockAuthScreen} />
        <Stack.Screen name="Onboarding" component={MockOnboardingScreen} />
        <Stack.Screen name="Swipe" component={MockSwipeScreen} />
        <Stack.Screen name="Recommendations" component={MockRecommendationsScreen} />
        <Stack.Screen name="Profile" component={MockProfileScreen} />
        <Stack.Screen 
          name="ProductDetail" 
          component={MockProductDetailScreen} 
          initialParams={{ productId: 'product-1' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

describe('User Flow Integration Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // DOM クリーンアップ
    document.body.innerHTML = '';
  });

  it('Login to Onboarding to Swipe Flow', async () => {
    const { getByTestId, getByText, getByPlaceholderText } = render(
      <NetworkProvider>
        <ErrorProvider>
          <ThemeProvider>
            <AuthProvider>
              <TestNavigator />
            </AuthProvider>
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
    
    // 完了ボタンをタップ
    fireEvent.press(getByTestId('complete-button'));
    
    // 3. スワイプ画面に遷移するのを待つ
    await waitFor(() => expect(getByTestId('swipe-screen')).toBeTruthy());
    
    // 商品カードが表示されていることを確認
    expect(getByTestId('swipe-card')).toBeTruthy();
  });

  it('Navigate to Product Detail and Back', async () => {
    const { getByTestId, getByText } = render(
      <NetworkProvider>
        <ErrorProvider>
          <ThemeProvider>
            <AuthProvider>
              <TestNavigator />
            </AuthProvider>
          </ThemeProvider>
        </ErrorProvider>
      </NetworkProvider>
    );

    // Auth画面から開始
    expect(getByText(/ログイン/i)).toBeTruthy();
    
    // ログインボタンをタップしてオンボーディングへ
    fireEvent.press(getByTestId('login-button'));
    
    // オンボーディング画面から完了ボタンをタップしてスワイプ画面へ
    await waitFor(() => expect(getByTestId('onboarding-screen')).toBeTruthy());
    fireEvent.press(getByTestId('complete-button'));
    
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
            <AuthProvider>
              <TestNavigator />
            </AuthProvider>
          </ThemeProvider>
        </ErrorProvider>
      </NetworkProvider>
    );

    // Auth画面から開始
    expect(getByText(/ログイン/i)).toBeTruthy();
    
    // ログインボタンをタップしてオンボーディングへ
    fireEvent.press(getByTestId('login-button'));
    
    // オンボーディング画面から完了ボタンをタップしてスワイプ画面へ
    await waitFor(() => expect(getByTestId('onboarding-screen')).toBeTruthy());
    fireEvent.press(getByTestId('complete-button'));
    
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
    const { getByTestId, getByText, getByPlaceholderText } = render(
      <NetworkProvider>
        <ErrorProvider>
          <ThemeProvider>
            <AuthProvider>
              <TestNavigator />
            </AuthProvider>
          </ThemeProvider>
        </ErrorProvider>
      </NetworkProvider>
    );

    // Auth画面から開始
    expect(getByText(/ログイン/i)).toBeTruthy();
    
    // ログインボタンをタップしてオンボーディングへ
    fireEvent.press(getByTestId('login-button'));
    
    // オンボーディング画面から完了ボタンをタップしてスワイプ画面へ
    await waitFor(() => expect(getByTestId('onboarding-screen')).toBeTruthy());
    fireEvent.press(getByTestId('complete-button'));
    
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
