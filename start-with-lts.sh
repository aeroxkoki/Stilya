#!/bin/bash

# Stilya 起動スクリプト (Node.js LTS用)
# NVM が正しく設定されていることを確認し、Stilya プロジェクトを起動します

# 色の設定
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================${NC}"
echo -e "${GREEN}Stilya アプリ起動スクリプト (Node.js LTS用)${NC}"
echo -e "${BLUE}======================================${NC}"

# NVM設定の読み込み
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # NVM スクリプトを読み込む

# NVMが利用可能かチェック
if ! command -v nvm &> /dev/null; then
  echo -e "${RED}❌ NVM が見つかりません。インストールを確認してください。${NC}"
  echo -e "   NVMのインストール: ./install-node-lts.sh"
  echo -e "   または: NODE_DOWNGRADE_GUIDE.md の手順に従ってください。"
  exit 1
fi

# Node.js LTSを使用
echo -e "${YELLOW}Node.js LTS バージョンを使用します...${NC}"
nvm use --lts || nvm use lts/*

# 現在のバージョンを表示
NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)
echo -e "${GREEN}Node.js バージョン: ${NODE_VERSION}${NC}"
echo -e "${GREEN}NPM バージョン: ${NPM_VERSION}${NC}"

echo -e "\n${BLUE}Stilya プロジェクトを起動します...${NC}"
cd /Users/koki_air/Documents/GitHub/Stilya

# Expo アプリを起動
npx expo start

echo -e "\n${BLUE}======================================${NC}"
echo -e "${GREEN}終了しました${NC}"
echo -e "${BLUE}======================================${NC}"
