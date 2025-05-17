#!/bin/bash

# Fix dependencies script for Stilya app
echo "🔧 Fixing Stilya dependencies..."

# Change to project root directory
cd "$(dirname "$0")"

# Remove existing lock files and node_modules
echo "🧹 Cleaning up old dependencies..."
rm -rf node_modules
rm -f yarn.lock
rm -f package-lock.json

# Install dependencies with yarn (without frozen-lockfile)
echo "📦 Installing dependencies with yarn and legacy-peer-deps..."
yarn install --legacy-peer-deps

# Verify installation
if [ -d "node_modules" ]; then
  echo "✅ Dependencies installed successfully!"
  echo "🚀 You can now run 'yarn start' to launch the app."
else
  echo "❌ Dependency installation failed."
  echo "Try running 'npm install' instead."
fi
