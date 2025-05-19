/**
 * Metro configuration specifically designed to fix serialization issues
 * with Expo EAS build and GitHub Actions
 */
const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

/** @type {import('@expo/metro-config').MetroConfig} */
const defaultConfig = getDefaultConfig(__dirname);

// Fix for export:embed serialization issue
const config = {
  ...defaultConfig,
  
  // Critical: Configure serialization options for export:embed
  serializer: {
    ...defaultConfig.serializer,
    getModulesRunBeforeMainModule: () => [],
    getPolyfills: () => [],
    createModuleIdFactory: () => (path) => path,
    processModuleFilter: (module) => true,
  },
  
  // Enable better source map handling
  transformer: {
    ...defaultConfig.transformer,
    minifierPath: require.resolve('metro-minify-terser'),
    minifierConfig: {
      // Simplified minifier config
      compress: { unused: true },
      mangle: true,
      output: { comments: false }
    },
    // Avoid experimental features
    experimentalImportSupport: false,
    inlineRequires: true,
  },
  
  // Allow stable resolution
  resolver: {
    ...defaultConfig.resolver,
    useWatchman: false,
    sourceExts: [...defaultConfig.resolver.sourceExts, 'cjs', 'mjs'],
    // Avoid unstable features
    unstable_enablePackageExports: false,
    // Disable hierarchical lookup for speed
    disableHierarchicalLookup: true,
  }
};

// Disable cache for CI/EAS environment
if (process.env.CI === 'true' || 
    process.env.EXPO_NO_CACHE === 'true' || 
    process.env.EAS_BUILD === 'true') {
  console.log('[Metro Config] Running in CI/EAS environment, disabling cache');
  config.resetCache = true;
}

module.exports = config;
