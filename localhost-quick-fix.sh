#!/bin/bash

# Quick localhost fix

echo "🔧 Quick fix: Forcing localhost connection..."

# Kill existing processes
pkill -f expo 2>/dev/null || true
pkill -f metro 2>/dev/null || true

# Clear .expo directory
rm -rf .expo
mkdir -p .expo

# Create packager-info.json with localhost
cat > .expo/packager-info.json << EOF
{
  "packagerHost": "localhost",
  "packagerPort": 8081
}
EOF

# Start with localhost
echo "🚀 Starting Expo on localhost..."
REACT_NATIVE_PACKAGER_HOSTNAME=localhost npx expo start --localhost --clear

# After starting, press 'i' to open iOS simulator
