module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Bridgeless モードを無効化するプラグイン設定
      ['babel-plugin-transform-react-jsx', { runtime: 'automatic' }],
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