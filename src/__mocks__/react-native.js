/**
 * React Native全体のモック
 * CI環境でのテスト実行のために最適化
 */

// DevMenuモックをオブジェクト定義
const DevMenuMock = {
  show: jest.fn(),
  hide: jest.fn(),
  reload: jest.fn(),
};

// TurboModuleRegistryモック
const TurboModuleRegistryMock = {
  get: jest.fn(() => null),
  getEnforcing: jest.fn((name) => {
    // 'DevMenu'の場合は専用モックを返す
    if (name === 'DevMenu') {
      return DevMenuMock;
    }
    // その他の基本的なメソッドを持つデフォルトモック
    return {
      show: jest.fn(),
      hide: jest.fn(),
      reload: jest.fn(),
    };
  }),
};

// 実際のReact Nativeライブラリ
const ActualReactNative = jest.requireActual('react-native');

// モックバージョンを作成
const ReactNativeMock = {
  // 実際のReact Nativeの内容を継承
  ...ActualReactNative,
  
  // プラットフォーム情報の上書き
  Platform: {
    ...ActualReactNative.Platform,
    OS: 'ios',
    Version: 14,
    select: obj => obj.ios || obj.default,
  },
  
  // ネイティブモジュールの上書き
  NativeModules: {
    ...ActualReactNative.NativeModules,
    DevMenu: DevMenuMock,
    DevSettings: { reload: jest.fn() },
    UIManager: {
      measure: jest.fn(),
      measureInWindow: jest.fn(),
      measureLayout: jest.fn(),
      getViewManagerConfig: jest.fn(),
    },
    // Expoサポート用モジュール
    ExpoModulesCore: {
      createSingletonModule: jest.fn(),
      createLegacyModule: jest.fn(),
    },
  },
  
  // アニメーション関連
  Animated: {
    ...ActualReactNative.Animated,
    Value: jest.fn(value => ({
      setValue: jest.fn(),
      interpolate: jest.fn(() => ({
        interpolate: jest.fn(),
      })),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      removeAllListeners: jest.fn(),
    })),
    timing: jest.fn(() => ({
      start: jest.fn(cb => cb && cb({ finished: true })),
      stop: jest.fn(),
      reset: jest.fn(),
    })),
    spring: jest.fn(() => ({
      start: jest.fn(cb => cb && cb({ finished: true })),
      stop: jest.fn(),
    })),
  },
  
  // その他必要なモック
  Image: {
    ...ActualReactNative.Image,
    resolveAssetSource: jest.fn(source => source),
  },
};

// TurboModuleRegistryを上書き
ReactNativeMock.TurboModuleRegistry = TurboModuleRegistryMock;

module.exports = ReactNativeMock;
