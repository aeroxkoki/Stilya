#!/bin/bash

# Stilya セットアップオールインワンスクリプト
# 1. NVMの競合を解決
# 2. LTSバージョンの設定
# 3. プロジェクトの修復
# 4. expoの起動

# 色の設定
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================${NC}"
echo -e "${GREEN}Stilya セットアップオールインワンスクリプト${NC}"
echo -e "${BLUE}======================================${NC}"

# 現在のディレクトリを保存
CURRENT_DIR=$(pwd)
cd /Users/koki_air/Documents/GitHub/Stilya

echo -e "${YELLOW}現在の Node.js バージョン: $(node -v)${NC}"
echo -e "${YELLOW}現在の NPM バージョン: $(npm -v)${NC}"

# ステップ1: NVMの競合を解決
echo -e "\n${BLUE}ステップ1: NVMの競合を解決します...${NC}"

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
  echo -e "${YELLOW}.npmrcファイルが見つかりません。このステップをスキップします。${NC}"
fi

# NVMの設定を再度読み込む
echo -e "${YELLOW}NVMの設定を読み込みます...${NC}"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Node.js LTSバージョンを使用
echo -e "${YELLOW}Node.js LTSバージョンを使用します...${NC}"
nvm use --lts || nvm use lts/*

# ステップ2: プロジェクトをクリーンアップ
echo -e "\n${BLUE}ステップ2: プロジェクトをクリーンアップします...${NC}"
echo -e "${YELLOW}node_modules を削除しています...${NC}"
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock

# ステップ3: 必要なパッケージをインストール
echo -e "\n${BLUE}ステップ3: 必要なパッケージをインストールします...${NC}"

echo -e "${YELLOW}expo をインストールしています...${NC}"
npm install expo --save

echo -e "${YELLOW}その他の依存関係をインストールしています...${NC}"
npm install

# ステップ4: インストール状態を確認
echo -e "\n${BLUE}ステップ4: インストール状態を確認します...${NC}"
if [ -d "node_modules/expo" ]; then
  echo -e "${GREEN}✅ expo パッケージが正常にインストールされました。${NC}"
else
  echo -e "${RED}❌ expo パッケージのインストールに失敗しました。${NC}"
  echo -e "${YELLOW}手動で次のコマンドを実行してください: npm install expo --save${NC}"
  exit 1
fi

# ステップ5: アプリを起動
echo -e "\n${BLUE}ステップ5: アプリを起動します...${NC}"
echo -e "${YELLOW}npx expo start を実行します...${NC}"

# Expoの環境変数設定
export EXPO_NO_TYPESCRIPT_TRANSPILE=true

# アプリを起動
npx expo start

# 元のディレクトリに戻る
cd "$CURRENT_DIR"

echo -e "\n${BLUE}======================================${NC}"
echo -e "${GREEN}セットアップが完了しました！${NC}"
echo -e "${BLUE}======================================${NC}"
