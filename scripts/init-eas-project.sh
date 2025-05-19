#!/bin/bash
# init-eas-project.sh - EAS プロジェクト初期化スクリプト

echo "🚀 EAS プロジェクト初期化スクリプトを実行します..."

# app.json から情報を取得
PROJECT_ID=$(node -e "console.log(require('../app.json').expo.extra.eas.projectId || '')")
OWNER=$(node -e "console.log(require('../app.json').expo.owner || '')")

echo "📋 情報:"
echo "ProjectID: $PROJECT_ID"
echo "Owner: $OWNER"

# 警告チェック
if [ -z "$OWNER" ]; then
  echo "⚠️ 警告: app.json に owner フィールドが設定されていません！"
  echo "app.json を編集して、expo > owner フィールドにExpoアカウント名を追加してください。"
  exit 1
fi

if [ -z "$PROJECT_ID" ]; then
  echo "⚠️ 警告: app.json に projectId フィールドが設定されていません！"
  echo "この問題は自動的に解決されますが、手動で設定することをお勧めします。"
fi

# EAS CLI ログイン状態チェック
echo "🔍 EAS CLI ログイン状態チェック中..."
npx eas-cli whoami > /dev/null 2>&1
if [ $? -ne 0 ]; then
  echo "❌ EAS CLI にログインしていません。ログインしてください："
  npx eas-cli login
else
  echo "✅ EAS CLI にログイン済みです。"
  npx eas-cli whoami
fi

# プロジェクト初期化
echo "🔧 EASプロジェクトを初期化します..."
if [ -n "$PROJECT_ID" ]; then
  echo "プロジェクトID: $PROJECT_ID を使用します。"
  npx eas-cli project:init --id="$PROJECT_ID" --non-interactive || echo "プロジェクトはすでに存在します"
else
  echo "新規プロジェクトを作成します..."
  npx eas-cli project:init --non-interactive || echo "プロジェクト作成に失敗しました"
  
  # 新しいプロジェクトIDを取得して app.json を更新
  NEW_PROJECT_ID=$(npx eas-cli project:info --json | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
  if [ -n "$NEW_PROJECT_ID" ]; then
    echo "新しいプロジェクトID: $NEW_PROJECT_ID を app.json に設定します。"
    node -e "
      const fs = require('fs');
      const appJson = require('../app.json');
      if (!appJson.expo.extra) appJson.expo.extra = {};
      if (!appJson.expo.extra.eas) appJson.expo.extra.eas = {};
      appJson.expo.extra.eas.projectId = '$NEW_PROJECT_ID';
      fs.writeFileSync('./app.json', JSON.stringify(appJson, null, 2));
    "
    echo "✅ app.json を更新しました。"
  fi
fi

# プロジェクト情報の表示
echo "📊 プロジェクト情報:"
npx eas-cli project:info || echo "プロジェクト情報を取得できません"

echo "✅ EAS プロジェクト初期化が完了しました。"
