// Simple compatible metro.config.js for Expo SDK 53
const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Basic resolver configuration
config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'json'];
config.resolver.extraNodeModules = {
  '@': `${__dirname}/src`,
};

module.exports = config;
