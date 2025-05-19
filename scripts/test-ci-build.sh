#!/bin/bash
# test-ci-build.sh
# GitHub ActionsのCI環境をローカルでシミュレートしてビルドテストするスクリプト

echo "🧪 CI環境のシミュレーション開始..."

# CI環境変数を設定
export CI=true
export EAS_SKIP_JAVASCRIPT_BUNDLING=1

# キャッシュクリア
echo "🧹 キャッシュをクリア..."
rm -rf node_modules/.cache
rm -rf ~/.expo/cache
rm -rf .expo
rm -rf .expo-shared
rm -rf .metro-cache

# Metro/Babel依存関係の修正
echo "🔧 Metro/Babel依存関係を修正..."
chmod +x ./scripts/fix-metro-dependencies.sh
./scripts/fix-metro-dependencies.sh

# ビルド準備
echo "📦 依存関係の再インストール..."
npm ci

# エラーログ保存先のディレクトリを作成
mkdir -p logs

# EASビルドのローカルテスト
echo "🏗️ EAS Build のローカルテスト実行..."
npx eas-cli build --platform android --profile ci --local --non-interactive --output=./dist 2>&1 | tee logs/eas-build-test.log

# 結果確認
if [ $? -eq 0 ]; then
  echo "✅ ビルドテスト成功！"
  echo "ビルド成果物: ./dist/"
else
  echo "❌ ビルドテスト失敗"
  echo "詳細なエラーログは logs/eas-build-test.log を確認してください"
fi

echo "🔍 ビルドプロセス完了"
