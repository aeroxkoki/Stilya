#!/bin/bash

# Stilya iOS Build Complete Fix Script
# This script performs a comprehensive fix for iOS build issues

echo "===== Stilya iOS Build Complete Fix ====="
echo "This script will fix iOS build issues for the Stilya project"
echo

# Navigate to project root
cd "$(dirname "$0")/.." || exit 1

# Function to check command status
check_status() {
    if [ $? -ne 0 ]; then
        echo "❌ Error: $1 failed"
        exit 1
    else
        echo "✅ $1 completed successfully"
    fi
}

# 1. Clean existing build artifacts
echo "🧹 Step 1: Cleaning existing build artifacts..."
rm -rf ios/Pods
rm -rf ios/build
rm -rf ios/Podfile.lock
rm -rf ios/.xcode.env.local
rm -rf ~/Library/Developer/Xcode/DerivedData
check_status "Clean build artifacts"

# 2. Clean CocoaPods cache
echo "🧹 Step 2: Cleaning CocoaPods cache..."
pod cache clean --all 2>/dev/null || true
check_status "Clean CocoaPods cache"

# 3. Clean npm cache
echo "🧹 Step 3: Cleaning npm cache..."
npm cache clean --force
check_status "Clean npm cache"

# 4. Remove and reinstall node_modules
echo "📦 Step 4: Reinstalling node_modules..."
rm -rf node_modules
npm install
check_status "Reinstall node_modules"

# 5. Ensure Expo modules are properly installed
echo "📦 Step 5: Ensuring Expo modules are installed..."
npx expo install --fix
check_status "Fix Expo modules"

# 6. Create .xcode.env.local if it doesn't exist
echo "⚙️ Step 6: Creating .xcode.env.local..."
if [ ! -f ios/.xcode.env.local ]; then
    echo "export NODE_BINARY=$(which node)" > ios/.xcode.env.local
fi
check_status "Create .xcode.env.local"

# 7. Update CocoaPods repo
echo "🔄 Step 7: Updating CocoaPods repo..."
cd ios
pod repo update
check_status "Update CocoaPods repo"

# 8. Install Pods with verbose output
echo "📦 Step 8: Installing CocoaPods dependencies..."
pod install --repo-update --verbose
check_status "Install CocoaPods"

# 9. Ensure proper permissions
echo "🔐 Step 9: Setting proper permissions..."
cd ..
chmod -R 755 ios/Pods
check_status "Set permissions"

# 10. Run prebuild to ensure all native modules are configured
echo "🔨 Step 10: Running Expo prebuild..."
npx expo prebuild --clean --platform ios
check_status "Expo prebuild"

# 11. Final Pod install after prebuild
echo "📦 Step 11: Final Pod install..."
cd ios
pod install
check_status "Final Pod install"

# Return to project root
cd ..

echo
echo "✨ iOS build fix completed successfully!"
echo
echo "Next steps:"
echo "1. Open Xcode: open ios/Stilya.xcworkspace"
echo "2. Select your development team in Signing & Capabilities"
echo "3. Build the project (Cmd+B)"
echo "4. If you encounter any issues, run: npx react-native doctor"
echo
echo "For development build:"
echo "npx expo run:ios --device"
echo
echo "For simulator:"
echo "npx expo run:ios"
