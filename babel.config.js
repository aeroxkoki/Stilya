module.exports = function(api) {
  api.cache(true);
  
  // CI環境の検出
  const isCI = process.env.CI === 'true';
  const isTest = process.env.NODE_ENV === 'test';

  // テスト環境または CI 環境用の簡易設定
  if (isTest || isCI) {
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
