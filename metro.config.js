/**
 * Metro configuration for React Native with Expo SDK 53
 * https://docs.expo.dev/guides/customizing-metro/
 */

const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

// デフォルト設定を取得
const config = getDefaultConfig(__dirname);

// Resolver設定（モジュール解決）
// babel-plugin-module-resolverと連携するため、extraNodeModulesを追加
config.resolver = {
  ...config.resolver,
  extraNodeModules: {
    '@': path.resolve(__dirname, 'src'),
    '@/components': path.resolve(__dirname, 'src/components'),
    '@/screens': path.resolve(__dirname, 'src/screens'),
    '@/services': path.resolve(__dirname, 'src/services'),
    '@/utils': path.resolve(__dirname, 'src/utils'),
    '@/hooks': path.resolve(__dirname, 'src/hooks'),
    '@/contexts': path.resolve(__dirname, 'src/contexts'),
    '@/navigation': path.resolve(__dirname, 'src/navigation'),
    '@/types': path.resolve(__dirname, 'src/types'),
    '@/assets': path.resolve(__dirname, 'src/assets'),
    '@/constants': path.resolve(__dirname, 'src/constants'),
    '@/styles': path.resolve(__dirname, 'src/styles'),
    '@/store': path.resolve(__dirname, 'src/store'),
    '@/lib': path.resolve(__dirname, 'src/lib'),
    '@/batch': path.resolve(__dirname, 'src/batch'),
    '@/scripts': path.resolve(__dirname, 'src/scripts'),
    '@/tests': path.resolve(__dirname, 'src/tests'),
  },
};

module.exports = config;
