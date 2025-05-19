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
    '^react-native$': '<rootDir>/src/__mocks__/react-native.js',
    '^react-native/Libraries/TurboModule/TurboModuleRegistry$': '<rootDir>/src/__mocks__/react-native/Libraries/TurboModule/TurboModuleRegistry.js',
    '^react-native/src/private/specs_DEPRECATED/modules/NativeDevMenu$': '<rootDir>/src/__mocks__/react-native/src/private/specs_DEPRECATED/modules/NativeDevMenu.js',
    '^react-native/src/private/devmenu/DevMenu$': '<rootDir>/src/__mocks__/react-native/src/private/devmenu/DevMenu.js'
  },
  
  // セットアップファイル
  setupFiles: [
    './setup-jest.js'
  ],
  
  // テスト環境
  testEnvironment: 'jsdom',
  
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
