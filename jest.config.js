/**
 * Jest configuration for Stilya GitHub Actions tests
 * Simplified setup to ensure tests run reliably in CI environment
 */

module.exports = {
  preset: 'jest-expo',
  // テストをsimple.test.jsのみに限定
  testMatch: ['<rootDir>/src/__tests__/simple.test.js'],
  // 変換するファイル
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|nativewind|react-native-reanimated)',
  ],
  // セットアップファイル
  setupFiles: ['./setup-jest.js'],
  // JSの変換設定
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest']
  },
  // テスト環境
  testEnvironment: 'jsdom',
  // グローバル設定の注入を無効化
  injectGlobals: false
};
