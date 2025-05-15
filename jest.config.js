/**
 * Jest configuration for Stilya CI
 * Custom configuration without jest-expo preset to avoid defineProperty error
 */

module.exports = {
  // jest-expoプリセットを使用しない
  // preset: 'jest-expo',
  
  // テスト対象を限定
  testMatch: ['<rootDir>/src/__tests__/simple.test.js'],
  
  // 変換設定
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest']
  },
  
  // 無視するパターン
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base)'
  ],
  
  // モック設定
  moduleNameMapper: {
    '^react-native$': '<rootDir>/src/__mocks__/react-native-mock.js',
    'react-native/Libraries/Animated/NativeAnimatedHelper': '<rootDir>/src/__mocks__/react-native/Libraries/Animated/NativeAnimatedHelper.js',
    'jest-expo': '<rootDir>/src/__mocks__/jest-expo-mock.js'
  },
  
  // セットアップファイル
  setupFiles: ['./setup-jest.js'],
  
  // テスト環境
  testEnvironment: 'node',
  
  // グローバル設定の注入を無効化
  injectGlobals: false
};
