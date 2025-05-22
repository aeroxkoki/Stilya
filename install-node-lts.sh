#!/bin/bash

# Node.js LTS バージョン (v20.x) インストールスクリプト
# このスクリプトは NVM をインストールし、Node.js の LTS バージョンを設定します

# 色の設定
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================${NC}"
echo -e "${GREEN}Node.js LTS バージョンインストーラー${NC}"
echo -e "${BLUE}======================================${NC}"

echo -e "${YELLOW}現在の Node.js バージョン:${NC} $(node -v)"
echo -e "${YELLOW}現在の NPM バージョン:${NC} $(npm -v)"

echo -e "\n${BLUE}1. NVM (Node Version Manager) をインストールします...${NC}"
echo -e "   NVM は Node.js の複数バージョンを管理するためのツールです。"

# NVM のインストール
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash

# NVM がシェルで利用可能になるようにする
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # NVM スクリプトを読み込む

# NVM が正しくインストールされたか確認
if ! command -v nvm &> /dev/null; then
  echo -e "${RED}❌ NVM のインストールに失敗しました。${NC}"
  echo -e "   手動でインストールしてください: https://github.com/nvm-sh/nvm#install--update-script"
  exit 1
else
  echo -e "${GREEN}✅ NVM が正常にインストールされました。${NC}"
fi

echo -e "\n${BLUE}2. Node.js LTS バージョンをインストールします...${NC}"

# LTS バージョンをインストール
nvm install --lts
nvm use --lts

# 確認
NODE_VERSION=$(node -v)
echo -e "${GREEN}✅ Node.js ${NODE_VERSION} (LTS) がインストールされました。${NC}"

echo -e "\n${BLUE}3. デフォルトのバージョンを LTS に設定します...${NC}"
nvm alias default lts/*
echo -e "${GREEN}✅ Node.js LTS バージョンがデフォルトに設定されました。${NC}"

echo -e "\n${BLUE}4. Stilya プロジェクトの依存関係を再インストールします...${NC}"
cd /Users/koki_air/Documents/GitHub/Stilya

# 既存の node_modules を削除
echo -e "   ${YELLOW}node_modules を削除しています...${NC}"
rm -rf node_modules
rm -f package-lock.json

# 依存関係を再インストール
echo -e "   ${YELLOW}npm install を実行しています...${NC}"
npm install

if [ $? -eq 0 ]; then
  echo -e "${GREEN}✅ 依存関係の再インストールが完了しました。${NC}"
else
  echo -e "${RED}❌ 依存関係のインストールに問題が発生しました。${NC}"
fi

echo -e "\n${BLUE}======================================${NC}"
echo -e "${GREEN}セットアップが完了しました！${NC}"
echo -e "${BLUE}======================================${NC}"
echo -e "新しいターミナルセッションを開いて、以下のコマンドでプロジェクトを起動してください:"
echo -e "${YELLOW}cd /Users/koki_air/Documents/GitHub/Stilya${NC}"
echo -e "${YELLOW}npm start${NC}"
echo -e "\nまたは以下のコマンドを使用してください:"
echo -e "${YELLOW}npx expo start${NC}"
