#!/bin/bash

# Alternative fix using development build instead of Expo Go

echo "🏗️ Creating development build for iOS..."
echo "This is more reliable than Expo Go for complex projects"

# 1. Clean everything
echo "🧹 Cleaning old builds..."
rm -rf ios/build
rm -rf ~/Library/Developer/Xcode/DerivedData
rm -rf .expo
rm -rf node_modules/.cache

# 2. Kill existing processes
pkill -f expo 2>/dev/null || true
pkill -f metro 2>/dev/null || true

# 3. Install dependencies
echo "📦 Installing dependencies..."
npm install

# 4. Install iOS dependencies
echo "📱 Installing iOS dependencies..."
cd ios
pod install
cd ..

# 5. Create development build
echo "🔨 Creating development build..."
echo "This will install a custom version of your app on the simulator"
npx expo run:ios

echo ""
echo "✅ Development build complete!"
echo ""
echo "📱 This creates a custom development client that:"
echo "   - Is more stable than Expo Go"
echo "   - Supports all your custom native modules"
echo "   - Doesn't have Expo Go limitations"
echo ""
echo "🔄 To reload the app: Press Cmd+R in the simulator"
echo "🐛 To open developer menu: Press Cmd+D in the simulator"
