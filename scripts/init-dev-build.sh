#!/bin/bash

# Expo SDK 53 Development Build Initialization Script
# This script ensures proper setup for development builds

echo "🚀 Initializing Expo SDK 53 Development Build..."

# 1. Clean all caches
echo "🧹 Cleaning caches..."
rm -rf node_modules/.cache
rm -rf .expo
rm -rf .metro-cache
rm -rf $TMPDIR/react-*
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*

# 2. Ensure correct Node version
echo "📦 Checking Node version..."
NODE_VERSION=$(node -v)
echo "Current Node version: $NODE_VERSION"

# 3. Reset watchman
echo "👁️  Resetting Watchman..."
if command -v watchman &> /dev/null; then
    watchman watch-del-all
    echo "Watchman reset complete"
else
    echo "Watchman not installed - skipping"
fi

# 4. Clean and reinstall dependencies
echo "📚 Reinstalling dependencies..."
rm -rf node_modules
rm -f package-lock.json
npm install

# 5. Clear Expo cache
echo "🧼 Clearing Expo cache..."
npx expo start --clear

echo "✅ Development build initialization complete!"
echo ""
echo "📱 To start the development server, run:"
echo "   npm run start"
echo ""
echo "🔧 If you're still experiencing issues:"
echo "   1. Ensure your device and computer are on the same network"
echo "   2. Try using tunnel mode: npx expo start --tunnel"
echo "   3. Check firewall settings for port 8081"
echo ""
