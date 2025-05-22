#!/bin/bash

# Stilya プロジェクト修復スクリプト
# .npmrc の競合を解決し、必要な依存関係をインストールします

# 色の設定
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================${NC}"
echo -e "${GREEN}Stilya プロジェクト修復スクリプト${NC}"
echo -e "${BLUE}======================================${NC}"

# 1. NVM の設定の競合を解決
echo -e "\n${BLUE}1. NVM の競合を解決します...${NC}"

# NVM設定の読み込み
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # NVM スクリプトを読み込む

# .npmrc の競合を解決
echo -e "${YELLOW}NVM の prefix 設定を解除します...${NC}"
nvm use --delete-prefix

# 2. プロジェクトのクリーンアップ
echo -e "\n${BLUE}2. プロジェクトをクリーンアップします...${NC}"
cd /Users/koki_air/Documents/GitHub/Stilya

echo -e "${YELLOW}node_modules を削除しています...${NC}"
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock

# 3. 必要なパッケージをインストール
echo -e "\n${BLUE}3. 必要なパッケージをインストールします...${NC}"

echo -e "${YELLOW}expo をインストールしています...${NC}"
npm install expo

echo -e "${YELLOW}その他の依存関係をインストールしています...${NC}"
npm install

# 4. 確認
echo -e "\n${BLUE}4. インストール状態を確認します...${NC}"
if [ -d "node_modules/expo" ]; then
  echo -e "${GREEN}✅ expo パッケージが正常にインストールされました。${NC}"
else
  echo -e "${RED}❌ expo パッケージのインストールに失敗しました。${NC}"
fi

echo -e "\n${BLUE}======================================${NC}"
echo -e "${GREEN}修復が完了しました！${NC}"
echo -e "${BLUE}======================================${NC}"
echo -e "次のコマンドでプロジェクトを起動してください:\n"
echo -e "${YELLOW}npx expo start${NC}"
echo -e "または"
echo -e "${YELLOW}npm start${NC}"
