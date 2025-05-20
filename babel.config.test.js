/**
 * テスト用Babel設定
 * Expo SDK 53 / React Native 0.79用に最適化
 * 2025-05-20更新
 */

module.exports = function(api) {
  api.cache(true);
  return {
    presets: [
      ['babel-preset-expo', {
        // テスト用に最適化
        lazyImports: false,
        disableImportExportTransform: false,
        unstable_enablePackageExports: false,
      }]
    ],
    plugins: [
      // Bridgeless モードを無効化するプラグイン設定
      'babel-plugin-transform-react-jsx',
      '@babel/plugin-transform-runtime',
      // モジュール解決の設定
      ['module-resolver', {
        alias: {
          // 問題のモジュールをダミーに置き換え
          'react-native/Libraries/TurboModule': './src/__mocks__/emptyModule',
          'react-native/src/private/devmenu': './src/__mocks__/emptyModule',
          'react-native/src/private/specs_DEPRECATED': './src/__mocks__/emptyModule',
          // expo-image のモック
          'expo-image': './src/__mocks__/expo-image.js',
          // @babel/runtime ヘルパーのCommonJS版を使用
          '@babel/runtime/helpers': './node_modules/@babel/runtime/helpers/esm',
        },
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      }],
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
    // 環境別設定
    env: {
      test: {
        plugins: [
          // テスト環境専用の設定
          'react-native-reanimated/plugin',
        ],
      },
      production: {
        plugins: ['transform-remove-console'],
      },
    },
  };
};
