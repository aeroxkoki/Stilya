#!/bin/bash
# Enhanced fix-metro-dependencies.sh for Expo 53 + React Native 0.79 + Metro 0.76.7

echo "Installing and fixing Metro dependencies..."

# Remove previous Metro related dependencies to prevent conflicts
yarn remove metro metro-config metro-runtime metro-react-native-babel-transformer metro-source-map metro-resolver metro-transform-worker @expo/metro-config 2>/dev/null || true 

# Clean up caches that might be causing issues
rm -rf node_modules/.cache
yarn cache clean

# Install specific versions of Metro packages compatible with Expo 53
yarn add --dev metro@0.76.7 metro-config@0.76.7 metro-runtime@0.76.7
yarn add --dev metro-react-native-babel-transformer@0.76.7 metro-source-map@0.76.7 metro-resolver@0.76.7
yarn add --dev metro-transform-worker@0.76.7 

# Install the correct Expo Metro config
yarn add --dev @expo/metro-config@~0.20.0

# Safer method - create temporary Node script and execute it
cat > update-resolutions.js << 'EOL'
const fs = require("fs");
try {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"));

  // Add resolutions field if it doesn't exist
  if (!packageJson.resolutions) {
    packageJson.resolutions = {};
  }

  // Update resolutions with Metro versions
  packageJson.resolutions = {
    ...packageJson.resolutions,
    "metro": "^0.76.7",
    "metro-config": "^0.76.7",
    "metro-core": "^0.76.7",
    "metro-react-native-babel-transformer": "^0.76.7",
    "metro-resolver": "^0.76.7",
    "metro-runtime": "^0.76.7"
  };

  // Write the updated package.json
  fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2));
  console.log("Updated package.json with Metro resolutions");
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