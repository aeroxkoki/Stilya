// metro.config.js - 最適化済み設定
const { getDefaultConfig } = require('@expo/metro-config');

// Create the default Expo metro config
const config = getDefaultConfig(__dirname);

// Add TypeScript extensions
config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'json'];

// Basic transformer configuration
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
};

// Avoid the Metro issue with location imports
config.transformer.allowOptionalDependencies = true;

// Add additional resolver options
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Add path alias support
config.resolver.extraNodeModules = {
  '@': `${__dirname}/src`,
};

module.exports = config;