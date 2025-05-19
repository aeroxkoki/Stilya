/**
 * React Native用のシンプルなセットアップモック
 * Jest環境で問題が発生しないように最小限のモックを提供
 */

// 先にTurboModuleRegistryをモック
jest.mock('react-native/Libraries/TurboModule/TurboModuleRegistry', () => ({
  get: jest.fn(() => null),
  getEnforcing: jest.fn(() => {
    return {
      show: jest.fn(),
      hide: jest.fn(),
      reload: jest.fn(),
    };
  }),
}));

// DevMenuをモック
jest.mock('react-native/src/private/specs_DEPRECATED/modules/NativeDevMenu', () => ({
  default: {
    show: jest.fn(),
    hide: jest.fn(),
    reload: jest.fn(),
  },
}));

// React Nativeをモック
jest.mock('react-native', () => {
  // 実際のモジュール構造を保持しながら必要な部分だけをモック
  const RN = jest.requireActual('react-native');
  
  return {
    // 実際のモジュールのコピー
    ...RN,
    // プラットフォーム情報をオーバーライド
    Platform: {
      ...RN.Platform,
      OS: 'ios',
      Version: 14,
      isPad: false,
      isTesting: true,
      select: obj => obj.ios || obj.default,
    },
    // その他必要なモック
    NativeModules: {
      ...RN.NativeModules,
      DevSettings: { reload: jest.fn() },
      DevMenu: { show: jest.fn() },
      UIManager: {
        ...RN.NativeModules.UIManager,
        getViewManagerConfig: jest.fn(),
        measure: jest.fn(),
        measureInWindow: jest.fn(),
      },
    },
    // アニメーション関連
    Animated: {
      ...RN.Animated,
      timing: jest.fn(() => ({
        start: jest.fn(cb => cb && cb({ finished: true })),
        reset: jest.fn(),
        stop: jest.fn(),
      })),
      spring: jest.fn(() => ({
        start: jest.fn(cb => cb && cb({ finished: true })),
      })),
      Value: jest.fn(value => ({
        setValue: jest.fn(),
        interpolate: jest.fn(() => ({
          interpolate: jest.fn(),
        })),
        addListener: jest.fn(),
        removeListener: jest.fn(),
        removeAllListeners: jest.fn(),
      })),
    },
  };
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

// Gesture Handlerのモック
jest.mock('react-native-gesture-handler', () => {
  const GestureHandler = jest.requireActual('react-native-gesture-handler/jestSetup');
  return {
    ...GestureHandler,
    Swipeable: jest.fn().mockImplementation(() => null),
    DrawerLayout: jest.fn().mockImplementation(() => null),
    PanGestureHandler: jest.fn().mockImplementation(props => props.children),
    TapGestureHandler: jest.fn().mockImplementation(props => props.children),
  };
});

// Expoモジュールのモック
jest.mock('expo-file-system', () => ({
  documentDirectory: '/mock-documents/',
  cacheDirectory: '/mock-cache/',
  readAsStringAsync: jest.fn(() => Promise.resolve('mockedContent')),
  writeAsStringAsync: jest.fn(() => Promise.resolve()),
  getInfoAsync: jest.fn(() => Promise.resolve({ exists: true, isDirectory: false })),
  makeDirectoryAsync: jest.fn(() => Promise.resolve()),
  downloadAsync: jest.fn(() => Promise.resolve({ uri: '/mock-cache/downloaded-file' })),
}));

// その他のExpoモジュール
jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(() => Promise.resolve(null)),
  setItemAsync: jest.fn(() => Promise.resolve()),
  deleteItemAsync: jest.fn(() => Promise.resolve()),
}));

// 画像コンポーネントのモック
jest.mock('expo-image', () => {
  return {
    Image: 'Image',
    ImageBackground: 'ImageBackground',
  };
});

// AsyncStorageのモック
jest.mock('@react-native-async-storage/async-storage', () => ({
  getItem: jest.fn(() => Promise.resolve(null)),
  setItem: jest.fn(() => Promise.resolve(null)),
  removeItem: jest.fn(() => Promise.resolve(null)),
  getAllKeys: jest.fn(() => Promise.resolve([])),
  multiGet: jest.fn(() => Promise.resolve([])),
}));

// テスト環境用のグローバル設定
global.__reanimatedWorkletInit = jest.fn();
global._WORKLET = false;
global.__DEV__ = true;

// テスト環境用のダミーデータ
global.testData = {
  user: { id: 'test-user-id', email: 'test@example.com' },
  token: 'test-auth-token',
};
