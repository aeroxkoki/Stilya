// metro.config.js - CI環境に最適化したバージョン
const { getDefaultConfig } = require('@expo/metro-config');

// Create the default Expo metro config
const config = getDefaultConfig(__dirname);

// Add TypeScript extensions
config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'json'];

// Ensure we're using the correct transformer
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
  minifierConfig: {
    keep_classnames: true,
    keep_fnames: true,
    mangle: {
      toplevel: false,
      keep_classnames: true,
      keep_fnames: true,
    },
    output: {
      ascii_only: true,
      quote_style: 3,
      wrap_iife: true,
    },
    sourceMap: {
      includeSources: false,
    },
    toplevel: false,
    compress: {
      reduce_funcs: false,
    },
  },
};

// Avoid the Metro issue with location imports
config.transformer.allowOptionalDependencies = true;

// Disable cache for CI builds to avoid potential issues
if (process.env.CI) {
  config.cacheStores = [];
  // Add optimizations for CI environment
  config.maxWorkers = 2; // Limit workers for CI
  config.resetCache = true; // Always reset cache in CI
}

// Add additional resolver options
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

// Add path alias support
config.resolver.extraNodeModules = {
  '@': `${__dirname}/src`,
};

module.exports = config;
