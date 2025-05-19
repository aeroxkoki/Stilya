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
export EAS_BUILD_SKIP_EMBED=true
export EAS_PROJECT_ID=beb25e0f-344b-4f2f-8b64-20614b9744a3

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

# 4. Ensure EAS project is initialized
echo "🔄 Checking EAS project configuration..."

# Extract project ID from app.json if available
PROJECT_ID=$(node -e "try { const appJson = require('../app.json'); console.log(appJson.expo?.extra?.eas?.projectId || ''); } catch(e) { console.log(''); }")

if [ -n "$PROJECT_ID" ]; then
  echo "✅ Found project ID in app.json: $PROJECT_ID"
  export EAS_PROJECT_ID=$PROJECT_ID
  # This environment variable will be used by EAS CLI
else
  echo "⚠️ No project ID found in app.json"
  if npx eas-cli project:info &> /dev/null; then
    echo "✅ EAS project is already configured."
  else
    echo "⚠️ EAS project needs to be configured."
    echo "Please run 'npx eas-cli init' manually before trying again."
    echo "Alternatively, you can create a project via the Expo website and set its ID in app.json."
    exit 1
  fi
fi

# 5. Run EAS build with special flags
echo "🏗️ Running EAS build with bypass flags..."
npx eas-cli build \
  --platform android \
  --non-interactive \
  --profile production \
  --no-wait \
  --project-id beb25e0f-344b-4f2f-8b64-20614b9744a3

echo "✅ Direct build initiated - check Expo dashboard for progress!"
