#!/bin/bash

# Stilya - Expo起動スクリプト（Node.js v20使用）

# nodebrewのパスを設定
export PATH=$HOME/.nodebrew/current/bin:$PATH

# プロジェクトディレクトリに移動
cd /Users/koki_air/Documents/GitHub/Stilya

echo "🚀 Stilya Expo起動中..."
echo "Node.js version: $(node --version)"
echo "npm version: $(npm --version)"
echo ""

# Metro設定を一時的に無効化
if [ -f metro.config.js ]; then
    echo "📝 metro.config.jsを一時的に無効化"
    mv metro.config.js metro.config.js.temp 2>/dev/null
fi

# Expoを起動
echo "Starting Expo..."
npx expo start --clear
