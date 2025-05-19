#!/bin/bash
# Enhanced Metro dependencies configuration for EAS builds
# Specifically addressing serialization issues

echo "⚙️ Configuring Metro dependencies for EAS builds..."

# Clean up caches aggressively
echo "🧹 Cleaning Metro and Expo caches..."
rm -rf node_modules/.cache
rm -rf ~/.expo/cache
rm -rf ~/.metro-cache

# Force remove and reinstall metro packages
echo "🔄 Reinstalling correct Metro versions..."
rm -rf node_modules/metro
rm -rf node_modules/metro-config
rm -rf node_modules/metro-minify-terser
rm -rf node_modules/@expo/metro-config

# Install specific versions known to be compatible
npm install --save-dev metro@0.76.8 metro-config@0.76.8 metro-minify-terser@0.76.8
npm install --save-dev @expo/metro-config@^0.10.7

# Fix node_modules linking
echo "🔗 Checking node_modules symlinks..."
rm -rf node_modules/.bin/metro
rm -rf node_modules/.bin/metro-*
npm rebuild

echo "🧪 Testing metro-config loading..."
node -e "
try {
  const metroConfig = require('@expo/metro-config');
  console.log('✅ @expo/metro-config loaded successfully');
} catch (e) {
  console.error('❌ Error loading @expo/metro-config:', e.message);
  process.exit(1);
}
"

echo "✅ Metro dependencies configured successfully"
