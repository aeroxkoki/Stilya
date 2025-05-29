#!/bin/bash

echo "🧹 Stilyaプロジェクトのクリーンアップを開始します..."

# 1. ビルドキャッシュとビルド生成物の削除
echo "📦 ビルドキャッシュを削除中..."
rm -rf android/.gradle
rm -rf android/build
rm -rf ios/build 2>/dev/null
rm -rf ios/Pods 2>/dev/null

# 2. Metro/Expo関連のキャッシュ削除
echo "🚇 Metro/Expoキャッシュを削除中..."
rm -rf .expo/
rm -rf .metro-health-check-result
rm -rf node_modules/.cache

# 3. 一時ファイルの削除
echo "🗑️ 一時ファイルを削除中..."
find . -name "*.log" -type f -delete
find . -name ".DS_Store" -type f -delete
find . -name "Thumbs.db" -type f -delete
find . -name "*.swp" -type f -delete
find . -name "*.swo" -type f -delete

# 4. TypeScriptビルド出力（もしあれば）
echo "🔧 TypeScriptビルド出力を削除中..."
rm -rf dist/
rm -rf build/
rm -rf tsconfig.tsbuildinfo

# 5. node_modulesとpackage-lock.jsonの削除（クリーンインストール用）
echo "📦 node_modulesを削除中..."
rm -rf node_modules
rm -f package-lock.json

echo "✅ クリーンアップ完了！"
echo ""
echo "次のステップ:"
echo "1. npm install を実行して依存関係を再インストール"
echo "2. npx expo start でプロジェクトを起動"
