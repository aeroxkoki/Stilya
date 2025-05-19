#!/bin/bash
# Simplified Metro dependencies fix for Expo SDK 53 with GitHub Actions

echo "Installing and configuring Metro dependencies for Expo SDK 53..."

# Clean up cache
rm -rf node_modules/.cache
npm cache clean --force || true

# Install compatible Metro dependencies
npm install --save-dev metro@0.76.8 metro-config@0.76.8 metro-minify-terser@0.76.8
npm install --save-dev @expo/metro-config@~0.10.0

# Ensure proper configuration plugins are installed
npm install --save-dev @expo/config-plugins@~10.0.0

# Verify babel configuration
if [ ! -f "babel.config.js" ]; then
  echo "Creating babel.config.js..."
  cat > babel.config.js << 'EOF'
// @ts-check
module.exports = function(api) {
  api.cache.forever();
  
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin',
    ],
  };
};
EOF
fi

echo "Metro dependencies configured successfully for GitHub Actions compatibility."
