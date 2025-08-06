#!/bin/bash

# Stilya iOS Build Fix Script - Safe Version
# This script fixes iOS build issues without requiring sudo

echo "===== Stilya iOS Build Fix (Safe Version) ====="
echo "This script will fix iOS build issues for the Stilya project"
echo

# Navigate to project root
cd "$(dirname "$0")/.." || exit 1

# Function to check command status
check_status() {
    if [ $? -ne 0 ]; then
        echo "❌ Error: $1 failed"
        echo "Please run this command manually with sudo if needed:"
        echo "sudo rm -rf ios/Pods ios/Podfile.lock"
        return 1
    else
        echo "✅ $1 completed successfully"
        return 0
    fi
}

# 1. Clean DerivedData (user-accessible)
echo "🧹 Step 1: Cleaning Xcode DerivedData..."
rm -rf ~/Library/Developer/Xcode/DerivedData
check_status "Clean DerivedData"

# 2. Remove .xcode.env.local to regenerate it
echo "🧹 Step 2: Cleaning .xcode.env.local..."
rm -f ios/.xcode.env.local
check_status "Clean .xcode.env.local"

# 3. Create new .xcode.env.local with correct node path
echo "⚙️ Step 3: Creating new .xcode.env.local..."
NODE_PATH=$(which node)
echo "export NODE_BINARY=$NODE_PATH" > ios/.xcode.env.local
echo "Node path set to: $NODE_PATH"
check_status "Create .xcode.env.local"

# 4. Clean npm cache
echo "🧹 Step 4: Cleaning npm cache..."
npm cache clean --force
check_status "Clean npm cache"

# 5. Move to iOS directory
cd ios

# 6. Try to clean Pods (if accessible)
echo "🧹 Step 5: Attempting to clean Pods..."
if [ -w "Pods" ]; then
    rm -rf Pods
    echo "✅ Pods directory removed"
else
    echo "⚠️  Cannot remove Pods directory. You may need to run:"
    echo "    cd ios && sudo rm -rf Pods"
fi

if [ -w "Podfile.lock" ]; then
    rm -f Podfile.lock
    echo "✅ Podfile.lock removed"
else
    echo "⚠️  Cannot remove Podfile.lock. You may need to run:"
    echo "    cd ios && sudo rm -f Podfile.lock"
fi

# 7. Clean pod cache
echo "🧹 Step 6: Cleaning pod cache..."
pod cache clean --all --verbose || true

# 8. Update pod repo
echo "🔄 Step 7: Updating pod repo..."
pod repo update --verbose

# 9. Install pods
echo "📦 Step 8: Installing pods..."
echo "Running: pod install --repo-update"
pod install --repo-update

if [ $? -ne 0 ]; then
    echo
    echo "❌ Pod install failed!"
    echo
    echo "Please try the following steps manually:"
    echo "1. cd ios"
    echo "2. sudo rm -rf Pods Podfile.lock"
    echo "3. pod install --repo-update"
    echo
    echo "If the error persists, try:"
    echo "- Updating CocoaPods: sudo gem install cocoapods"
    echo "- Cleaning all caches: pod cache clean --all"
    echo "- Running with verbose mode: pod install --verbose"
else
    echo "✅ Pod install completed successfully!"
fi

# Return to project root
cd ..

echo
echo "🔍 Checking installation status..."
if [ -d "ios/Pods" ] && [ -f "ios/Podfile.lock" ]; then
    echo "✨ iOS dependencies installed successfully!"
    echo
    echo "Next steps:"
    echo "1. Open Xcode: open ios/Stilya.xcworkspace"
    echo "2. Clean build folder in Xcode: Cmd+Shift+K"
    echo "3. Build the project: Cmd+B"
    echo
    echo "For development build on device:"
    echo "npx expo run:ios --device"
    echo
    echo "For simulator:"
    echo "npx expo run:ios"
else
    echo "⚠️  Installation may not be complete. Please check the errors above."
fi
