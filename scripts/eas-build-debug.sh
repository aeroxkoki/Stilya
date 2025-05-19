#!/bin/bash
# eas-build-debug.sh
# EASビルド実行前の環境チェックスクリプト

echo "🔍 EAS ビルド実行前の環境確認を行います..."

# EXPO_TOKEN の確認
if [ -z "$EXPO_TOKEN" ]; then
  echo "❌ EXPO_TOKEN が設定されていません。GitHub Secretsで適切に設定されているか確認してください。"
  if [ -n "$CI" ]; then
    echo "GitHub Actions環境で実行中のため、このエラーは重大です。"
    echo "1. GitHub リポジトリの Settings > Secrets and variables > Actions に移動"
    echo "2. 'New repository secret' をクリック"
    echo "3. 名前に 'EXPO_TOKEN' を入力"
    echo "4. 値に Expo の Personal Access Token を入力"
    echo "5. 'Add secret' をクリック"
  else
    echo "ローカル環境で実行中です。EXPO_TOKEN はローカルでは必須ではありません。"
  fi
else
  echo "✅ EXPO_TOKEN が設定されています。"
fi

# Expo CLI バージョン確認
echo "📋 Expo CLI バージョン:"
npx expo --version || echo "❌ Expo CLI がインストールされていないか、実行できません。"

# EAS CLI バージョン確認
echo "📋 EAS CLI バージョン:"
npx eas-cli --version || echo "❌ EAS CLI がインストールされていないか、実行できません。"

# Node.js バージョン確認
echo "📋 Node.js バージョン: $(node -v)"

# Expo設定の確認
echo "📋 app.json の設定内容:"
grep -A 5 '"owner":' app.json || echo "❌ owner フィールドが見つかりません！"
grep -A 5 '"projectId":' app.json || echo "❌ projectId フィールドが見つかりません！"

# eas.json 設定の確認
echo "📋 eas.json の設定内容:"
if [ -f eas.json ]; then
  grep -A 10 '"ci":' eas.json || echo "❌ ci プロファイルが見つかりません！"
else
  echo "❌ eas.json ファイルが見つかりません！"
  echo "npx eas-cli build:configure を実行して eas.json を生成してください。"
fi

# 環境変数確認 
echo "📋 関連する環境変数:"
echo "NODE_VERSION=$(node -v)"
echo "EAS_SKIP_JAVASCRIPT_BUNDLING=$EAS_SKIP_JAVASCRIPT_BUNDLING"
echo "CI=$CI"
echo "EAS_BUILD=$EAS_BUILD"

# パッケージバージョンのチェック
echo "📋 主要パッケージのバージョン:"
npm list expo react react-native | grep -E 'expo|react'
echo "-----"
npm list metro metro-config @expo/metro-config | grep -E 'metro'

# 権限確認
echo "📋 Expo ログイン情報:"
npx eas-cli whoami || echo "❌ EAS CLI でログインできません！Expo CLI で再ログインしてください！"

# プロジェクト設定の確認
if npx eas-cli project:info &>/dev/null; then
  echo "✅ EAS プロジェクト設定が正常に取得できました。"
else
  echo "❌ EAS プロジェクト設定の取得に失敗しました。"
  echo "以下のコマンドでプロジェクト設定を初期化できます:"
  echo "npx eas-cli project:init"
fi

# まとめ
echo "🔍 環境確認完了"
echo "-----"
echo "問題が発生した場合の一般的な解決策:"
echo "1. eas.json の ci プロファイルが正しく設定されているか確認"
echo "2. app.json に owner と projectId が設定されているか確認"
echo "3. GitHub Secrets に EXPO_TOKEN が設定されているか確認"
echo "4. 依存関係を再インストール: rm -rf node_modules && npm install"
echo "5. Expo のキャッシュをクリア: expo-cli start --clear"
