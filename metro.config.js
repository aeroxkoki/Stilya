/**
 * Expo Metro Config - Simple and Stable Configuration
 * 
 * Optimized for EAS Build in GitHub Actions environment
 */
const { getDefaultConfig } = require('@expo/metro-config');

/** @type {import('@expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add the additional `cjs` extension to the resolver
config.resolver.sourceExts.push('cjs');
config.resolver.extraNodeModules = {
  '@': `${__dirname}/src`,
};

// Disable unstable features that might cause serialization issues
config.resolver.unstable_enablePackageExports = false;

// For GitHub Actions compatibility
config.transformer.minifierPath = require.resolve('metro-minify-terser');
config.transformer.minifierConfig = {};
config.transformer.assetPlugins = ['expo-asset/tools/hashAssetFiles'];

// Disable cache for CI environment to avoid serialization issues
if (process.env.CI === 'true' || process.env.EXPO_NO_CACHE === 'true') {
  console.log('[Metro Config] Running in CI or with EXPO_NO_CACHE, disabling cache');
  config.cacheStores = [];
  config.resetCache = true;
}

module.exports = config;
