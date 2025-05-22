const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Resolver configuration
config.resolver = {
  ...config.resolver,
  sourceExts: [...config.resolver.sourceExts, 'cjs', 'mjs'],
  unstable_enablePackageExports: false,
  disableHierarchicalLookup: true,
};

// Transformer configuration  
config.transformer = {
  ...config.transformer,
  hermesEnabled: true,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

// Serializer configuration for compatibility
config.serializer = {
  ...config.serializer,
  customSerializer: null,
};

// Cache configuration
config.resetCache = process.env.CI === 'true';

module.exports = config;