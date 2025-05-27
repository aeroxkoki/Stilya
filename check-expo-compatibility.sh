#!/bin/bash

# Quick Expo Go compatibility check

echo "🔍 Checking Expo Go compatibility..."

# 1. Check package versions
echo "📦 Checking dependency versions..."
echo ""

# Check if dependencies match Expo SDK 53
REQUIRED_VERSIONS=(
    "@react-native-async-storage/async-storage:2.1.2"
    "@react-native-community/netinfo:11.4.1"
    "react:19.0.0"
    "@types/react:~19.0.10"
    "babel-preset-expo:~13.0.0"
)

echo "❗ The following packages need updates for Expo SDK 53:"
echo ""

for pkg_version in "${REQUIRED_VERSIONS[@]}"; do
    pkg="${pkg_version%:*}"
    version="${pkg_version#*:}"
    current=$(node -p "require('./package.json').dependencies['$pkg'] || require('./package.json').devDependencies['$pkg'] || 'not installed'" 2>/dev/null)
    
    if [ "$current" != "$version" ]; then
        echo "   $pkg:"
        echo "     Current: $current"
        echo "     Required: $version"
        echo ""
    fi
done

# 2. Fix dependencies
echo "🔧 Would you like to fix these dependencies? (y/n)"
read -r response

if [[ "$response" =~ ^[Yy]$ ]]; then
    echo "📦 Updating dependencies..."
    npx expo doctor --fix-dependencies
    
    echo ""
    echo "✅ Dependencies updated!"
    echo ""
    echo "🚀 Starting Expo..."
    npx expo start --clear
else
    echo "⚠️  Skipping dependency updates"
    echo "   You may experience issues with Expo Go"
    echo ""
    echo "🚀 Starting Expo anyway..."
    npx expo start --clear
fi

echo ""
echo "📱 Tips for Expo Go:"
echo "   - Make sure Expo Go is updated to the latest version"
echo "   - Clear Expo Go cache if you see errors"
echo "   - Try using tunnel mode: npx expo start --tunnel"
