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
      // React JSX変換
      'babel-plugin-transform-react-jsx',
      // @babel/runtimeの設定
      ['@babel/plugin-transform-runtime', {
        helpers: true,
        regenerator: true,
        // ESModulesを使用しない設定
        useESModules: false
      }],
      // モジュール解決の設定
      ['module-resolver', {
        alias: {
          // 問題のモジュールをダミーに置き換え
          'react-native/Libraries/TurboModule': './src/__mocks__/emptyModule',
          'react-native/src/private/devmenu': './src/__mocks__/emptyModule',
          'react-native/src/private/specs_DEPRECATED': './src/__mocks__/emptyModule',
          // フルパスエイリアス
          '@': './src',
        },
        extensions: ['.js', '.jsx', '.ts', '.tsx'],
      }],
    ],
    // 環境別設定
    env: {
      test: {
        plugins: [
          // テスト環境専用の設定
          ['@babel/plugin-transform-modules-commonjs', {
            strict: false,
            allowTopLevelThis: true,
            loose: true,
          }]
        ],
      },
      production: {
        plugins: ['transform-remove-console'],
      },
    },
  };
};
