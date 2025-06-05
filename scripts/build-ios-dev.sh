#!/bin/bash
# scripts/build-ios-dev.sh

echo "🏗️  Generating iOS development build..."

# プロジェクトルートに移動
cd /Users/koki_air/Documents/GitHub/Stilya

# Clean prebuild
echo "📦 Clearing previous build artifacts..."
rm -rf ios

# Generate iOS project
echo "⚙️  Generating iOS project..."
npx expo prebuild --platform ios --clear

# Navigate to iOS directory
cd ios

# Install pods with specific flags
echo "🔗 Installing CocoaPods dependencies..."
pod install --repo-update

# Return to project root
cd ..

echo "✅ iOS prebuild complete! Run 'npx expo run:ios' to build and launch."
