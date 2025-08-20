#!/bin/bash

echo "🔧 Expo Go完全リセットスクリプト"
echo "================================"

# 1. すべてのExpoプロセスを終了
echo "1. Expoプロセスを終了します..."
pkill -f expo 2>/dev/null || true
pkill -f metro 2>/dev/null || true
pkill -f node 2>/dev/null || true

# 2. キャッシュを完全にクリア
echo "2. キャッシュを完全にクリアします..."
rm -rf .expo
rm -rf node_modules/.cache
rm -rf ios/Pods
rm -rf ios/build
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*
rm -rf $TMPDIR/react-*
rm -rf ~/.expo

# 3. watchmanのキャッシュをクリア
echo "3. watchmanのキャッシュをクリアします..."
if command -v watchman &> /dev/null; then
    watchman watch-del-all
fi

# 4. node_modulesを再インストール
echo "4. 依存関係を再インストールします..."
rm -rf node_modules
npm install

# 5. babel.config.jsの確認
echo "5. babel.config.jsの設定を確認..."
cat babel.config.js

# 6. Metro bundlerのキャッシュをクリアして起動
echo "6. Expo Goモードで起動します..."
echo ""
echo "================================"
echo "📱 Expo Goアプリでスキャンしてください"
echo "================================"
echo ""

# クリーンな状態で起動
npx expo start --clear

echo "スクリプトが完了しました。"
