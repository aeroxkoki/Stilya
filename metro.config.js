/**
 * Modified Metro Config for Expo export:embed compatibility
 * 
 * This configuration fixes the "Serializer did not return expected format" error
 * in GitHub Actions environments.
 */
const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

// Get patched serializer
const createFixedSerializer = require('./patches/patched-serializer');

// Get default Expo config
const config = getDefaultConfig(__dirname);

// Enhanced serializer configuration
config.serializer = {
  ...config.serializer,
  getModulesRunBeforeMainModule: () => [],
  getPolyfills: () => [],
  getRunModuleStatement: (moduleId) => `globalThis.__r(${moduleId});`,
  createModuleIdFactory: () => (path) => {
    const projectRootPath = __dirname;
    if (path.includes('node_modules')) {
      const moduleName = path.split('node_modules/').pop().split('/')[0];
      return `node_modules/${moduleName}`;
    }
    return path.replace(projectRootPath, '');
  },
  // Use our patched serializer
  getSerializers: () => createFixedSerializer()
};

// Additional configurations for better compatibility
config.resolver.sourceExts.push('cjs');
config.resolver.extraNodeModules = {
  '@': `${__dirname}/src`,
};

// Use terser minifier for better GitHub Actions compatibility
config.transformer.minifierPath = require.resolve('metro-minify-terser');
config.transformer.minifierConfig = {};

// Disable cache for export:embed to prevent serialization issues
const args = process.argv || [];
if (args.includes('export:embed') || args.includes('--non-interactive') || 
    process.env.EXPO_NO_CACHE === 'true' || process.env.GITHUB_ACTIONS === 'true') {
  console.log('[Metro Config] Building with cache disabled for export:embed or CI');
  config.cacheStores = [];
  config.resetCache = true;
}

// Export for other configuration files to use
module.exports = config;
