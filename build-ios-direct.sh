#!/bin/bash

# Direct iOS build for simulator

echo "🏗️ Building app directly for iOS Simulator..."

# 1. Clean everything
echo "🧹 Cleaning old builds..."
rm -rf ios/build
rm -rf ~/Library/Developer/Xcode/DerivedData

# 2. Kill existing processes
pkill -f expo 2>/dev/null || true
pkill -f metro 2>/dev/null || true

# 3. Clear caches
rm -rf .expo
rm -rf node_modules/.cache
rm -rf ~/.metro-cache

# 4. Start the build
echo "🔨 Building iOS app..."
echo "This will take a few minutes on first run..."

# Use expo run:ios which will properly configure the app for localhost
EXPO_USE_FAST_REFRESH=true \
RCT_METRO_PORT=8081 \
npx expo run:ios --no-build-cache

echo ""
echo "✅ Build complete!"
echo "The app should now connect to localhost:8081"
