const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// TypeScript and module resolution optimizations
config.resolver.alias = {
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
};

module.exports = config;
