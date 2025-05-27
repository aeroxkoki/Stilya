#!/bin/bash

# Fix for network connection issues in iOS Simulator

echo "🔧 Fixing network connection for iOS Simulator..."

# 1. Kill any existing processes
echo "📋 Stopping existing processes..."
pkill -f expo 2>/dev/null || true
pkill -f metro 2>/dev/null || true
pkill -f node 2>/dev/null || true

# 2. Clear all caches
echo "🧹 Clearing caches..."
rm -rf ~/.expo
rm -rf .expo
rm -rf node_modules/.cache
rm -rf ~/.metro-cache

# 3. Reset watchman if installed
if command -v watchman >/dev/null 2>&1; then
    echo "🔄 Resetting watchman..."
    watchman watch-del-all
fi

# 4. Get local IP address
LOCAL_IP=$(ipconfig getifaddr en0 || ipconfig getifaddr en1 || echo "localhost")
echo "📡 Local IP: $LOCAL_IP"

# 5. Start Expo with localhost (not network)
echo "🚀 Starting Expo with localhost configuration..."
EXPO_USE_FAST_REFRESH=true \
RCT_METRO_PORT=8081 \
REACT_NATIVE_PACKAGER_HOSTNAME=localhost \
npx expo start --localhost --clear

echo ""
echo "📱 Metro bundler is starting on localhost!"
echo "   - The app should connect to http://localhost:8081"
echo "   - NOT to http://$LOCAL_IP:8081"
echo ""
echo "🔍 If the app still tries to connect to network IP:"
echo "   1. Delete the app from simulator"
echo "   2. Run: npx expo run:ios"
echo "   3. Or shake the device and 'Change Bundle Location' to localhost:8081"
