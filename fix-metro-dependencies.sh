#!/bin/bash
# Fix for Expo SDK 53 + GitHub Actions compatibility issues

echo "Installing and fixing dependencies for Expo SDK 53 + GitHub Actions compatibility..."

# Clean up caches that might be causing issues
rm -rf node_modules/.cache
npm cache clean --force || true

# More aggressive cleanup to prevent module conflicts
rm -rf node_modules/metro* || true
rm -rf node_modules/@expo/metro* || true

# Install correct Metro dependencies
npm install --save-dev metro@0.76.8 metro-config@0.76.8 metro-core@0.76.8
npm install --save-dev metro-react-native-babel-transformer@0.76.8 metro-resolver@0.76.8
npm install --save-dev metro-runtime@0.76.8 metro-source-map@0.76.8 metro-transform-worker@0.76.8
npm install --save-dev metro-minify-terser@0.76.8
npm install --save-dev @expo/metro-config@~0.10.0

# Create a compatible metro.config.js
cat > metro.config.js << 'METRO_CONFIG'
// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('@expo/metro-config');

/** @type {import('@expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add the additional `cjs` extension to the resolver
config.resolver.sourceExts.push('cjs');
config.resolver.extraNodeModules = {
  '@': `${__dirname}/src`,
};

// For GitHub Actions compatibility
config.transformer.minifierPath = require.resolve('metro-minify-terser');
config.transformer.minifierConfig = {};

module.exports = config;
METRO_CONFIG

# Create a simplified babel.config.js
cat > babel.config.js << 'BABEL_CONFIG'
// @ts-check
// Learn more https://docs.expo.dev/guides/customizing-metro
module.exports = function(api) {
  // This caches the Babel config
  api.cache.forever();
  
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
    ],
  };
};
BABEL_CONFIG

echo "Ensuring Expo plugins are properly installed..."
npm install --save-dev @expo/config-plugins@~10.0.0 @expo/prebuild-config@~9.0.0

echo "Dependencies fixed! Your project should now be compatible with GitHub Actions."
