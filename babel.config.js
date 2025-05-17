// @ts-check
// Learn more https://docs.expo.dev/guides/customizing-metro
module.exports = function(api) {
  // This caches the Babel config
  api.cache.forever();
  
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
    ],
  };
};
