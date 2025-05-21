#!/bin/bash
# fix-ci-build.sh
# GitHub Actions CI環境でのExpo EASビルド問題を修正するスクリプト

set -e

echo "🔧 GitHub Actions CI/EAS環境特有の問題を修正します..."

# パッチ適用用ディレクトリの作成
if [ ! -d patches ]; then
  mkdir -p patches
fi

# シリアライザのパッチ適用
echo "📦 Metro serializer問題のパッチを適用..."
if [ -f patch-expo-serializer.js ]; then
  node patch-expo-serializer.js
else
  echo "⚠️ patch-expo-serializer.js が見つかりません。スキップします。"
fi

# 環境変数の確認
if [ -n "$EXPO_TOKEN" ]; then
  echo "✅ EXPO_TOKEN環境変数が設定されています"
else
  echo "⚠️ EXPO_TOKEN環境変数が見つかりません。GitHubシークレットを確認してください。"
  exit 1
fi

# Node環境最適化
export NODE_OPTIONS="--max-old-space-size=8192"

# Metro依存関係の修正
echo "📦 Metro依存関係を最適化..."
yarn add --dev --exact \
  metro@0.77.0 \
  metro-config@0.77.0 \
  @expo/metro-config@0.9.0 \
  metro-cache@0.77.0 \
  metro-minify-terser@0.77.0 \
  metro-transform-worker@0.77.0

# Babel設定の修正
echo "📦 Babel依存関係を最適化..."
yarn add --exact \
  @babel/runtime@7.27.1
yarn add --dev --exact \
  babel-preset-expo@13.1.11 \
  babel-plugin-transform-remove-console@6.9.4

# package.jsonのresolutions更新
echo "📦 package.jsonのresolutionsを更新..."
node -e '
const fs = require("fs");
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
pkg.resolutions = {
  "@babel/runtime": "7.27.1",
  "metro": "0.77.0", 
  "metro-config": "0.77.0",
  "metro-cache": "0.77.0",
  "metro-minify-terser": "0.77.0",
  "metro-transform-worker": "0.77.0",
  "@expo/metro-config": "0.9.0",
  "babel-preset-expo": "13.1.11",
  "rimraf": "^3.0.2"
};
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
'

# キャッシュのクリア
echo "🧹 キャッシュを完全にクリア..."
rm -rf node_modules/.cache
rm -rf ~/.expo/cache 2>/dev/null || true
rm -rf .expo/cache 2>/dev/null || true
rm -rf .metro-cache 2>/dev/null || true
yarn cache clean || true

echo "✅ CI/EAS環境用のビルド修正が完了しました！"