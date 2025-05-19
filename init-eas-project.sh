#!/bin/bash

# Stilya - EASプロジェクト初期化専用スクリプト (改良版)
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

# プロジェクトIDを取得
PROJECT_ID=$(node -e "console.log(require('./app.json').expo.extra.eas.projectId || '')")
echo "📋 app.json から取得したプロジェクトID: $PROJECT_ID"

# ownerを取得
OWNER=$(node -e "console.log(require('./app.json').expo.owner || '')")
echo "👤 app.json から取得したowner: $OWNER"

# EASアカウント情報の確認
echo "🔍 EASアカウント情報を確認します..."
npx eas-cli whoami

# EAS Projectを明示的に初期化 (projectIdを指定)
echo "🏗️ EASプロジェクトを初期化しています..."
if [ -n "$PROJECT_ID" ]; then
  echo "既存のプロジェクトID $PROJECT_ID を使用します"
  npx eas-cli project:init --id="$PROJECT_ID" --non-interactive || echo "プロジェクトはすでに存在するか、別の方法で初期化が必要です"
else
  echo "新規プロジェクトを作成します"
  npx eas-cli project:init --non-interactive
fi

# インストールされているEAS CLIのバージョンを表示
echo "📦 EAS CLIバージョン: $(npx eas-cli --version)"

# プロジェクト情報を表示
echo "🔍 プロジェクト情報を確認します..."
npx eas-cli project:info || echo "プロジェクト情報を取得できませんでした"

echo "✅ EASプロジェクト初期化手順が完了しました。"
echo "続いて、このコマンドでビルドしてください: npx eas-cli build --platform android --profile ci --non-interactive"
