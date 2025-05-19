#!/bin/bash
# Direct EAS build script that bypasses expo export:embed command
# (c) 2025 Stilya App Team

set -e # Exit on any error

echo "🚀 Starting direct EAS build without Metro bundling..."

# Set all needed environment variables
export EAS_NO_METRO=true
export EXPO_NO_CACHE=true
export EAS_SKIP_JAVASCRIPT_BUNDLING=1
export EXPO_NO_BUNDLER=1
export EAS_BUILD_PLATFORM=android

# 1. Ensure @babel/runtime is available
echo "📦 Installing critical dependencies..."
npm install --no-save @babel/runtime@^7.24.0
npm dedupe @babel/runtime

# 2. Verify @babel/runtime is properly installed
echo "🧪 Testing @babel/runtime availability..."
node -e "
try {
  require('@babel/runtime/helpers/interopRequireDefault');
  console.log('✅ @babel/runtime helpers loaded successfully');
} catch (e) {
  console.error('❌ Error loading @babel/runtime helpers:', e.message);
  process.exit(1);
}
"

# 3. Clean all caches
echo "🧹 Cleaning caches..."
rm -rf node_modules/.cache
rm -rf ~/.expo/cache
rm -rf ~/.metro-cache

# 4. Run EAS build with special flags
echo "🏗️ Running EAS build with bypass flags..."
npx eas-cli build \
  --platform android \
  --non-interactive \
  --profile production \
  --no-wait \
  --extra-build-params '{"EAS_BUILD_SKIP_EMBED":true}'

echo "✅ Direct build initiated - check Expo dashboard for progress!"
