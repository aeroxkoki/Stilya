module.exports = function(api) {
  const isTest = api.env('test');
  api.cache(true);
  
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // モジュール解決の設定を追加
      ['module-resolver', {
        root: ['.'],
        alias: {
          '@': './src',
        },
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
      }],
      // Conditional plugins - in test env we need to use different settings
      ...(isTest ? [] : ['nativewind/babel']),
      // Always included plugins
      'react-native-reanimated/plugin',
    ],
    env: {
      test: {
        plugins: [
          // Plugins for test environment only
          ['@babel/plugin-transform-runtime', { regenerator: true }],
          '@babel/plugin-transform-template-literals',
        ],
      },
    },
  };
};
