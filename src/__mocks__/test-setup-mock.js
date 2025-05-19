/**
 * React Native用のシンプルなセットアップモック
 * Jest環境で問題が発生しないように最小限のモックを提供
 */

// 標準的なReact Native機能のモック
jest.mock('react-native', () => {
  const ReactNative = jest.requireActual('react-native');

  // プラットフォーム検出をモック
  return Object.assign({}, ReactNative, {
    Platform: {
      ...ReactNative.Platform,
      OS: 'ios',
      Version: 12,
      isTesting: true,
      select: obj => obj.ios || obj.default
    },
    // その他のモック機能をここに追加
  });
});

// Reanimatedのモック
jest.mock('react-native-reanimated', () => {
  const Reanimated = jest.requireActual('react-native-reanimated/mock');
  
  // useSharedValue, useAnimatedStyleなどのモック
  Reanimated.useSharedValue = initial => ({ value: initial });
  Reanimated.useAnimatedStyle = style => style();
  Reanimated.withTiming = (value, config, callback) => {
    callback && callback(true);
    return value;
  };
  
  return Reanimated;
});

// Expoモジュールのモック
jest.mock('expo-file-system', () => ({
  documentDirectory: '/mock-documents/',
  cacheDirectory: '/mock-cache/',
  readAsStringAsync: jest.fn(() => Promise.resolve('mockedContent')),
  writeAsStringAsync: jest.fn(() => Promise.resolve())
}));

// その他のExpoモジュール
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve())
}));

// 画像コンポーネントのモック
jest.mock('expo-image', () => {
  return {
    Image: jest.fn().mockImplementation(() => null),
    ImageBackground: jest.fn().mockImplementation(() => null)
  };
});

// テスト環境用のダミーデータ
global.testData = {
  user: { id: 'test-user-id', email: 'test@example.com' },
  token: 'test-auth-token'
};
