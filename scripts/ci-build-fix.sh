#\!/bin/bash
# fix-ci-build.sh
# GitHub Actions CI環境でのExpo EASビルド問題を修正するスクリプト

set -e

echo "🔧 GitHub Actions CI/EAS環境特有の問題を修正します..."

# シリアライザのパッチ適用
echo "📦 Metro serializer問題のパッチを適用..."
node patch-expo-serializer.js

# Node環境最適化
export NODE_OPTIONS="--max-old-space-size=8192"

# Metro依存関係の修正
echo "📦 Metro依存関係を最適化..."
npm install --no-save --no-package-lock \
  metro@0.76.8 \
  metro-config@0.76.8 \
  @expo/metro-config@0.20.14 \
  metro-cache@0.76.8 \
  metro-minify-terser@0.76.8 \
  metro-transform-worker@0.76.8

# Babel設定の修正
echo "📦 Babel依存関係を最適化..."
npm install --no-save --no-package-lock \
  @babel/runtime@7.27.1 \
  babel-preset-expo@13.0.0

# キャッシュのクリア
echo "🧹 キャッシュを完全にクリア..."
rm -rf node_modules/.cache
rm -rf ~/.expo/cache 2>/dev/null || true
rm -rf .expo/cache 2>/dev/null || true
rm -rf .metro-cache 2>/dev/null || true
npm cache clean --force

echo "✅ CI/EAS環境用のビルド修正が完了しました！"
