#!/bin/bash

# Metro Bundlerの依存関係を修正するスクリプト
echo "📦 Metro dependencies fix script running..."

# 必要なパッケージのインストール確認
if ! grep -q "metro-config" package.json; then
  echo "🔧 Installing metro-config..."
  npm install --save-dev metro-config
fi

if ! grep -q "metro-react-native-babel-preset" package.json; then
  echo "🔧 Installing metro-react-native-babel-preset..."
  npm install --save-dev metro-react-native-babel-preset
fi

# metro.config.jsファイルが存在しない場合は作成
if [ ! -f metro.config.js ]; then
  echo "📝 Creating metro.config.js..."
  cat > metro.config.js << 'EOL'
// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = config;
EOL
fi

# eas.jsonファイルが存在しない場合は作成
if [ ! -f eas.json ]; then
  echo "📝 Creating eas.json..."
  cat > eas.json << 'EOL'
{
  "cli": {
    "version": ">= 3.13.3"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal"
    },
    "production": {
      "android": {
        "buildType": "apk"
      },
      "distribution": "store"
    }
  },
  "submit": {
    "production": {}
  }
}
EOL
fi

echo "✅ Metro dependencies fix completed"
