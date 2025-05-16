module.exports = function(api) {
  // キャッシュを一度だけ設定
  api.cache(true);
  
  // processベースでテスト環境を検出（api.envは使わない）
  const isTest = process.env.NODE_ENV === 'test';
  
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // モジュール解決の設定
      ['module-resolver', {
        root: ['.'],
        alias: {
          '@': './src',
        },
        extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
      }],
      // NativeWind - 本番環境のみ
      ...(isTest ? [] : ['nativewind/babel']),
      // Reanimated - 常に含める
      'react-native-reanimated/plugin',
    ],
    env: {
      production: {
        plugins: [
          'transform-remove-console',
          'transform-remove-debugger',
        ],
      },
      test: {
        plugins: [
          '@babel/plugin-transform-runtime',
          '@babel/plugin-transform-template-literals',
        ],
      },
    },
  };
};