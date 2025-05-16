#!/bin/bash

# Create a fix-ci-build.sh script to help recover from build failures
cat > fix-ci-build.sh << 'EOL'
#!/bin/bash
echo "Running emergency CI build fix..."

# Clean everything
rm -rf node_modules
rm -rf .yarn/cache
rm yarn.lock

# Create a fresh metro config
cat > metro.config.js << 'METRO_CONFIG'
// Simple compatible metro.config.js for Expo SDK 53
const { getDefaultConfig } = require('@expo/metro-config');

const config = getDefaultConfig(__dirname);

// Basic resolver configuration
config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'json'];
config.resolver.extraNodeModules = {
  '@': `${__dirname}/src`,
};

// Disable any fancy custom configuraton that might cause issues
delete config.transformer.minifierConfig;
delete config.cacheStores;
delete config.maxWorkers;
delete config.resetCache;

module.exports = config;
METRO_CONFIG

# Fix package.json to ensure it has correct Metro versions
node -e '
try {
  const fs = require("fs");
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  
  // Add resolutions field
  packageJson.resolutions = {
    "metro": "0.80.0",
    "metro-config": "0.80.0",
    "metro-core": "0.80.0",
    "metro-react-native-babel-transformer": "0.80.0",
    "metro-resolver": "0.80.0",
    "metro-runtime": "0.80.0",
    "metro-source-map": "0.80.0",
    "@expo/metro-config": "0.16.0"
  };
  
  // Also update devDependencies
  packageJson.devDependencies = {
    ...packageJson.devDependencies,
    "metro": "0.80.0",
    "metro-config": "0.80.0",
    "metro-core": "0.80.0",
    "metro-react-native-babel-transformer": "0.80.0",
    "metro-resolver": "0.80.0",
    "metro-runtime": "0.80.0",
    "metro-source-map": "0.80.0",
    "metro-transform-worker": "0.80.0",
    "@expo/metro-config": "0.16.0"
  };
  
  // Write back
  fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
  console.log("Updated package.json with correct Metro resolutions");
} catch (error) {
  console.error("Error updating package.json:", error);
  process.exit(1);
}
'

# Install dependencies from scratch
echo "Installing dependencies from scratch..."
yarn config set network-timeout 300000
yarn install --network-timeout 300000 --force

echo "Emergency fixes applied. Try building again."
EOL

chmod +x fix-ci-build.sh

echo "Created emergency fix-ci-build.sh script in case of build failures."