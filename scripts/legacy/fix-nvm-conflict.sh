#!/bin/bash

# NVM競合解決スクリプト
# ユーザーの.npmrcファイルをバックアップし、競合する設定を削除します

# 色の設定
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================${NC}"
echo -e "${GREEN}NVM競合解決スクリプト${NC}"
echo -e "${BLUE}======================================${NC}"

# .npmrcファイルのパス
NPMRC_FILE="$HOME/.npmrc"

# .npmrcファイルが存在するか確認
if [ -f "$NPMRC_FILE" ]; then
  # バックアップを作成
  BACKUP_FILE="$HOME/.npmrc.backup-$(date +%Y%m%d%H%M%S)"
  echo -e "${YELLOW}.npmrcファイルのバックアップを作成しています: ${BACKUP_FILE}${NC}"
  cp "$NPMRC_FILE" "$BACKUP_FILE"
  
  # 競合する設定を削除
  echo -e "${YELLOW}競合する設定を削除しています...${NC}"
  grep -v "^prefix=" "$NPMRC_FILE" | grep -v "^globalconfig=" > "$NPMRC_FILE.tmp"
  mv "$NPMRC_FILE.tmp" "$NPMRC_FILE"
  
  echo -e "${GREEN}✅ .npmrcファイルから競合する設定を削除しました。${NC}"
else
  echo -e "${YELLOW}.npmrcファイルが見つかりません。何もする必要はありません。${NC}"
fi

# NVMの設定を再度読み込む
echo -e "${YELLOW}NVMの設定を読み込みます...${NC}"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Node.js LTSバージョンを使用
echo -e "${YELLOW}Node.js LTSバージョンを使用します...${NC}"
nvm use --lts || nvm use lts/*

# 現在のバージョンを表示
NODE_VERSION=$(node -v)
NPM_VERSION=$(npm -v)

echo -e "${GREEN}Node.js バージョン: ${NODE_VERSION}${NC}"
echo -e "${GREEN}NPM バージョン: ${NPM_VERSION}${NC}"

echo -e "\n${BLUE}======================================${NC}"
echo -e "${GREEN}NVMの競合が解決されました！${NC}"
echo -e "${BLUE}======================================${NC}"
echo -e "次に、プロジェクトの依存関係を修復してください:\n"
echo -e "${YELLOW}cd /Users/koki_air/Documents/GitHub/Stilya${NC}"
echo -e "${YELLOW}./fix-project.sh${NC}"
