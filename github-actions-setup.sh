#!/bin/bash
# GitHub Actions対応のEAS環境で実行するためのスクリプト

echo "====== GitHub Actions環境でのビルド前準備を実行 ======"

# 必要なモジュールとバージョンを確認
NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
YARN_VERSION=$(yarn -v 2>/dev/null || echo "not installed")
EAS_VERSION=$(npx eas-cli --version 2>/dev/null || echo "not installed")

echo "現在の環境:"
echo "Node: $NODE_VERSION"
echo "NPM: $NPM_VERSION" 
echo "Yarn: $YARN_VERSION"
echo "EAS CLI: $EAS_VERSION"

# キャッシュをクリア
echo "キャッシュをクリアしています..."
rm -rf node_modules/.cache
rm -rf $HOME/.expo
rm -rf $HOME/.metro

# メトロシリアライザー問題の修正を適用
echo "シリアライザー修正を適用しています..."
bash ./fix-metro-serializer-direct.sh

# ビルド前のパッケージチェック
echo "パッケージの整合性を確認しています..."
NODE_OPTIONS="--max-old-space-size=8192" yarn install --force

echo "====== GitHub Actions環境での準備が完了しました ======"
echo "以下のコマンドでビルドを実行してください:"
echo "node run-patched-expo-export.js"
