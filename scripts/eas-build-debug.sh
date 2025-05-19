#!/bin/bash
# eas-build-debug.sh
# EASビルド実行前の環境チェックスクリプト

echo "🔍 EAS ビルド実行前の環境確認を行います..."

# EXPO_TOKEN の確認
if [ -z "$EXPO_TOKEN" ]; then
  echo "❌ EXPO_TOKEN が設定されていません。GitHub Secretsで適切に設定されているか確認してください。"
  exit 1
else
  echo "✅ EXPO_TOKEN が設定されています。"
fi

# Expo設定の確認
echo "📋 app.json の設定内容:"
grep -A 5 '"owner":' app.json || echo "❌ owner フィールドが見つかりません！"
grep -A 5 '"projectId":' app.json || echo "❌ projectId フィールドが見つかりません！"

# eas.json 設定の確認
echo "📋 eas.json の設定内容:"
grep -A 10 '"ci":' eas.json || echo "❌ ci プロファイルが見つかりません！"

# 環境変数確認 
echo "📋 関連する環境変数:"
echo "NODE_VERSION=$(node -v)"
echo "EAS_SKIP_JAVASCRIPT_BUNDLING=$EAS_SKIP_JAVASCRIPT_BUNDLING"
echo "CI=$CI"
echo "EAS_BUILD=$EAS_BUILD"

# 権限確認
echo "📋 ログイン情報:"
npx eas-cli whoami || echo "❌ eas-cli でログインできません！"

echo "🔍 環境確認完了"
