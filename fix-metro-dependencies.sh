#!/bin/bash
# Enhanced fix-metro-dependencies.sh for Expo 53 + React Native 0.73 + Metro 0.76

echo "Installing and fixing Metro dependencies..."

# Remove previous Metro related dependencies to prevent conflicts
yarn remove metro metro-config metro-runtime metro-react-native-babel-transformer metro-source-map metro-resolver @expo/metro-config 2>/dev/null || true 

# Clean up caches that might be causing issues
rm -rf node_modules/.cache
yarn cache clean

# Install specific versions of Metro packages compatible with Expo 53
yarn add --dev metro@0.76.0 metro-config@0.76.0 metro-runtime@0.76.0
yarn add --dev metro-react-native-babel-transformer@0.76.0 metro-source-map@0.76.0 metro-resolver@0.76.0

# Add the missing dependency that's causing the error
yarn add --dev metro-transform-worker@0.76.0 metro-transform-plugins@0.76.0

# Install the correct Expo Metro config
yarn add --dev @expo/metro-config@~0.10.0

# Clean yarn cache again and force a node_modules clean-up if needed
if [ "$CI" = "true" ]; then
  rm -rf node_modules/.cache
  echo "Running in CI environment, performing additional cleanup..."
  yarn install --force
fi

echo "Metro dependencies fixed!"
