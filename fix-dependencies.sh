#!/bin/bash

echo "🔧 Stilya依存関係修正スクリプト"
echo "================================"

# 1. キャッシュクリア
echo "📦 キャッシュをクリアしています..."
rm -rf node_modules
rm -rf .expo
rm -rf .metro-cache
rm -f package-lock.json

# 2. watchmanクリア (インストールされている場合)
if command -v watchman &> /dev/null; then
    echo "🔄 watchmanをリセットしています..."
    watchman watch-del-all
fi

# 3. npmキャッシュクリア
echo "🧹 npmキャッシュをクリアしています..."
npm cache clean --force

# 4. 依存関係の再インストール
echo "📥 依存関係をインストールしています..."
npm install --legacy-peer-deps

# 5. Expo Doctorの実行
echo "🏥 Expo Doctorを実行しています..."
npx expo-doctor

echo "✅ 修正完了！"
echo ""
echo "次のステップ:"
echo "1. npx expo start --clear でアプリを起動"
echo "2. Expo Goで再度テスト"
