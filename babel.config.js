module.exports = function(api) {
  api.cache(true);
  
  const isTest = process.env.NODE_ENV === 'test';

  // テスト環境用の簡易設定
  if (isTest) {
    return {
      presets: ['babel-preset-expo'],
      plugins: ['react-native-reanimated/plugin']
    };
  }
  
  // 通常の開発/本番用設定
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      ['module-resolver', {
        root: ['./src'],
        alias: {
          '@': './src',
        },
      }],
      'react-native-reanimated/plugin',
    ],
  };
};
