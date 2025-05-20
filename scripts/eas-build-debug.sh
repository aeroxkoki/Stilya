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
grep -A 2 '"jsEngine":' app.json || echo "❌ jsEngine フィールドが見つかりません！"

# New Architectureの確認
echo "📋 New Architecture の設定:"
if grep -q "unstable_enablePackageExports" metro.config.js; then
  echo "✅ Metro config に packageExports 設定があります。"
else
  echo "❌ Metro config に packageExports 設定がありません！"
fi

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
echo "NODE_OPTIONS=$NODE_OPTIONS"

# パッケージバージョンのチェック
echo "📋 主要パッケージのバージョン:"
npm list expo react react-native | grep -E 'expo|react'
echo "-----"
npm list metro metro-config @expo/metro-config | grep -E 'metro'

# dependencies と devDependencies の矛盾チェック
echo "📋 依存関係の矛盾チェック:"
if grep -q "\"resolutions\":" package.json; then
  echo "✅ resolutions フィールドがあります。依存関係の矛盾を防ぐために使用されています。"
else
  echo "⚠️ resolutions フィールドがありません。依存関係の矛盾が発生する可能性があります。"
fi

# 権限確認
echo "📋 Expo ログイン情報:"
npx eas-cli whoami || echo "❌ EAS CLI でログインできません！"

# プロジェクト設定の確認
# PROJECT_IDを先に取得
PROJECT_ID=$(node -e 'try { console.log(require("./app.json").expo.extra.eas.projectId || "") } catch(e) { console.log("") }')
if [ -n "$PROJECT_ID" ]; then
  echo "📋 Project ID: $PROJECT_ID"
  
  if npx eas-cli project:info --id="$PROJECT_ID" &>/dev/null; then
    echo "✅ EAS プロジェクト設定が正常に取得できました。"
  else
    echo "❌ EAS プロジェクト設定の取得に失敗しました。"
    echo "以下のコマンドでプロジェクト設定を初期化できます:"
    echo "npx eas-cli project:init --id=\"$PROJECT_ID\""
  fi
else
  echo "❌ app.json から projectId を取得できませんでした。"
  echo "app.json の expo.extra.eas.projectId フィールドが設定されているか確認してください。"
fi

# 前回のビルド結果の確認
echo "📋 前回のビルド結果:"
npx eas-cli build:list --limit 1 --json 2>/dev/null | grep -E '"status"|"platform"|"profile"' || echo "❌ 過去のビルド履歴が見つかりません。"

# デバイス登録の確認（開発用ビルドの場合）
if [[ -n "$CI" ]] && grep -q '"developmentClient": true' eas.json; then
  echo "⚠️ developmentClient が有効になっていますが、CI環境ではデバイス登録が必要です。"
  npx eas-cli device:list || echo "❌ 登録されたデバイスが見つかりません。"
fi

# まとめ
echo "🔍 環境確認完了"
echo "-----"
echo "問題が発生した場合の一般的な解決策:"
echo "1. eas.json の ci プロファイルが正しく設定されているか確認"
echo "2. app.json に owner と projectId が設定されているか確認"
echo "3. GitHub Secrets に EXPO_TOKEN が設定されているか確認"
echo "4. 依存関係を再インストール: rm -rf node_modules && npm install"
echo "5. Expo のキャッシュをクリア: expo start --clear"
echo "6. metro.config.js で unstable_enablePackageExports = false に設定されているか確認"
