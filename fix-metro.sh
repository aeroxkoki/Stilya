#!/bin/bash
# Quick metro-config fix

echo "📦 Installing @expo/metro-config@0.9.0..."
npm install --save-dev @expo/metro-config@0.9.0 --force

echo "🧹 Clearing caches..."
rm -rf .expo
rm -rf node_modules/.cache

echo "🔍 Checking installation status..."
if [ -d "node_modules/@expo/metro-config" ]; then
  echo "✅ @expo/metro-config successfully installed"
else
  echo "❌ @expo/metro-config installation failed"
fi

echo "🏁 Done!"
