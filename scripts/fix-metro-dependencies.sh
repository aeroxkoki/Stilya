#!/bin/bash
# Enhanced dependencies configuration for EAS builds
# Fixes both Metro and Babel issues

echo "⚙️ Configuring dependencies for EAS builds..."

# Clean up caches aggressively
echo "🧹 Cleaning Metro and Expo caches..."
rm -rf node_modules/.cache
rm -rf ~/.expo/cache
rm -rf ~/.metro-cache

# Force remove and reinstall problematic packages
echo "🔄 Reinstalling Metro and Babel dependencies..."

# Remove Metro packages
rm -rf node_modules/metro
rm -rf node_modules/metro-config
rm -rf node_modules/metro-minify-terser
rm -rf node_modules/@expo/metro-config

# Remove Babel packages
rm -rf node_modules/@babel/runtime
rm -rf node_modules/@babel/core
rm -rf node_modules/@babel/plugin-transform-runtime

# Install specific versions known to be compatible
echo "📦 Installing Metro packages..."
npm install --save-dev metro@0.76.8 metro-config@0.76.8 metro-minify-terser@0.76.8
npm install --save-dev @expo/metro-config@^0.10.7

echo "📦 Installing Babel packages..."
npm install --save-dev @babel/core@^7.24.0 @babel/plugin-transform-runtime@^7.24.0
npm install --save @babel/runtime@^7.24.0

# Fix node_modules linking
echo "🔗 Checking node_modules symlinks..."
rm -rf node_modules/.bin/metro
rm -rf node_modules/.bin/metro-*
npm rebuild

echo "🧪 Testing package availability..."
node -e "
try {
  require('@babel/runtime/helpers/interopRequireDefault');
  console.log('✅ @babel/runtime helpers loaded successfully');
} catch (e) {
  console.error('❌ Error loading @babel/runtime helpers:', e.message);
  process.exit(1);
}
"

echo "✅ All dependencies configured successfully"
