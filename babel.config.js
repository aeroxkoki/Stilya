module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './src',
          },
        },
      ],
      // react-native-reanimatedプラグインは必ず最後に配置
      'react-native-reanimated/plugin',
    ],
  };
};
