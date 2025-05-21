#!/bin/bash

# pre-eas-build.sh
# Stilya プロジェクト用ビルド前準備スクリプト

echo "🔧 Stilya ビルド準備開始"

# 環境変数の確認
echo "環境変数確認:"
if [ -z "$NODE_ENV" ]; then
  export NODE_ENV=production
  echo "NODE_ENV が未設定のため、'production' に設定しました"
else
  echo "NODE_ENV: $NODE_ENV"
fi

# キャッシュクリア
echo "🧹 キャッシュをクリア中..."
rm -rf ~/.expo ~/.cache/metro .expo .expo-shared
yarn cache clean

# eas.json の設定を確認
echo "📋 eas.json の設定確認:"
cat ./eas.json

# バージョン情報の出力
echo "📦 パッケージ情報:"
node -v
npm -v
yarn -v
npx eas-cli --version

echo "✅ ビルド準備完了"
exit 0
