// metro.config.js - simplified for CI compatibility with Metro 0.76.0
// React Native 0.73.x and Expo 53 compatible configuration
const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Basic TypeScript extension support
config.resolver.sourceExts = ['js', 'jsx', 'json', 'ts', 'tsx'];

// Disable cache for CI builds to avoid potential issues
if (process.env.CI) {
  config.cacheStores = [];
}

module.exports = config;
