/**
 * NativeDevMenu のモック
 * Expo SDK 53 (React Native 0.79) 向けに最適化
 */

module.exports = {
  default: {
    reload: jest.fn(),
    debugRemotely: jest.fn(),
    show: jest.fn(),
    hide: jest.fn(),
  },
  // モジュール自体のプロパティも提供
  reload: jest.fn(),
  debugRemotely: jest.fn(),
  show: jest.fn(),
  hide: jest.fn(),
  // getConstants メソッド追加
  getConstants: jest.fn(() => ({
    isEnabled: true,
    isDevModeEnabled: true,
  })),
};
