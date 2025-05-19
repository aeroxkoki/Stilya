#!/bin/bash
# Simplified Metro dependencies configuration for EAS builds

echo "⚙️ Configuring Metro dependencies for EAS compatibility..."

# Clean up caches
rm -rf node_modules/.cache
rm -rf ~/.expo/cache
rm -rf ~/.metro-cache

# Ensure correct Metro dependencies
echo "📦 Installing correct Metro versions..."
npm install --save-dev metro@0.76.8 metro-config@0.76.8 @expo/metro-config@^0.10.7

echo "✅ Metro dependencies configured successfully"
