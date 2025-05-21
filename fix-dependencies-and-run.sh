#!/bin/bash
# fix-dependencies-and-run.sh
# 依存関係を一括修正してローカル開発環境を起動するスクリプト

set -e

echo "🔧 Stilya開発環境のセットアップを開始します..."

# 依存関係を一括修正
echo "📦 Metro/Babel依存関係を修正中..."
bash ./scripts/fix-metro-dependencies.sh

# キャッシュのクリア
echo "🧹 キャッシュを完全にクリア..."
rm -rf node_modules/.cache
rm -rf ~/.expo/cache 2>/dev/null || true
rm -rf .expo/cache 2>/dev/null || true
rm -rf .metro-cache 2>/dev/null || true
yarn cache clean

# Expoを起動
echo "🚀 Expo開発サーバーを起動します..."
echo "🔄 起動中..."
expo start --clear
