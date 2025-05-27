#!/bin/bash

# Simple start script for Stilya app

echo "🚀 Starting Stilya app..."

# Check for any running processes
pkill -f expo 2>/dev/null || true
pkill -f metro 2>/dev/null || true

# Clear cache
rm -rf .expo 2>/dev/null || true

# Start the app
npx expo start --clear

# Alternative commands:
# npx expo start --ios    # Open in iOS simulator directly
# npx expo start --tunnel  # Use tunnel for external device testing
