/**
 * Jest-Expoのモック
 * Object.definePropertyエラーを回避するために必要なダミー実装
 */

// 安全なモックオブジェクトを作成
const mockJestExpo = {
  // Preset関連のモック
  preset: {
    setupFiles: [],
    transform: {},
    transformIgnorePatterns: [],
    haste: { defaultPlatform: 'ios' },
  },
  
  // よく使われるヘルパーのモック
  createMockComponent: (displayName) => {
    const mock = () => null;
    mock.displayName = displayName;
    return mock;
  },
  
  // その他の内部プロパティ
  withWatchPlugins: () => mockJestExpo,
  withNoTests: () => mockJestExpo,
};

module.exports = mockJestExpo;
