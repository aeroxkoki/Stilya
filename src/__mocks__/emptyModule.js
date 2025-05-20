/**
 * emptyModule.js
 * 空のモジュールを提供するモック
 * Expo SDK 53 (React Native 0.79) と互換性のあるバージョン
 */

// New Architecture 互換モック
module.exports = {
  // ダミー関数類
  get: jest.fn(() => null),
  getEnforcing: jest.fn(() => ({
    show: jest.fn(),
    hide: jest.fn(),
    reload: jest.fn(),
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
};

// ESM サポート
module.exports.default = module.exports;
