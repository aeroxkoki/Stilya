#!/bin/bash
# Enhanced fix-metro-dependencies.sh for Expo 53 with correct Metro versions

echo "Installing and fixing Metro dependencies..."

# Remove previous Metro related dependencies to prevent conflicts
yarn remove metro metro-config metro-runtime metro-react-native-babel-transformer metro-source-map metro-resolver metro-transform-worker @expo/metro-config 2>/dev/null || true 

# Clean up caches that might be causing issues
rm -rf node_modules/.cache
yarn cache clean

# Install the EXACT versions of Metro packages that work with Expo SDK 53
# Ensure compatibility with Expo SDK 53
yarn add --dev metro@0.76.8 metro-config@0.76.8 metro-core@0.76.8
yarn add --dev metro-react-native-babel-transformer@0.76.8 metro-resolver@0.76.8
yarn add --dev metro-runtime@0.76.8 metro-source-map@0.76.8 metro-transform-worker@0.76.8

# Install the compatible version of Expo Metro config
yarn add --dev @expo/metro-config@~0.10.0

# Create a simplified metro.config.js that is compatible with Expo
cat > metro.config.js << 'METRO_CONFIG'
// Simple compatible metro.config.js for Expo SDK 53
const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Basic resolver configuration
config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'json'];
config.resolver.extraNodeModules = {
  '@': `${__dirname}/src`,
};

module.exports = config;
METRO_CONFIG

# Clean yarn cache again and force a node_modules clean-up if needed
if [ "$CI" = "true" ]; then
  rm -rf node_modules/.yarn-integrity
  rm -rf node_modules/.cache
  echo "Running in CI environment, performing additional cleanup..."
  yarn install --force
fi

echo "Metro dependencies fixed!"
