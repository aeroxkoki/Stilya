
// Patched Metro configuration for export:embed compatibility
const { getDefaultConfig } = require('@expo/metro-config');
const path = require('path');

// Get the default metro config
const config = getDefaultConfig(__dirname);

// Fix for the serializer format issue
const createFixedSerializer = require('./patches/patched-serializer');
config.serializer = {
  ...config.serializer,
  createModuleIdFactory: () => (path) => {
    const projectRootPath = __dirname;
    if (path.includes('node_modules')) {
      const moduleName = path.split('node_modules/').pop().split('/')[0];
      return `node_modules/${moduleName}`;
    }
    return path.replace(projectRootPath, '');
  },
  // Make sure we use JSON format for serialization
  getSerializers: () => createFixedSerializer()
};

// Other important configurations
config.resolver.sourceExts.push('cjs');
config.resolver.extraNodeModules = {
  '@': `${__dirname}/src`,
};

// For GitHub Actions compatibility
config.transformer.minifierPath = require.resolve('metro-minify-terser');
config.transformer.minifierConfig = {};

module.exports = config;
