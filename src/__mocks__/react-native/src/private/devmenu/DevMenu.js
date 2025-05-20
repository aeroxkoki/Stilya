/**
 * DevMenu モック
 * Expo SDK 53 (React Native 0.79) 向けに最適化
 */

const DevMenuMock = {
  show: jest.fn(),
  hide: jest.fn(),
  reload: jest.fn(),
  debugRemotely: jest.fn(),
  addItem: jest.fn(),
  openURL: jest.fn(),
  // New Architecture のツリーシェイキング設定用
  unstable_settings: {
    enableBridgeless: false,
    isEnabled: true,
    isDevModeEnabled: true,
  },
};

// CommonJS での export
module.exports = DevMenuMock;

// ESM / New Architecture 向けの export もサポート
module.exports.default = DevMenuMock;

// TurboModuleRegistry 互換用
module.exports.DevMenu = DevMenuMock;
