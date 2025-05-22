#!/bin/bash

# Expo起動スクリプト
echo "🚀 Starting Stilya app..."
echo "🔍 Node.js version: $(node -v)"

# TypeScriptトランスパイルを無効化する環境変数設定
export EXPO_NO_TYPESCRIPT_TRANSPILE=true

# node_modulesのローカルバイナリを直接使用
echo "📱 Launching Expo using local binaries..."
./node_modules/.bin/expo start --clear || node ./node_modules/expo/bin/cli.js start --clear

# 失敗した場合はnpxを試す
if [ $? -ne 0 ]; then
  echo "⚠️ Local binary failed, trying npx..."
  npx expo start --clear
fi

# それも失敗した場合は代替手段を試す
if [ $? -ne 0 ]; then
  echo "⚠️ Alternative approach, running with reduced features..."
  NODE_OPTIONS="--no-warnings" npx expo start --no-dev --minify
fi
