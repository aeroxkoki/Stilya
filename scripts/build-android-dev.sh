#!/bin/bash
# scripts/build-android-dev.sh

echo "🏗️  Generating Android development build..."

# プロジェクトルートに移動
cd /Users/koki_air/Documents/GitHub/Stilya

# Set Android environment variables
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools

echo "📱 Android SDK path: $ANDROID_HOME"

# Clean prebuild
echo "📦 Clearing previous build artifacts..."
rm -rf android

# Generate Android project
echo "⚙️  Generating Android project..."
npx expo prebuild --platform android --clear

echo "✅ Android prebuild complete! Run 'npx expo run:android' to build and launch."
