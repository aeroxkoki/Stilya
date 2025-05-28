#!/bin/bash

echo "🔧 Stilya Development Server Fix Script"
echo "======================================="

# Step 1: Clean existing processes
echo "1. Cleaning existing Expo processes..."
pkill -f "expo start" || true
pkill -f "metro" || true

# Step 2: Clear caches
echo "2. Clearing caches..."
rm -rf node_modules/.cache
rm -rf .expo
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*

# Step 3: Get IP address
IP_ADDRESS=$(ipconfig getifaddr en0)
if [ -z "$IP_ADDRESS" ]; then
    IP_ADDRESS=$(ipconfig getifaddr en1)
fi

echo "3. Local IP Address: $IP_ADDRESS"

# Step 4: Create .expo directory with settings
mkdir -p .expo
cat > .expo/settings.json << EOF
{
  "hostType": "lan",
  "lanType": "ip",
  "dev": true,
  "minify": false,
  "urlRandomness": null,
  "https": false,
  "scheme": null,
  "devClient": false
}
EOF

echo "4. Created .expo/settings.json"

# Step 5: Start Expo with specific settings
echo "5. Starting Expo server..."
echo "   URL will be: exp://$IP_ADDRESS:8081"
echo ""
echo "📱 iOS Simulator Instructions:"
echo "   1. Press 'i' to open iOS simulator"
echo "   2. If connection fails, shake device (Cmd+D) and 'Reload'"
echo ""

# Start Expo with clear cache
EXPO_USE_FAST_REFRESH=true npx expo start --clear --host lan

