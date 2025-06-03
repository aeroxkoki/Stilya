#!/bin/bash

echo "🔄 Stilya開発環境の完全リセットを開始します..."

# 1. 現在のプロセスを停止
echo "📍 既存のプロセスを停止中..."
pkill -f "expo"
pkill -f "react-native"
lsof -ti:8081 | xargs kill -9 2>/dev/null || true

# 2. キャッシュクリア
echo "🗑️  キャッシュをクリア中..."
rm -rf node_modules
rm -rf .expo
rm -rf ~/Library/Developer/Xcode/DerivedData/*
watchman watch-del-all 2>/dev/null || true

# 3. Expoキャッシュクリア
echo "📦 Expoキャッシュをクリア中..."
npx expo doctor --fix-dependencies 2>/dev/null || true

# 4. 依存関係の再インストール
echo "📥 依存関係を再インストール中..."
npm install

# 5. iOSシミュレーターのリセット
echo "📱 iOSシミュレーターをリセット中..."
xcrun simctl shutdown all
xcrun simctl erase all

echo "✅ リセット完了！"
echo ""
echo "次のコマンドでアプリを起動してください："
echo "npm start -- --clear"
