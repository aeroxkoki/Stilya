/**
 * emptyModule.js
 * 空のモジュールを提供するモック
 * Expo SDK 53 (React Native 0.79) と互換性のあるバージョン
 * 更新: 2025-05-20 ESMサポート強化
 */

// 基本的なダミーモック
const dummyMock = {
  // ダミー関数類
  get: jest.fn(() => null),
  getEnforcing: jest.fn(() => ({
    show: jest.fn(),
    hide: jest.fn(),
    reload: jest.fn(),
    then: jest.fn(cb => cb && cb()),
    catch: jest.fn(),
  })),
  
  // ツリーシェイキング関連
  unstable_settings: {
    enableBridgeless: false,
    isDevModeEnabled: true,
  },
  
  // DevMenu 用
  DevMenu: {
    reload: jest.fn(),
    show: jest.fn(),
    hide: jest.fn(),
  },
  
  // Fabricインフラストラクチャ関連
  unstable_enableLogBox: false,
  unstable_FrameRateLogger: { 
    setGlobalOptions: jest.fn(),
    setContext: jest.fn(),
  },
  
  // React Native コアコンポーネント
  View: 'View',
  Text: 'Text',
  Image: 'Image',
  
  // ESM互換性のための追加
  __esModule: true,
};

// CommonJSモード向け
module.exports = dummyMock;

// ESM サポート - ダイナミックにエクスポートを拡張
Object.keys(dummyMock).forEach(key => {
  module.exports[key] = dummyMock[key];
});

// Named exportとdefault exportの両方をサポート
module.exports.default = module.exports;

