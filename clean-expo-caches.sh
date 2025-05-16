#!/bin/bash
# Clean Metro and Expo caches to resolve serialization issues

echo "Cleaning Metro and Expo caches..."

# Backup your metro.config.js first
if [ -f "metro.config.js" ]; then
  cp metro.config.js metro.config.js.bak
  echo "✅ Backed up metro.config.js"
fi

# Clear common cache locations
rm -rf node_modules/.cache
rm -rf $HOME/.expo/cache
rm -rf .expo

# Specialized Metro caches
rm -rf node_modules/.cache/metro
rm -rf node_modules/.cache/metro-babel-register
rm -rf node_modules/.cache/metro-*

# Clear watchman cache if it's installed
if command -v watchman &> /dev/null; then
  watchman watch-del-all
  echo "✅ Cleared watchman watches"
fi

# Clear yarn cache for expo packages
yarn cache clean @expo/cli || true
yarn cache clean metro || true
yarn cache clean metro-* || true

# Clear npm cache as backup
npm cache clean --force || true

echo "✅ All caches cleared successfully!"
echo "Now you can run 'npm run fix-expo-embed' to apply the serializer patch"
