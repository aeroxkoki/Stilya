const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// NativeWind support (暫定的にコメントアウト)
// const nativeWindConfig = withNativeWind(config, { input: './src/styles/global.css' });

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

// Performance optimizations
config.transformer.minifierConfig = {
  keep_fnames: true,
  mangle: {
    keep_fnames: true,
  },
};

// Asset optimization
config.resolver.assetExts = [
  ...config.resolver.assetExts,
  'bin',
  'txt',
  'jpg',
  'png',
  'json',
  'svg',
  'webp',
];

// Source map support for debugging
config.serializer.map = true;

// Cache configuration for better performance
config.cacheStores = [
  {
    name: 'default',
    type: 'FileStore',
  },
];

// Reset cache in development
if (process.env.NODE_ENV === 'development') {
  config.resetCache = true;
}

module.exports = config;