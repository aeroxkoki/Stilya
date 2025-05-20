/**
 * Jest configuration for Stilya
 * CI環境で確実に動作するように最適化
 * Expo SDK 53 / React Native 0.79に対応
 * 最終更新: 2025-05-21
 */

module.exports = {
  // jest-expo プリセットを使用
  preset: 'jest-expo',
  
  // テスト対象を拡張
  testMatch: [
    '<rootDir>/src/__tests__/**/*.test.{js,jsx,ts,tsx}'
  ],
  
  // テスト実行前の前処理
  transform: {
    '^.+\\.(js|jsx|ts|tsx|mjs)$': ['babel-jest', {
      configFile: './babel.config.test.js',
    }]
  },
  
  // モジュールトランスフォームの前処理が必要
  // React Native のコアモジュールをトランスフォーム対象に含める
  // @babel/runtimeも明示的にトランスフォーム対象に含める
  transformIgnorePatterns: [
    'node_modules/(?!(((jest-)?react-native|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|expo-modules-core|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-native-reanimated|@babel/runtime)/)))'
  ],
  
  // モック設定 - 問題のあるモジュールを直接モックに置き換え
  moduleNameMapper: {
    // パス別名
    '^@/(.*)$': '<rootDir>/src/$1',
    // ファイル形式別モック
    '\\.svg': '<rootDir>/src/__mocks__/svgMock.js',
    // New Architecture 関連のモジュールを無効化
    'react-native/Libraries/TurboModule/(.*)': '<rootDir>/src/__mocks__/emptyModule.js',
    'react-native/Libraries/Components/View/ViewNativeComponent': '<rootDir>/src/__mocks__/viewNativeComponent.js',
    'react-native/src/private/specs_DEPRECATED/(.*)': '<rootDir>/src/__mocks__/emptyModule.js',
    // ESM互換性問題のモジュール
    'react-native/jest/setup': '<rootDir>/src/__mocks__/react-native-jest-setup.js',
    // expo-image のモック
    'expo-image': '<rootDir>/src/__mocks__/expo-image.js',
    // babel-runtime ヘルパーの解決
    '@babel/runtime/helpers/(.*)': '<rootDir>/node_modules/@babel/runtime/helpers/$1',
    // expo-modules-core の ESM 問題を解決 - より具体的なモックを使用
    'expo-modules-core/web/index.web.ts': '<rootDir>/src/__mocks__/expo-modules-core/web/index.web.js',
    'expo-modules-core/web/index.web': '<rootDir>/src/__mocks__/expo-modules-core/web/index.web.js',
    'expo-modules-core/web/CoreModule': '<rootDir>/src/__mocks__/expo-modules-core/web/CoreModule.js',
    'expo-modules-core/index': '<rootDir>/src/__mocks__/expo-modules-core/index.js',
    'expo-modules-core': '<rootDir>/src/__mocks__/expo-modules-core/index.js',
  },
  
  // セットアップファイル
  setupFiles: [
    './jest.setup.js'
  ],
  
  // テスト環境 - NodeJS環境に設定
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
    // New Architecture 無効化フラグ
    RN$Bridgeless: false,
    // DevTools を無効化
    __REACT_DEVTOOLS_GLOBAL_HOOK__: { isDisabled: true },
    // Hermes エンジンを模倣
    HermesInternal: null,
  },
  
  // React Native向けの設定
  haste: {
    defaultPlatform: 'ios',
    platforms: ['ios', 'android'],
  },
  
  // 環境変数設定
  testEnvironmentOptions: {
    env: {
      NODE_OPTIONS: '--no-warnings --experimental-vm-modules',
      EAS_SKIP_JAVASCRIPT_BUNDLING: 'true',
      // Bridgeless解決用
      EXPO_USE_NATIVE_MODULES: 'false',
      RCT_NEW_ARCH_ENABLED: 'false',
      EX_DEV_CLIENT_NETWORK_INSPECTOR: 'false',
      BABEL_ENV: 'test',
      unstable_enablePackageExports: 'false',
    }
  }
};
