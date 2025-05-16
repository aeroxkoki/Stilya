#!/bin/bash
# Enhanced fix-metro-dependencies.sh for Expo 53 with correct Metro versions for both local and CI environments

echo "Installing and fixing Metro dependencies..."

# Remove previous Metro related dependencies to prevent conflicts
yarn remove metro metro-config metro-runtime metro-react-native-babel-transformer metro-source-map metro-resolver metro-transform-worker @expo/metro-config 2>/dev/null || true 

# Clean up caches that might be causing issues
rm -rf node_modules/.cache
yarn cache clean

# Check if running in CI environment
if [ "$CI" = "true" ]; then
  echo "Running in CI environment, using compatible Metro versions..."
  # Use Metro 0.76.8 for CI environments (GitHub Actions compatibility)
  yarn add --dev metro@0.76.8 metro-config@0.76.8 metro-core@0.76.8
  yarn add --dev metro-react-native-babel-transformer@0.76.8 metro-resolver@0.76.8
  yarn add --dev metro-runtime@0.76.8 metro-source-map@0.76.8 metro-transform-worker@0.76.8
  yarn add --dev @expo/metro-config@~0.10.0
else
  echo "Installing recommended Expo SDK 53 Metro versions..."
  # Use Metro 0.82.0 for local development (Expo SDK 53 recommendation)
  yarn add --dev metro@^0.82.0 metro-config@^0.82.0 metro-core@^0.82.0
  yarn add --dev metro-react-native-babel-transformer@^0.82.0 metro-resolver@^0.82.0
  yarn add --dev metro-runtime@^0.82.0 metro-source-map@^0.82.0 metro-transform-worker@^0.82.0
  yarn add --dev @expo/metro-config@~0.20.0
fi

# Create a proper metro.config.js that is compatible with Expo
cat > metro.config.js << 'METRO_CONFIG'
// Enhanced metro.config.js for Expo SDK 53
const { getDefaultConfig } = require('@expo/metro-config');

// Get the default config for the project directory
const defaultConfig = getDefaultConfig(__dirname);

// Add custom configuration
defaultConfig.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'json'];
defaultConfig.resolver.extraNodeModules = {
  '@': `${__dirname}/src`,
};

// Make sure to export the config properly
module.exports = defaultConfig;
METRO_CONFIG

# Clean up and force reinstall if needed
if [ "$CI" = "true" ]; then
  rm -rf node_modules/.yarn-integrity
  rm -rf node_modules/.cache
  echo "Running in CI environment, performing additional cleanup..."
  yarn install --force
fi

echo "Metro dependencies fixed!"
