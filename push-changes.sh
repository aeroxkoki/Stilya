#\!/bin/bash

# Script to push changes to GitHub repository
echo "🚀 Preparing to push changes to GitHub repository..."

# Change to project root directory
cd /Users/koki_air/Documents/GitHub/Stilya

# Add all changes
echo "📦 Adding changes to git..."
git add package.json app.json eas.json

# Commit changes with descriptive message
echo "💬 Committing changes..."
git commit -m "fix: Resolve Android build issues in CI environment

- Added missing expo-notifications, expo-linking, and expo-localization dependencies
- Updated App entry point to App.tsx
- Fixed app.json configuration to be consistent with app.config.js
- Enhanced eas.json with proper Gradle build settings for CI
- Updated Android versionCode to 3"

# Push changes to GitHub
echo "☁️ Pushing changes to GitHub..."
git push origin main

echo "✅ Changes pushed to GitHub successfully\!"
