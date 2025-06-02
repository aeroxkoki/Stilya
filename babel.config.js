module.exports = function(api) {
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
      // React Native Reanimatedプラグイン（最後に配置する必要がある）
      'react-native-reanimated/plugin',
    ],
  };
};
