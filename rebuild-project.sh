#\!/bin/bash

# エラー発生時に停止
set -e

echo "🧹 プロジェクトクリーンアップを開始します..."

# 古いnode_modules, yarn.lock, package-lock.jsonを削除
rm -rf node_modules
rm -f yarn.lock package-lock.json

echo "📦 キャッシュのクリア..."
npm cache clean --force
yarn cache clean

echo "🔄 依存関係の再インストール..."
yarn install

echo "🛠️ Expoプロジェクトの再構築..."
npx expo prebuild --clean

echo "✅ プロジェクトの修復が完了しました。"
echo "🚀 次のコマンドでアプリを起動できます: yarn start"
