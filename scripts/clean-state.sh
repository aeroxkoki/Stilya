#!/bin/bash
# scripts/clean-state.sh

echo "🧹 Starting clean state initialization..."

# 1. Preserve critical configurations
echo "📦 Backing up critical files..."
cp .env .env.backup 2>/dev/null || echo "⚠️  .env file not found"
cp app.config.js app.config.js.backup 2>/dev/null || echo "⚠️  app.config.js not found"

# 2. Nuclear clean
echo "🗑️  Removing node_modules and cache directories..."
rm -rf node_modules
rm -rf .expo
rm -rf ios android  # Remove any existing prebuild artifacts
rm -f package-lock.json

# 3. Clear all caches
echo "🧹 Clearing all caches..."
npm cache clean --force
watchman watch-del-all 2>/dev/null || true

echo "✅ Clean state initialization complete!"
echo "📝 Next steps:"
echo "   1. Run 'npm install' to reinstall dependencies"
echo "   2. Run 'npx expo prebuild' to generate native projects"
