#!/bin/bash
# Enhanced fix-metro-dependencies.sh for Expo 53 with Metro versions compatible with GitHub Actions

echo "Installing and fixing Metro dependencies for Expo SDK 53..."

# Remove previous Metro related dependencies to prevent conflicts
yarn remove metro metro-config metro-runtime metro-react-native-babel-transformer metro-source-map metro-resolver metro-transform-worker @expo/metro-config 2>/dev/null || true 

# Clean up caches that might be causing issues
rm -rf node_modules/.cache
yarn cache clean

# More aggressive cleanup to prevent module conflicts
rm -rf node_modules/metro* || true
rm -rf node_modules/@expo/metro* || true

# Check environment and use appropriate Metro versions
if [ "$CI" = "true" ]; then
  echo "Detected CI environment, using CI-compatible Metro dependencies..."
  yarn add --dev metro@0.76.8 metro-config@0.76.8 metro-core@0.76.8
  yarn add --dev metro-react-native-babel-transformer@0.76.8 metro-resolver@0.76.8
  yarn add --dev metro-runtime@0.76.8 metro-source-map@0.76.8 metro-transform-worker@0.76.8
  yarn add --dev @expo/metro-config@~0.10.0
else
  echo "Using recommended Expo SDK 53 Metro versions for local development..."
  yarn add --dev metro@0.76.8 metro-config@0.76.8 metro-core@0.76.8
  yarn add --dev metro-react-native-babel-transformer@0.76.8 metro-resolver@0.76.8
  yarn add --dev metro-runtime@0.76.8 metro-source-map@0.76.8 metro-transform-worker@0.76.8
  yarn add --dev @expo/metro-config@~0.10.0
fi

# Create a proper Expo-compatible metro.config.js
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

module.exports = config;
METRO_CONFIG

# Clean up and force reinstall if needed
if [ "$CI" = "true" ]; then
  rm -rf node_modules/.yarn-integrity
  rm -rf node_modules/.cache
  echo "Running in CI environment, performing additional cleanup..."
  yarn install --force
fi

echo "Metro dependencies fixed!"
