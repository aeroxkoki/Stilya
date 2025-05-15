// metro.config.js - Robust version for CI compatibility
const { getDefaultConfig } = require('@expo/metro-config');

// Create the default Expo metro config
const config = getDefaultConfig(__dirname);

// Add TypeScript extensions
config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'json'];

// Ensure we're using the correct transformer
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
};

// Avoid the Metro issue with location imports
config.transformer.allowOptionalDependencies = true;

// Disable cache for CI builds to avoid potential issues
if (process.env.CI) {
  config.cacheStores = [];
}

// Add additional resolver options
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;
