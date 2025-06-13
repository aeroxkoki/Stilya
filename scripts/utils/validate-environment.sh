#!/bin/bash
# Create this as scripts/validate-environment.sh

echo "🔍 Validating development environment..."

# Node.js version check
NODE_VERSION=$(/usr/local/bin/node -v | cut -d'v' -f2)
NODE_MAJOR=$(echo $NODE_VERSION | cut -d'.' -f1)
if [ $NODE_MAJOR -lt 18 ]; then
    echo "❌ Node.js 18+ required. Current: $NODE_VERSION"
    exit 1
fi
echo "✅ Node.js version: v$NODE_VERSION"

# Platform-specific checks
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS - Check Xcode
    if ! xcode-select -p &> /dev/null; then
        echo "❌ Xcode not found. Install from App Store"
        exit 1
    fi
    echo "✅ Xcode installed at: $(xcode-select -p)"
    
    # Check CocoaPods
    if ! command -v pod &> /dev/null; then
        echo "⚠️  CocoaPods not found. Installing..."
        sudo gem install cocoapods
    else
        echo "✅ CocoaPods version: $(pod --version)"
    fi
fi

# Check Java for Android
if ! java -version &> /dev/null; then
    echo "⚠️  Java not found (required for Android builds)"
else
    echo "✅ Java installed"
fi

# Check Expo CLI
if ! command -v expo &> /dev/null; then
    echo "⚠️  Expo CLI not found globally"
else
    echo "✅ Expo CLI installed"
fi

# Check EAS CLI
if ! command -v eas &> /dev/null; then
    echo "⚠️  EAS CLI not found. Installing..."
    npm install -g eas-cli
else
    echo "✅ EAS CLI version: $(eas --version)"
fi

echo "✅ Environment validation complete"
