#!/bin/bash

# Stilya Setup & Launch Script
# このスクリプトは、依存関係の再インストールとExpoプロジェクトの起動を行います。

# 色の設定
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================${NC}"
echo -e "${GREEN}Stilya - 開発環境セットアップ & 起動スクリプト${NC}"
echo -e "${BLUE}======================================${NC}"

# 現在のNode.jsバージョンを表示
echo -e "${YELLOW}Node.js Version:${NC} $(node -v)"
echo -e "${YELLOW}NPM Version:${NC} $(npm -v)"

# 依存関係の削除と再インストール
echo -e "\n${BLUE}1. 依存関係をクリーンインストールします...${NC}"

# node_modulesフォルダを削除
echo -e "   ${YELLOW}node_modulesフォルダを削除します...${NC}"
rm -rf node_modules
rm -f package-lock.json

# 依存関係をインストール
echo -e "   ${YELLOW}npm install を実行します...${NC}"
npm install

# インストール結果の確認
if [ $? -ne 0 ]; then
  echo -e "${RED}❌ 依存関係のインストールに失敗しました。${NC}"
  exit 1
else
  echo -e "${GREEN}✅ 依存関係のインストールが完了しました。${NC}"
fi

# Expoアプリの起動
echo -e "\n${BLUE}2. シンプルな環境でExpoを起動します...${NC}"
echo -e "   ${YELLOW}npx expo start --clear --no-dev を実行します...${NC}"

# TypeScriptのトランスパイルを無効化
export EXPO_NO_TYPESCRIPT_TRANSPILE=true

# シンプルなJSアプリを起動
node init.js

echo -e "\n${BLUE}======================================${NC}"
echo -e "${GREEN}処理が完了しました${NC}"
echo -e "${BLUE}======================================${NC}"
