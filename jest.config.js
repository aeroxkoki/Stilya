/**
<<<<<<< HEAD
 * Jest configuration for Stilya GitHub Actions tests
 * Simplified setup to ensure tests run reliably in CI environment
=======
 * Jest configuration for Stilya
>>>>>>> 59698aab13f46514ba5407315ff303272eb5d71d
 */

module.exports = {
  preset: 'jest-expo',
<<<<<<< HEAD
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
=======
  testMatch: ['<rootDir>/src/__tests__/simple.test.js'],
  setupFiles: ['./setup-jest.js'],
  transform: {
    '^.+\.(js|jsx|ts|tsx)$': ['babel-jest']
  },
  testEnvironment: 'jsdom'
>>>>>>> 59698aab13f46514ba5407315ff303272eb5d71d
};
