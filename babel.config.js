module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // react-native-reanimatedプラグインは最後に配置する必要がある
      // Hermesエンジンとの互換性のため
      ['react-native-reanimated/plugin', {
        relativeSourceLocation: true,
      }],
    ],
  };
};
