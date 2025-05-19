module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Reanimatedプラグインは必要なら残します
      'react-native-reanimated/plugin',
    ],
  };
};
