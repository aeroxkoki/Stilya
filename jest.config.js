/**
 * Jest configuration for Stilya
 * CI環境で確実に動作するように最適化
 */

module.exports = {
  // jest-expo プリセットを使用
  preset: 'jest-expo',
  
  // テスト対象を拡張
  testMatch: [
    '<rootDir>/src/__tests__/**/*.test.{js,jsx,ts,tsx}'
  ],
  
  // 変換設定
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest'
  },
  
  // 無視するパターン - CI環境でのエラーを防ぐために範囲を広げる
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?@?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-native-reanimated)'
  ],
  
  // モック設定
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.svg': '<rootDir>/src/__mocks__/svgMock.js'
  },
  
  // セットアップファイル
  setupFiles: [
    './setup-jest.js'
  ],
  
  // テスト環境
  testEnvironment: 'node',
  
  // グローバル設定の注入を有効化
  injectGlobals: true,
  
  // カバレッジ設定
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/__mocks__/**',
    '!src/__tests__/**'
  ],
  
  // テスト実行タイムアウト - CI環境では長めに設定
  testTimeout: 30000,
  
  // スナップショット設定
  snapshotSerializers: [
    'jest-serializer-path'
  ],
  
  // テスト結果レポーター
  reporters: [
    'default',
    ['jest-junit', {
      outputDirectory: 'test-results',
      outputName: 'junit.xml',
      classNameTemplate: '{classname}',
      titleTemplate: '{title}',
      ancestorSeparator: ' › ',
      suiteNameTemplate: '{filename}',
      includeConsoleOutput: true
    }]
  ],
  
  // その他の設定
  globals: {
    __DEV__: true,
  },
  
  // React Native向けの設定
  haste: {
    defaultPlatform: 'ios',
    platforms: ['ios', 'android'],
  }
};
