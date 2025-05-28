// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Path aliases for cleaner imports (Managed Workflow compatible)
config.resolver = {
  ...config.resolver,
  alias: {
    '@': path.resolve(__dirname, 'src'),
    '@/components': path.resolve(__dirname, 'src/components'),
    '@/screens': path.resolve(__dirname, 'src/screens'),
    '@/hooks': path.resolve(__dirname, 'src/hooks'),
    '@/services': path.resolve(__dirname, 'src/services'),
    '@/utils': path.resolve(__dirname, 'src/utils'),
    '@/types': path.resolve(__dirname, 'src/types'),
    '@/store': path.resolve(__dirname, 'src/store'),
    '@/constants': path.resolve(__dirname, 'src/constants'),
    '@/assets': path.resolve(__dirname, 'assets'),
  },
};

// Fix for React Native 0.76.5 compatibility
config.watchFolders = [path.resolve(__dirname)];
config.resetCache = true;

// Server configuration
config.server = {
  port: 8081,
};

module.exports = config;
