/**
 * Jest configuration for Stilya
 * CI環境で確実に動作するように最適化
 * Expo SDK 53 / React Native 0.79に対応
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
      configFile: './babel.config.test.js' // テスト用Babel設定
    }]
  },
  
  // 無視するパターン - CI環境でのエラーを防ぐために範囲を広げる
  transformIgnorePatterns: [
    'node_modules/(?!(jest-)?@?react-native|expo-.*|@react-native(-community)?|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@unimodules/.*|unimodules|sentry-expo|native-base|react-native-svg|react-native-reanimated|@babel/runtime/helpers/|@shopify/flash-list)'
  ],
  
  // モック設定
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '\\.svg': '<rootDir>/src/__mocks__/svgMock.js',
    // New Architecture 関連のモジュールを無効化
    'react-native/Libraries/TurboModule/(.*)': '<rootDir>/src/__mocks__/emptyModule.js',
    'react-native/Libraries/Components/View/ViewNativeComponent': '<rootDir>/src/__mocks__/viewNativeComponent.js',
    // expo-image のモック
    'expo-image': '<rootDir>/src/__mocks__/expo-image.js',
  },
  
  // セットアップファイル
  setupFiles: [
    './jest.setup.js'
  ],
  
  // テスト環境 - ESM対応のために'jest-environment-node'に変更
  testEnvironment: 'jest-environment-node',
  
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
    // Package Exportsを無効化する環境変数
    env: {
      NODE_OPTIONS: '--no-warnings --experimental-vm-modules',
      EAS_SKIP_JAVASCRIPT_BUNDLING: 'true',
      // Bridgeless解決用
      EXPO_USE_NATIVE_MODULES: 'false',
      RCT_NEW_ARCH_ENABLED: 'false',
      EX_DEV_CLIENT_NETWORK_INSPECTOR: 'false',
      EX_USE_METRO_LITE_SERVER: 'false',
      unstable_enablePackageExports: 'false',
    }
  }
};
