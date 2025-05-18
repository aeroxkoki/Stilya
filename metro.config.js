/**
 * Expo Metro Config - Simple and Stable Configuration
 * 
 * This configuration follows official Expo recommendations to fix
 * the "Serializer did not return expected format" error
 */
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Specific fixes for export:embed serialization issues
config.resolver.unstable_enablePackageExports = false; // Disable ES Module resolution issues

// Fix serializer format for export:embed
config.serializer = {
  ...config.serializer,
  // The key is to NOT override the getSerializers function
  // which is properly configured by Expo's default config
};

// Ensure proper asset plugins are included
config.transformer = {
  ...config.transformer,
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  // Using terser minifier for compatibility
  minifierPath: require.resolve('metro-minify-terser'),
  minifierConfig: {}
};

// Disable cache for export operations to avoid serialization issues
const args = process.argv || [];
if (args.includes('export:embed') || process.env.EXPO_NO_CACHE === 'true') {
  console.log('[Metro Config] Building with cache disabled for export operation');
  config.cacheStores = [];
  config.resetCache = true;
}

module.exports = config;
