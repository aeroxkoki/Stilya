#!/bin/bash

# Quick fix for ExpoModulesCore error

set -e

echo "🔧 Quick fix for ExpoModulesCore error..."

# 1. Clean iOS artifacts
echo "🗑️  Cleaning iOS build artifacts..."
cd /Users/koki_air/Documents/GitHub/Stilya
rm -rf ios/build
rm -rf ios/Pods
rm -rf ios/Podfile.lock

# 2. Clean Expo prebuild
echo "🧹 Cleaning Expo prebuild..."
rm -rf .expo

# 3. Reinstall pods
echo "🍫 Installing CocoaPods..."
cd ios

# Deintegrate first to ensure clean state
if command -v pod &> /dev/null; then
    pod deintegrate
fi

# Install pods
pod install --repo-update

cd ..

echo "✅ Quick fix complete!"
echo ""
echo "📱 Now in Xcode:"
echo "1. Open: open ios/Stilya.xcworkspace"
echo "2. Clean Build Folder: Cmd+Shift+K" 
echo "3. Build: Cmd+B"
