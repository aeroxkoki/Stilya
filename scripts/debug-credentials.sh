#!/bin/bash

# debug-credentials.sh
# このスクリプトはStilya CI環境でCredentialsの問題をデバッグするためのものです

echo "==== Credentials Debugging Tool ===="
echo "Current directory: $(pwd)"
echo "System info: $(uname -a)"
echo ""

echo "==== Checking credentials.json ===="
if [ -f "credentials.json" ]; then
  echo "credentials.json exists at: $(realpath credentials.json)"
  echo "File permissions: $(ls -la credentials.json)"
  echo "Contents (with passwords masked):"
  cat credentials.json | sed 's/"keystorePassword": "[^"]*"/"keystorePassword": "****"/g' | sed 's/"keyPassword": "[^"]*"/"keyPassword": "****"/g'
else
  echo "credentials.json NOT FOUND in current directory!"
  echo "Checking parent directories..."
  parent_dir="$(dirname "$(pwd)")"
  if [ -f "$parent_dir/credentials.json" ]; then
    echo "Found in parent directory: $parent_dir/credentials.json"
  else
    echo "Not found in parent directory either"
  fi
fi
echo ""

echo "==== Checking Keystore ===="
KEYSTORE_PATH="android/app/stilya-keystore.jks"
if [ -f "$KEYSTORE_PATH" ]; then
  echo "Keystore file exists at: $(realpath "$KEYSTORE_PATH")"
  echo "File permissions: $(ls -la "$KEYSTORE_PATH")"
  echo "File size: $(du -h "$KEYSTORE_PATH" | cut -f1)"
else
  echo "Keystore NOT FOUND at $KEYSTORE_PATH"
  echo "Checking for other keystore files:"
  find . -name "*.jks" -o -name "*.keystore" | grep -v "node_modules" || echo "No keystore files found"
fi
echo ""

echo "==== Checking EAS configs ===="
echo "eas.json content:"
if [ -f "eas.json" ]; then
  cat eas.json
else
  echo "eas.json not found!"
fi
echo ""

echo "==== EAS CLI version ===="
npx eas-cli --version || echo "EAS CLI not properly installed"
echo ""

echo "==== Recommendations ===="
echo "1. Ensure credentials.json is at the project root directory"
echo "2. Ensure the keystore path in credentials.json matches the actual path"
echo "3. Check if the keystore file exists and has proper permissions"
echo "4. Verify EAS CLI version is compatible with your project configuration"
echo ""

echo "==== End of Debug Info ===="
