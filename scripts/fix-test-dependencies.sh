#!/bin/bash
# fix-test-dependencies.sh
# テスト環境用の依存関係を修正するスクリプト

echo "🔧 テスト環境の依存関係修正を開始します..."

# babel-plugin-transform-react-jsx が存在するか確認して、なければインストール
if ! npm list babel-plugin-transform-react-jsx --depth=0 | grep -q babel-plugin-transform-react-jsx; then
  echo "📦 babel-plugin-transform-react-jsx をインストールします..."
  npm install --save-dev babel-plugin-transform-react-jsx
else
  echo "✅ babel-plugin-transform-react-jsx は既にインストールされています"
fi

# @babel/plugin-transform-react-jsx も念のためインストール
if ! npm list @babel/plugin-transform-react-jsx --depth=0 | grep -q @babel/plugin-transform-react-jsx; then
  echo "📦 @babel/plugin-transform-react-jsx をインストールします..."
  npm install --save-dev @babel/plugin-transform-react-jsx
else
  echo "✅ @babel/plugin-transform-react-jsx は既にインストールされています"
fi

# テスト用のBabel設定を最適化
echo "📦 babel.config.test.js の更新..."
cat > babel.config.test.js << 'EOL'
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Bridgeless モードを無効化するプラグイン設定
      // 注意: 新旧両方の命名規則をサポート
      'babel-plugin-transform-react-jsx',
      ['module-resolver', {
        alias: {
          // 問題のモジュールをダミーに置き換え
          'react-native/Libraries/TurboModule': './src/__mocks__/emptyModule',
          'react-native/src/private/devmenu': './src/__mocks__/emptyModule',
          'react-native/src/private/specs_DEPRECATED': './src/__mocks__/emptyModule',
          // expo-image のモック
          'expo-image': './src/__mocks__/expo-image.js',
        },
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      }],
    ],
    // 統合されたenv設定
    env: {
      test: {
        plugins: [
          // テスト環境専用の設定
          'react-native-reanimated/plugin',
          // Package Exports 機能の無効化
          ['babel-plugin-transform-imports', {
            'react-native': {
              transform: 'react-native/index',
              preventFullImport: false,
            },
            '@babel/runtime/helpers': {
              transform: '@babel/runtime/helpers/${member}',
              preventFullImport: true
            }
          }],
        ],
        presets: [
          ['babel-preset-expo', {
            // テスト用に最適化
            lazyImports: false,
            disableImportExportTransform: true,
            unstable_enablePackageExports: false,
          }]
        ]
      },
      production: {
        plugins: ['transform-remove-console'],
      },
    },
  };
};
EOL

# jest.config.jsの更新
echo "📦 jest.config.js の更新..."
cat > jest.config.js << 'EOL'
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
  
  // ES Modules設定
  extensionsToTreatAsEsm: ['.ts', '.tsx'],
  
  // テスト実行前の前処理
  transform: {
    '^.+\\.(js|jsx|ts|tsx|mjs)$': ['babel-jest', {
      configFile: './babel.config.test.js',
      // 古いBabel JSXプラグインを使用
      plugins: ['babel-plugin-transform-react-jsx']
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
    // 問題のある setup.js ファイルをモック
    'react-native/jest/setup': '<rootDir>/src/__mocks__/react-native-jest-setup.js',
    '@babel/runtime/helpers/(.*)': '<rootDir>/node_modules/@babel/runtime/helpers/$1.js',
    // babel系のプラグインモック
    'babel-plugin-transform-react-jsx': '<rootDir>/node_modules/babel-plugin-transform-react-jsx'
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
EOL

echo "📦 基本テスト用の空モックディレクトリ作成..."
mkdir -p src/__mocks__

# emptyModule.jsの作成
if [ ! -f src/__mocks__/emptyModule.js ]; then
  echo "export default {};" > src/__mocks__/emptyModule.js
fi

# viewNativeComponent.jsの作成
if [ ! -f src/__mocks__/viewNativeComponent.js ]; then
  echo "export default 'ViewNativeComponent';" > src/__mocks__/viewNativeComponent.js
fi

# svgMock.jsの作成
if [ ! -f src/__mocks__/svgMock.js ]; then
  echo "export default 'SvgMock';" > src/__mocks__/svgMock.js
fi

# expo-image.jsの作成
if [ ! -f src/__mocks__/expo-image.js ]; then
  cat > src/__mocks__/expo-image.js << 'EOL'
export const Image = (props) => props.children || null;
export default {
  Image: (props) => props.children || null,
};
EOL
fi

# react-native-jest-setup.jsの作成
if [ ! -f src/__mocks__/react-native-jest-setup.js ]; then
  echo "// RN setup mock" > src/__mocks__/react-native-jest-setup.js
fi

echo "✅ テスト環境依存関係の修正が完了しました！"
