// Metro configuration for Expo/React Native
const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

// Get default config
const config = getDefaultConfig(__dirname);

// Avoid package export issues (New Architecture opt-out)
if (config.resolver) {
  config.resolver.unstable_enablePackageExports = false;
}

// GitHub Actions and EAS Build optimizations
if (process.env.CI || process.env.EAS_BUILD) {
  // Use terser for minification in build environments
  config.transformer.minifierPath = require.resolve('metro-minify-terser');
  config.transformer.minifierConfig = {};
  
  // Stability improvements for CI/EAS
  config.maxWorkers = 2;
  config.resetCache = true;
}

// Make sure we include all necessary file extensions
config.resolver.sourceExts = [
  'js', 'jsx', 'ts', 'tsx', 'json', 'cjs', 'mjs'
];

// Add support for module resolution from src directory
config.resolver.extraNodeModules = {
  '@': path.resolve(__dirname, 'src'),
};

// Enable Hermes for performance
config.transformer.hermesEnabled = true;

module.exports = config;
