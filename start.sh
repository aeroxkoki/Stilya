#!/bin/bash

# Node.jsバージョンの確認
NODE_VERSION=$(node -v)
echo "Using Node.js version: $NODE_VERSION"

# 環境変数の設定（TypeScriptトランスパイル無効化）
export EXPO_NO_TYPESCRIPT_TRANSPILE=true

# 現在のディレクトリを表示
echo "Current directory: $(pwd)"

# シンプルモードで実行
echo "Starting Expo in development mode..."
npx expo start --clear

# エラーが発生した場合のフォールバック
if [ $? -ne 0 ]; then
  echo "Failed to start Expo. Trying fallback method..."
  
  # Expoバージョンの確認
  npx expo --version
  
  # 別の方法で実行
  echo "Trying alternative start method..."
  NODE_OPTIONS="--no-warnings --max-old-space-size=4096" npx expo start --clear
fi
