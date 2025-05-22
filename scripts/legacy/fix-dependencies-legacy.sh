#!/bin/bash

# Stilya 依存関係修復スクリプト (レガシーモード)
# React バージョンの競合を --legacy-peer-deps フラグで解決します

# 色の設定
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}======================================${NC}"
echo -e "${GREEN}Stilya 依存関係修復スクリプト (レガシーモード)${NC}"
echo -e "${BLUE}======================================${NC}"

# 現在のディレクトリを保存
CURRENT_DIR=$(pwd)
cd /Users/koki_air/Documents/GitHub/Stilya

echo -e "${YELLOW}現在の Node.js バージョン: $(node -v)${NC}"
echo -e "${YELLOW}現在の NPM バージョン: $(npm -v)${NC}"

# NVMの設定を読み込む
echo -e "\n${BLUE}1. NVM の設定を読み込みます...${NC}"
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# 正しい Node.js バージョンを確認
echo -e "\n${BLUE}2. Node.js LTS バージョンを使用します...${NC}"
nvm use --lts || nvm use lts/*

# プロジェクトをクリーンアップ
echo -e "\n${BLUE}3. プロジェクトをクリーンアップします...${NC}"
echo -e "${YELLOW}node_modules を削除しています...${NC}"
rm -rf node_modules
rm -f package-lock.json
rm -f yarn.lock

# package.json のバックアップを作成
echo -e "\n${BLUE}4. package.json のバックアップを作成します...${NC}"
cp package.json package.json.backup

# React バージョンを修正
echo -e "\n${BLUE}5. React のバージョンを調整します...${NC}"
# jqがインストールされていない場合は手動で編集する必要がある警告を表示
if command -v jq &> /dev/null; then
    echo -e "${YELLOW}package.json を更新しています...${NC}"
    jq '.dependencies.react = "^19.0.0"' package.json > package.json.tmp && mv package.json.tmp package.json
else
    echo -e "${YELLOW}jq コマンドが見つからないため、package.json を手動で更新してください。${NC}"
    echo -e "${YELLOW}package.json 内の react のバージョンを \"^19.0.0\" に変更してください。${NC}"
fi

# レガシーモードでインストール
echo -e "\n${BLUE}6. レガシーモードで依存関係をインストールします...${NC}"
echo -e "${YELLOW}npm install --legacy-peer-deps を実行しています...${NC}"
npm install --legacy-peer-deps

# expo のインストールを確認
echo -e "\n${BLUE}7. expo パッケージをインストールします...${NC}"
if [ ! -d "node_modules/expo" ]; then
    echo -e "${YELLOW}expo パッケージを個別にインストールします...${NC}"
    npm install expo --legacy-peer-deps
fi

# インストール状態を確認
echo -e "\n${BLUE}8. インストール状態を確認します...${NC}"
if [ -d "node_modules/expo" ]; then
    echo -e "${GREEN}✅ expo パッケージが正常にインストールされました。${NC}"
    echo -e "${GREEN}✅ 依存関係のインストールが完了しました。${NC}"
else
    echo -e "${RED}❌ expo パッケージのインストールに失敗しました。${NC}"
    exit 1
fi

# アプリケーション起動方法の説明
echo -e "\n${BLUE}======================================${NC}"
echo -e "${GREEN}依存関係の修復が完了しました！${NC}"
echo -e "${BLUE}======================================${NC}"
echo -e "以下のコマンドでアプリケーションを起動してください：\n"
echo -e "${YELLOW}EXPO_NO_TYPESCRIPT_TRANSPILE=true npx expo start${NC}"
echo -e "${YELLOW}または${NC}"
echo -e "${YELLOW}npm start${NC}"

# 元のディレクトリに戻る
cd "$CURRENT_DIR"
