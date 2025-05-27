#!/bin/bash

# Fix for Expo Go disconnection issues

echo "🔧 Fixing Expo Go connection issues..."

# 1. Kill all existing processes
echo "📋 Stopping all processes..."
pkill -f expo 2>/dev/null || true
pkill -f metro 2>/dev/null || true
pkill -f node 2>/dev/null || true

# 2. Clear all caches
echo "🧹 Clearing all caches..."
rm -rf ~/.expo
rm -rf .expo
rm -rf node_modules/.cache
rm -rf ~/.metro-cache
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/haste-*

# 3. Reset watchman
if command -v watchman >/dev/null 2>&1; then
    echo "🔄 Resetting watchman..."
    watchman watch-del-all
    watchman shutdown-server
fi

# 4. Check Expo Go compatibility
echo "📱 Checking Expo SDK version..."
EXPO_VERSION=$(node -p "require('./package.json').dependencies.expo")
echo "   Expo SDK version: $EXPO_VERSION"

# 5. Reinstall problematic dependencies
echo "📦 Fixing dependencies..."
npm install @react-native-async-storage/async-storage@2.1.2 --save
npm install @react-native-community/netinfo@11.4.1 --save

# 6. Start Expo with optimal settings
echo "🚀 Starting Expo with Expo Go settings..."
export EXPO_USE_FAST_REFRESH=true
export RCT_METRO_PORT=8081
export REACT_NATIVE_PACKAGER_HOSTNAME=localhost

# Use tunnel mode for better Expo Go compatibility
npx expo start --tunnel --clear

echo ""
echo "📱 Expo is starting in tunnel mode!"
echo ""
echo "🔍 To use Expo Go:"
echo "   1. Make sure Expo Go app is updated to latest version"
echo "   2. Scan the QR code shown above"
echo "   3. If connection fails, try:"
echo "      - Restart Expo Go app"
echo "      - Clear Expo Go app cache (Settings → Clear cache)"
echo "      - Use the URL shown in terminal directly"
