module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // パスエイリアスの設定
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
          },
        },
      ],
      // react-native-reanimatedプラグインは最後に配置する必要がある
      // Hermesエンジンとの互換性のため
      'react-native-reanimated/plugin',
    ],
  };
};
