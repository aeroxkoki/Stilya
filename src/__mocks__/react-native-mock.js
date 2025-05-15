/**
 * React Nativeのモック
 * テスト環境でReact Nativeを安全に実行するためのモック
 */

// 基本コンポーネント・APIのモック
const RN = {
  // コンポーネント
  View: 'View',
  Text: 'Text',
  Image: 'Image',
  ScrollView: 'ScrollView',
  TouchableOpacity: 'TouchableOpacity',
  
  // APIのモック実装
  StyleSheet: {
    create: (styles) => styles,
    flatten: (styles) => styles,
  },
  
  Dimensions: {
    get: (dimension) => ({
      width: 375,
      height: 812,
      scale: 2,
      fontScale: 1,
    }),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  },
  
  Animated: {
    Value: jest.fn(() => ({
      interpolate: jest.fn(),
      setValue: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
    })),
    View: 'Animated.View',
    Text: 'Animated.Text',
    Image: 'Animated.Image',
    createAnimatedComponent: jest.fn((comp) => comp),
    timing: jest.fn(() => ({
      start: jest.fn((callback) => callback && callback()),
    })),
    spring: jest.fn(() => ({
      start: jest.fn((callback) => callback && callback()),
    })),
  },
  
  Platform: {
    OS: 'ios',
    select: jest.fn((obj) => obj.ios || obj.default),
    Version: 42,
  },
  
  // NativeModules
  NativeModules: {
    UIManager: {
      RCTView: {},
      getViewManagerConfig: jest.fn(() => ({})),
    },
  },
  
  // その他のAPIやユーティリティ
  Alert: {
    alert: jest.fn(),
  },
  
  AppState: {
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    currentState: 'active',
  },
  
  Linking: {
    openURL: jest.fn(),
    canOpenURL: jest.fn(() => Promise.resolve(true)),
  },
  
  // イベント処理
  PanResponder: {
    create: jest.fn(() => ({
      panHandlers: {},
    })),
  },
};

// デフォルトエクスポート
module.exports = RN;
