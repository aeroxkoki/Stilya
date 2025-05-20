module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Bridgeless モードを無効化するプラグイン設定
      ['@babel/plugin-transform-react-jsx', { runtime: 'automatic' }],
      ['module-resolver', {
        alias: {
          // 問題のモジュールをダミーに置き換え
          'react-native/Libraries/TurboModule': './src/__mocks__/emptyModule',
          'react-native/src/private/devmenu': './src/__mocks__/emptyModule',
          'react-native/src/private/specs_DEPRECATED': './src/__mocks__/emptyModule',
        },
      }],
    ],
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