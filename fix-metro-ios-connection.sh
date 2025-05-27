#!/bin/bash

# Fix Metro Connection for iOS Simulator

echo "🔧 Fixing Metro bundler connection for iOS Simulator..."

# Kill any existing Metro processes
echo "📋 Stopping existing Metro processes..."
pkill -f "metro" || true
pkill -f "expo" || true

# Clear caches
echo "🧹 Clearing caches..."
rm -rf "$HOME/.metro-cache"
rm -rf "$HOME/.expo/cache"
rm -rf .expo
rm -rf node_modules/.cache

# Reset watchman if installed
if command -v watchman >/dev/null 2>&1; then
    echo "🔄 Resetting watchman..."
    watchman watch-del-all
fi

# Create a custom Metro configuration for debugging
echo "📝 Creating debug Metro configuration..."
cat > metro.config.debug.js << 'EOF'
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Enhanced resolver for debugging
config.resolver = {
  ...config.resolver,
  sourceExts: [...config.resolver.sourceExts, 'mjs'],
  alias: {
    '@': path.resolve(__dirname, 'src'),
    '@/components': path.resolve(__dirname, 'src/components'),
    '@/screens': path.resolve(__dirname, 'src/screens'),
    '@/hooks': path.resolve(__dirname, 'src/hooks'),
    '@/services': path.resolve(__dirname, 'src/services'),
    '@/utils': path.resolve(__dirname, 'src/utils'),
    '@/types': path.resolve(__dirname, 'src/types'),
    '@/store': path.resolve(__dirname, 'src/store'),
    '@/constants': path.resolve(__dirname, 'src/constants'),
    '@/assets': path.resolve(__dirname, 'assets'),
  },
  assetExts: [...(config.resolver?.assetExts || []), 'css'],
};

// Transformer configuration
config.transformer = {
  ...config.transformer,
  getTransformOptions: async () => ({
    transform: {
      experimentalImportSupport: false,
      inlineRequires: true,
    },
  }),
};

// Server configuration for better connectivity
config.server = {
  ...config.server,
  port: 8081,
  rewriteRequestUrl: (url) => {
    return url.replace('localhost', '127.0.0.1');
  },
};

// Watchman configuration
config.watchFolders = [path.resolve(__dirname)];
config.resetCache = true;
config.maxWorkers = 4;

module.exports = withNativeWind(config, { 
  input: './src/styles/global.css',
  inlineRem: false,
});
EOF

# Update package.json to use the debug configuration temporarily
echo "📦 Updating start script..."
cp package.json package.json.backup
sed -i '' 's/"start": "expo start"/"start": "expo start --clear"/' package.json

# Start Metro with specific options
echo "🚀 Starting Metro bundler with debugging configuration..."
RCT_METRO_PORT=8081 npm start &

# Wait for Metro to start
echo "⏳ Waiting for Metro bundler to start..."
sleep 10

# Get the bundler URL
BUNDLER_URL="http://localhost:8081"

echo "✅ Metro bundler should now be running at: $BUNDLER_URL"
echo ""
echo "📱 Next steps:"
echo "1. Open your iOS Simulator"
echo "2. If the app is already installed, delete it and reinstall"
echo "3. Try running: npm run start:ios"
echo ""
echo "🔍 If you still see connection errors:"
echo "   - Check that port 8081 is not blocked by firewall"
echo "   - Try using the device's IP address instead of localhost"
echo "   - Make sure Xcode command line tools are installed"
echo ""
echo "💡 To check if Metro is running correctly:"
echo "   curl $BUNDLER_URL/status"
