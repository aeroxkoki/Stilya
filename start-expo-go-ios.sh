#!/bin/bash

echo "🚀 Starting Stilya with Expo Go for iOS..."

# プロジェクトディレクトリに移動
cd /Users/koki_air/Documents/GitHub/Stilya

# キャッシュをクリア
echo "🧹 Clearing caches..."
rm -rf node_modules/.cache
rm -rf .expo/cache

# Expo Goで起動（QRコード表示）
echo "📱 Starting Expo Go..."
npx expo start --tunnel

# QRコードが表示されたら：
# 1. iPhoneでExpo Goアプリを開く
# 2. QRコードをスキャン
# 3. アプリが自動的に読み込まれます
