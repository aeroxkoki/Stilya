// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add TypeScript and module resolution optimizations
config.resolver = {
  ...config.resolver,
  alias: {
    '@': './src',
    '@/components': './src/components',
    '@/screens': './src/screens',
    '@/hooks': './src/hooks',
    '@/services': './src/services',
    '@/utils': './src/utils',
    '@/types': './src/types',
    '@/store': './src/store',
    '@/constants': './src/constants',
    '@/assets': './assets',
  },
};

module.exports = config;
