#!/bin/bash
# direct-eas-build.sh - EASビルドを直接実行するスクリプト（エラー回避用）

echo "📱 直接EASビルドを開始します..."
echo "このスクリプトは明示的なowner設定でビルドを実行します"

# 環境変数チェック
if [ -z "$EXPO_TOKEN" ]; then
  echo "⚠️ EXPO_TOKEN環境変数が設定されていません"
  echo "💡 以下のコマンドで設定してください:"
  echo "export EXPO_TOKEN=your_expo_token_here"
  exit 1
fi

# EAS CLIのバージョン確認
EAS_VERSION=$(eas --version 2>/dev/null || echo "not-installed")
if [ "$EAS_VERSION" = "not-installed" ]; then
  echo "📦 EAS CLIをインストールします..."
  npm install -g eas-cli@7.3.0
elif [ "$EAS_VERSION" != "7.3.0" ]; then
  echo "📦 EAS CLIをバージョン7.3.0に更新します..."
  npm install -g eas-cli@7.3.0
else
  echo "✅ EAS CLI バージョン $EAS_VERSION を使用します"
fi

# Expoユーザー確認
echo "🔍 現在のExpoアカウント:"
eas whoami || { echo "⚠️ Expoにログインしていません"; exit 1; }

# app.jsonの確認
if grep -q "\"owner\":" app.json; then
  OWNER=$(grep -A 1 "\"owner\":" app.json | tail -n 1 | sed 's/.*"\(.*\)".*/\1/')
  echo "📋 app.jsonからowner: $OWNER を検出しました"
else
  OWNER="aeroxkoki"
  echo "⚠️ app.jsonにowner設定がありません。デフォルト値 $OWNER を使用します"
fi

# 依存関係の確認
./scripts/fix-metro-dependencies.sh

# キャッシュクリア
echo "🧹 キャッシュをクリアします..."
rm -rf node_modules/.cache
rm -rf ~/.expo/cache 2>/dev/null || true
rm -rf .expo/cache 2>/dev/null || true
rm -rf .metro-cache 2>/dev/null || true

# ビルド実行
echo "🚀 EASビルドを開始します... (owner: $OWNER)"
export NODE_OPTIONS="--max-old-space-size=8192"
export EAS_SKIP_JAVASCRIPT_BUNDLING=1

# CI/実行環境チェックと適切なコマンド実行
if [ -n "$CI" ]; then
  # CI環境用（GitHub Actions等）
  eas build --platform android --profile ci --non-interactive --owner $OWNER
else
  # ローカル開発環境用
  read -p "ビルドプロファイルを選択 [development/preview/production/ci] (default: development): " PROFILE
  PROFILE=${PROFILE:-development}
  
  # --no-waitオプション選択（待機しないかどうか）
  read -p "ビルド完了を待たずに終了しますか？ [y/N]: " NO_WAIT
  if [[ "$NO_WAIT" =~ ^[Yy]$ ]]; then
    WAIT_OPTION="--no-wait"
  else
    WAIT_OPTION=""
  fi
  
  # ビルド実行
  eas build --platform android --profile $PROFILE $WAIT_OPTION --owner $OWNER
fi

echo "✅ ビルドコマンドを実行しました"
