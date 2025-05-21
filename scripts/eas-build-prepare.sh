#!/bin/bash
# eas-build-prepare.sh - EASビルド前の環境整備スクリプト

# 色の定義
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# エラーが発生したら停止
set -e

echo -e "${BLUE}===== Stilya EAS ビルド前チェック =====${NC}"

# 環境変数の設定
export NODE_OPTIONS="--max-old-space-size=8192"
export EAS_SKIP_JAVASCRIPT_BUNDLING=1

# Yarn のキャッシュをクリーン
echo -e "${YELLOW}1. Yarn キャッシュのクリーニング...${NC}"
yarn cache clean

# Metro キャッシュのクリア
echo -e "${YELLOW}2. Metro キャッシュのクリア...${NC}"
rm -rf node_modules/.cache
rm -rf ~/.expo
rm -rf .expo
rm -rf .expo-shared

# Babel キャッシュのクリア
echo -e "${YELLOW}3. Babel キャッシュのクリア...${NC}"
rm -rf node_modules/.cache/babel-loader/*

# 依存関係の調整
echo -e "${YELLOW}4. 依存関係の確認...${NC}"
echo "  - @babel/runtime のバージョン固定化"
yarn add --dev @babel/runtime@7.27.1 --exact

echo "  - 依存関係の整理（dedupe）"
yarn dedupe

# node_modules の再構築
echo -e "${YELLOW}5. 依存関係の再構築...${NC}"
rm -rf node_modules
yarn install

# ビルド設定の確認
echo -e "${YELLOW}6. ビルド設定の確認...${NC}"
echo "  - app.json 内の projectId 確認:"
cat app.json | grep -A 3 "eas"

echo -e "${YELLOW}7. EAS環境の確認...${NC}"
npx eas-cli --version
npx eas-cli whoami

echo -e "${GREEN}✅ ビルド準備完了！${NC}"
echo -e "${BLUE}コマンド例:${NC}"
echo "  yarn eas:build:ci    # CI用ビルド"
echo "  yarn eas:build:dev   # 開発用ビルド"
