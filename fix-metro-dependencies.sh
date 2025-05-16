#!/bin/bash
# Enhanced fix-metro-dependencies.sh for Expo 53 with exact compatible Metro versions

echo "Installing and fixing Metro dependencies..."

# Remove previous Metro related dependencies to prevent conflicts
yarn remove metro metro-config metro-runtime metro-react-native-babel-transformer metro-source-map metro-resolver metro-transform-worker @expo/metro-config 2>/dev/null || true 

# Clean up caches that might be causing issues
rm -rf node_modules/.cache
yarn cache clean

# Install the EXACT versions of Metro packages that work with Expo SDK 53
# These exact versions are from Expo 53 package.json
yarn add --dev metro@0.80.0 metro-config@0.80.0 metro-core@0.80.0
yarn add --dev metro-react-native-babel-transformer@0.80.0 metro-resolver@0.80.0
yarn add --dev metro-source-map@0.80.0 metro-transform-worker@0.80.0

# Install the compatible version of Expo Metro config
yarn add --dev @expo/metro-config@0.16.0

# Create a simplified metro.config.js that is compatible with Expo
cat > metro.config.js << 'METRO_CONFIG'
// Simple compatible metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Basic resolver configuration
config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'json'];
config.resolver.extraNodeModules = {
  '@': `${__dirname}/src`,
};

module.exports = config;
METRO_CONFIG

# Safer method - create temporary Node script and execute it
cat > update-resolutions.js << 'EOL'
const fs = require("fs");
try {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

  // Add resolutions field if it doesn't exist
  if (!packageJson.resolutions) {
    packageJson.resolutions = {};
  }

  // Update resolutions with EXACT Metro versions that work with Expo SDK 53
  packageJson.resolutions = {
    ...packageJson.resolutions,
    "metro": "0.80.0",
    "metro-config": "0.80.0",
    "metro-core": "0.80.0",
    "metro-react-native-babel-transformer": "0.80.0",
    "metro-resolver": "0.80.0",
    "metro-runtime": "0.80.0",
    "metro-source-map": "0.80.0",
    "@expo/metro-config": "0.16.0"
  };

  // Write the updated package.json
  fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
  console.log("Updated package.json with exact compatible Metro resolutions");
} catch (error) {
  console.error("Error updating package.json:", error);
  process.exit(1);
}
EOL

# Execute the Node.js script
node update-resolutions.js
rm update-resolutions.js

# Clean yarn cache again and force a node_modules clean-up if needed
if [ "$CI" = "true" ]; then
  rm -rf node_modules/.yarn-integrity
  rm -rf node_modules/.cache
  echo "Running in CI environment, performing additional cleanup..."
  yarn install --force
fi

echo "Metro dependencies fixed!"