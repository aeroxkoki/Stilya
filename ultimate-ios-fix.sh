#!/bin/bash

# Ultimate fix for iOS Simulator localhost connection

echo "🚀 Ultimate fix for iOS Simulator connection..."

# 1. Complete cleanup
echo "🧹 Performing complete cleanup..."
pkill -f expo 2>/dev/null || true
pkill -f metro 2>/dev/null || true
pkill -f node 2>/dev/null || true
pkill -f "React Native" 2>/dev/null || true

# Remove all caches
rm -rf ~/.expo
rm -rf .expo
rm -rf node_modules/.cache
rm -rf ~/.metro-cache
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/react-*

# 2. Reset iOS Simulator
echo "📱 Resetting iOS Simulator settings..."
xcrun simctl shutdown all 2>/dev/null || true

# 3. Create explicit localhost configuration
echo "⚙️ Creating localhost configuration..."
cat > .expo/packager-info.json << EOF
{
  "devToolsPort": 19002,
  "expoServerPort": 8081,
  "packagerPort": 8081,
  "packagerPid": null,
  "expoServerNgrokUrl": null,
  "packagerNgrokUrl": null,
  "ngrokPid": null,
  "webpackServerPort": null,
  "packagerHost": "localhost"
}
EOF

# 4. Set environment variables
export EXPO_USE_FAST_REFRESH=true
export RCT_METRO_PORT=8081
export REACT_NATIVE_PACKAGER_HOSTNAME=localhost

# 5. Start Metro with explicit localhost
echo "🚀 Starting Metro on localhost:8081..."
npx expo start --localhost --clear &

# Wait for Metro to start
echo "⏳ Waiting for Metro to start..."
sleep 5

# 6. Open iOS Simulator
echo "📱 Opening iOS Simulator..."
open -a Simulator

# Wait for simulator to boot
sleep 3

# 7. Install and run the app
echo "📲 Installing app on simulator..."
npx expo run:ios --device "iPhone 15"

echo ""
echo "✅ Setup complete!"
echo ""
echo "📍 The app should now connect to: http://localhost:8081"
echo ""
echo "🔧 If you still see connection errors:"
echo "   1. In the simulator, press Cmd+D to open dev menu"
echo "   2. Select 'Configure Bundler'"
echo "   3. Set host to: localhost and port to: 8081"
