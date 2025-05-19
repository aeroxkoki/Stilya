/**
 * Jest configuration for Stilya
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
    '^.+\\.(js|jsx|ts|tsx)$': ['babel-jest', {
      presets: ['babel-preset-expo'],
      plugins: [
        'module-resolver',
        'nativewind/babel',
        'react-native-reanimated/plugin'
      ]
    }]
  },
  
  // 無視するパターン
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base)'
  ],
  
  // セットアップファイル
  setupFiles: ['./setup-jest.js'],
  
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
  ]
};
