#!/bin/bash

# Fix \"No such module 'ExpoModulesCore'\" error
# This script performs a complete cleanup and reinstallation

set -e

echo "🧹 Starting complete cleanup for ExpoModulesCore error fix..."

# 1. Clean all caches
echo "📦 Cleaning npm cache..."
npm cache clean --force

echo "🗑️  Removing node_modules..."
rm -rf node_modules

echo "🗑️  Removing iOS build artifacts..."
rm -rf ios/build
rm -rf ios/Pods
rm -rf ios/Podfile.lock

echo "🗑️  Removing Expo cache..."
rm -rf .expo
rm -rf $HOME/.expo

echo "🗑️  Cleaning watchman cache..."
if command -v watchman &> /dev/null; then
    watchman watch-del-all
fi

echo "🗑️  Cleaning Metro cache..."
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*

# 2. Clean Xcode derived data
echo "🗑️  Cleaning Xcode derived data..."
if [ -d "$HOME/Library/Developer/Xcode/DerivedData" ]; then
    rm -rf "$HOME/Library/Developer/Xcode/DerivedData"
fi

# 3. Reinstall dependencies
echo "📦 Installing npm dependencies..."
npm install

# 4. Prebuild iOS with clean
echo "🏗️  Prebuilding iOS project..."
npx expo prebuild --platform ios --clean

# 5. Install CocoaPods
echo "🍫 Installing CocoaPods dependencies..."
cd ios

# Update repo specs
pod repo update

# Install pods with verbose output
pod install --repo-update --verbose

cd ..

# 6. Clear any remaining caches
echo "🧹 Final cache clear..."
npx expo start --clear --dev-client &
EXPO_PID=$!
sleep 5
kill $EXPO_PID 2>/dev/null || true

echo "✅ Cleanup complete!"
echo ""
echo "📱 Next steps:"
echo "1. Open Xcode: open ios/Stilya.xcworkspace"
echo "2. Clean Build Folder: Cmd+Shift+K"
echo "3. Build and Run: Cmd+R"
echo ""
echo "If the error persists, try:"
echo "- Restart your Mac"
echo "- Update Xcode Command Line Tools: xcode-select --install"
