#!/bin/bash

# Quick fix for iOS Simulator connection issues

echo "🔧 Quick fix for Metro bundler connection..."

# 1. Kill existing processes
pkill -f expo || true
pkill -f metro || true

# 2. Clear all caches
rm -rf ~/.expo
rm -rf .expo
rm -rf node_modules/.cache
rm -rf ~/.metro-cache

# 3. Reset Metro bundler
if command -v watchman >/dev/null 2>&1; then
    watchman watch-del-all
fi

# 4. Start Expo with explicit settings
echo "🚀 Starting Expo with optimized settings..."
EXPO_USE_FAST_REFRESH=true \
RCT_METRO_PORT=8081 \
npx expo start --clear

echo ""
echo "📱 The Metro bundler is now running!"
echo "   - Press 'i' to open iOS simulator"
echo "   - Or scan the QR code with Expo Go app"
