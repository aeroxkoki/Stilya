#!/bin/bash

# Enhanced Metro fix for iOS Simulator connection

echo "🔧 Enhanced Metro bundler fix for iOS Simulator..."

# Check for global expo-cli
if command -v expo >/dev/null 2>&1; then
    echo "⚠️  Detected global expo-cli installation"
    echo "   The global expo-cli is deprecated. Using local expo instead."
    echo "   To remove global expo-cli run: npm uninstall -g expo-cli"
    echo ""
fi

# 1. Kill existing processes
echo "📋 Stopping existing processes..."
pkill -f expo || true
pkill -f metro || true
pkill -f node || true

# 2. Clear all caches
echo "🧹 Clearing caches..."
rm -rf ~/.expo
rm -rf .expo
rm -rf node_modules/.cache
rm -rf ~/.metro-cache
rm -rf ios/build
rm -rf ios/Pods

# 3. Reset watchman if installed
if command -v watchman >/dev/null 2>&1; then
    echo "🔄 Resetting watchman..."
    watchman watch-del-all
fi

# 4. Reinstall iOS pods
echo "📦 Reinstalling iOS dependencies..."
cd ios
pod install
cd ..

# 5. Start Expo with optimized settings
echo "🚀 Starting Expo with optimized settings..."
EXPO_USE_FAST_REFRESH=true \
RCT_METRO_PORT=8081 \
npx expo start --clear

echo ""
echo "📱 Metro bundler is starting!"
echo "   - Press 'i' to open iOS simulator"
echo "   - Press 'a' to open Android emulator"
echo "   - Press 'r' to reload the app"
echo ""
echo "🔍 If you still have issues:"
echo "   1. Delete the app from simulator"
echo "   2. Run: npx expo run:ios"
