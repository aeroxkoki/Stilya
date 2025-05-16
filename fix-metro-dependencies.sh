#!/bin/bash
# Enhanced fix-metro-dependencies.sh for Expo 53 with Metro versions compatible with GitHub Actions

echo "Installing and fixing Metro dependencies..."

# Remove previous Metro related dependencies to prevent conflicts
yarn remove metro metro-config metro-runtime metro-react-native-babel-transformer metro-source-map metro-resolver metro-transform-worker @expo/metro-config 2>/dev/null || true 

# Clean up caches that might be causing issues
rm -rf node_modules/.cache
yarn cache clean

# For both CI and local environments - using Metro 0.76.8 for consistent behavior
echo "Installing Metro 0.76.8 packages (compatible with GitHub Actions)..."
yarn add --dev metro@0.76.8 metro-config@0.76.8 metro-core@0.76.8
yarn add --dev metro-react-native-babel-transformer@0.76.8 metro-resolver@0.76.8
yarn add --dev metro-runtime@0.76.8 metro-source-map@0.76.8 metro-transform-worker@0.76.8
yarn add --dev @expo/metro-config@~0.10.0

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
