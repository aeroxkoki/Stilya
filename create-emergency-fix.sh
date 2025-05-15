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
// Simple metro.config.js
const { getDefaultConfig } = require('@expo/metro-config');

// Create the default Expo metro config
const config = getDefaultConfig(__dirname);

// Add TypeScript extensions
config.resolver.sourceExts = ['jsx', 'js', 'ts', 'tsx', 'json'];

// Basic transformer configuration
config.transformer = {
  ...config.transformer,
  babelTransformerPath: require.resolve('metro-react-native-babel-transformer'),
  assetPlugins: ['expo-asset/tools/hashAssetFiles'],
};

// Avoid the Metro issue with location imports
config.transformer.allowOptionalDependencies = true;

// Add path alias support
config.resolver.extraNodeModules = {
  '@': `${__dirname}/src`,
};

module.exports = config;
METRO_CONFIG

# Fix package.json to ensure it has correct resolutions
node -e '
try {
  const fs = require("fs");
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
  
  // Add resolutions field
  packageJson.resolutions = {
    "metro": "^0.76.7",
    "metro-config": "^0.76.7",
    "metro-core": "^0.76.7",
    "metro-react-native-babel-transformer": "^0.76.7",
    "metro-resolver": "^0.76.7",
    "metro-runtime": "^0.76.7"
  };
  
  // Write back
  fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
  console.log("Updated package.json with correct Metro resolutions");
} catch (error) {
  console.error("Error updating package.json:", error);
  process.exit(1);
}
'

# Install dependencies
echo "Installing dependencies..."
yarn install

echo "Running Metro fixes..."
yarn fix-metro

echo "Emergency fixes applied. Try building again."
EOL

chmod +x fix-ci-build.sh

echo "Created emergency fix-ci-build.sh script in case of build failures."