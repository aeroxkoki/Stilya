#\!/bin/bash

# Script to push changes to GitHub repository
echo "🚀 Preparing to push changes to GitHub repository..."

# Change to project root directory
cd /Users/koki_air/Documents/GitHub/Stilya

# Add all changes
echo "📦 Adding changes to git..."
git add .

# Commit changes with descriptive message
echo "💬 Committing changes..."
git commit -m "fix: Resolve yarn dependency issues and improve animation functionality

- Fixed yarn install --frozen-lockfile error
- Replaced Reanimated mocks with actual implementation
- Added AnimationTest screen for verifying setup
- Created fix-dependencies.sh script for easier setup
- Updated README.md with installation instructions
- Added ENVIRONMENT_SETUP.md for detailed setup guide"

# Push changes to GitHub
echo "☁️ Pushing changes to GitHub..."
git push origin main

echo "✅ Changes pushed to GitHub successfully\!"
