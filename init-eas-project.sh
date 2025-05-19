#!/bin/bash

# Stilya - EASプロジェクト初期化専用スクリプト
echo "🚀 EASプロジェクト初期化を行います..."

# EAS CLIがインストールされているか確認
if ! command -v npx &> /dev/null; then
  echo "❌ npx が見つかりません。Node.js と npm をインストールしてください。"
  exit 1
fi

# 作業ディレクトリに移動
cd "$(dirname "$0")"

# Expoにログイン
echo "🔑 Expoにログインします..."
npx expo login

# app.config.jsからownerを抽出
OWNER=$(grep -o "config.owner = '[^']*'" app.config.js | cut -d "'" -f 2)
echo "👤 設定されているowner: $OWNER"

# EAS Projectを初期化
echo "🏗️ EASプロジェクトを初期化しています..."
npx eas-cli project:init

# プロジェクト情報を表示
echo "🔍 プロジェクト情報を確認します..."
npx eas-cli project:info

echo "✅ EASプロジェクト初期化が完了しました。"
echo "ビルドコマンド: npx eas-cli build --platform android --profile ci --non-interactive"
