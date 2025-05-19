#!/bin/bash
# fix-eas-github-actions.sh - GitHub Actions環境のEAS設定を修正

echo "🔧 GitHub Actions環境のEAS設定を修正します..."

# 実行ディレクトリ確認
if [ ! -f "app.json" ]; then
  echo "❌ プロジェクトのルートディレクトリで実行してください。"
  exit 1
fi

# app.jsonのバックアップ作成
cp app.json app.json.bak
echo "📋 app.jsonのバックアップを作成しました: app.json.bak"

# owner確認
OWNER=$(node -e "console.log(require('./app.json').expo.owner || '')")
if [ -z "$OWNER" ]; then
  echo "❌ app.jsonにownerが設定されていません。設定してください。"
  echo "例: \"owner\": \"your-expo-username\""
  exit 1
else
  echo "👤 Owner: $OWNER"
fi

# projectId確認
PROJECT_ID=$(node -e "console.log(require('./app.json').expo.extra && require('./app.json').expo.extra.eas && require('./app.json').expo.extra.eas.projectId || '')")
echo "📊 ProjectID: $PROJECT_ID"

# eas.jsonの最新化
if grep -q "\"version\":" eas.json; then
  echo "📦 eas.jsonのCLIバージョンを更新します..."
  sed -i.bak 's/"version": "[^"]*"/"version": "^7.8.5"/' eas.json
  echo "✅ eas.jsonのCLIバージョンを ^7.8.5 に更新しました。"
else
  echo "⚠️ eas.jsonにバージョン指定がありません。"
fi

# 環境変数設定確認
echo "🔍 GitHub Actions環境変数を確認します..."
if grep -q "EAS_SKIP_JAVASCRIPT_BUNDLING" .github/workflows/build.yml; then
  echo "✅ EAS_SKIP_JAVASCRIPT_BUNDLING は設定されています。"
else
  echo "⚠️ EAS_SKIP_JAVASCRIPT_BUNDLING がワークフローに見つかりません。"
fi

# app.config.jsの修正（存在する場合）
if [ -f "app.config.js" ]; then
  echo "🔧 app.config.jsを確認・修正します..."
  if grep -q "config.owner" app.config.js; then
    echo "✅ app.config.jsにはconfig.ownerが設定されています。"
  else
    echo "⚠️ app.config.jsにowner設定を追加します..."
    sed -i.bak '/return config/i\  // 重要: GitHub Actions / CI向けに必ずownerを設定\n  config.owner = "'"$OWNER"'";' app.config.js
    echo "✅ app.config.jsにowner: $OWNERを追加しました。"
  fi
else
  echo "ℹ️ app.config.jsが存在しません。app.jsonの設定が使用されます。"
fi

# キャッシュクリアスクリプトの作成
cat > scripts/clear-eas-cache.sh << 'EOF'
#!/bin/bash
# clear-eas-cache.sh - EASビルド前のキャッシュクリア

echo "🧹 EASビルド前のキャッシュをクリアします..."

# Node.jsキャッシュ削除
rm -rf node_modules/.cache
echo "✅ node_modules/.cacheを削除しました"

# Expoキャッシュ削除
rm -rf ~/.expo/cache
echo "✅ ~/.expo/cacheを削除しました"

# Metroキャッシュ削除
rm -rf .expo
rm -rf .expo-shared
rm -rf .metro-cache
echo "✅ Expoとメトロのキャッシュを削除しました"

# eas-cliキャッシュ削除（問題がある場合のみ）
if [ "$1" = "--full" ]; then
  rm -rf ~/.eas-cli
  echo "✅ ~/.eas-cliを削除しました（完全クリア）"
fi

echo "✅ キャッシュのクリアが完了しました。"
EOF

chmod +x scripts/clear-eas-cache.sh
echo "✅ キャッシュクリアスクリプトを作成しました: scripts/clear-eas-cache.sh"

# EAS更新通知
echo "
🚀 変更が完了しました。以下の手順でGitHubにプッシュしてください:

1. 変更内容の確認:
   git status

2. 変更をステージング:
   git add .

3. 変更をコミット:
   git commit -m \"Fix: EAS GitHub Actions環境設定を修正\"

4. 変更をプッシュ:
   git push

5. GitHub Actionsでビルドが実行されるのを確認してください。
"
