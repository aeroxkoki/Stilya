// @ts-check
// Learn more https://docs.expo.dev/guides/monorepos
// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('babel-preset-expo').ExpoPreset} */
module.exports = function(api) {
  // This caches the Babel config
  api.cache.forever();

  // Make Expo Router run from `src/app` instead of `app`.
  // Path is relative to the directory containing this file.
  
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
    ],
  };
};
