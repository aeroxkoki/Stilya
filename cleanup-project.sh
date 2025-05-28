#!/bin/bash

# Stilya プロジェクトクリーンアップスクリプト
# このスクリプトは、不要なファイルを削除し、プロジェクトを整理します

echo "🧹 Stilya プロジェクトのクリーンアップを開始します..."

# 作業ディレクトリに移動
cd /Users/koki_air/Documents/GitHub/Stilya

# 1. 重要：現在の状態をバックアップ
echo "📦 現在の状態をバックアップしています..."
git stash push -m "Backup before cleanup $(date +%Y%m%d_%H%M%S)"

# 2. node_modulesとキャッシュディレクトリを削除
echo "🗑️  node_modulesとキャッシュディレクトリを削除中..."
rm -rf node_modules/
rm -rf .expo/
rm -rf .metro-cache/
rm -rf ios/build/
rm -rf ios/Pods/
rm -rf coverage/
rm -rf dist/

# 3. 重複ファイルの処理
echo "📄 重複ファイルを処理中..."

# app.config.tsを保持し、app.config.jsを削除
if [ -f "app.config.ts" ] && [ -f "app.config.js" ]; then
    echo "  - app.config.js を削除（app.config.ts を保持）"
    rm -f app.config.js
fi

# yarn.lockを保持し、package-lock.jsonを削除（yarn使用を想定）
if [ -f "yarn.lock" ] && [ -f "package-lock.json" ]; then
    echo "  - package-lock.json を削除（yarn.lock を保持）"
    rm -f package-lock.json
fi

# 4. セキュリティファイルの削除
echo "🔒 セキュリティファイルを削除中..."
if [ -f "stilya-keystore.jks" ]; then
    echo "  - stilya-keystore.jks を削除"
    rm -f stilya-keystore.jks
fi

# 5. DS_Storeファイルの削除
echo "🍎 .DS_Store ファイルを削除中..."
find . -name ".DS_Store" -type f -delete 2>/dev/null

# 6. その他の不要ファイル削除
echo "🧹 その他の不要ファイルを削除中..."
find . -name "*.bak" -type f -delete 2>/dev/null
find . -name "*.backup" -type f -delete 2>/dev/null
find . -name "*.tmp" -type f -delete 2>/dev/null
find . -name "*.temp" -type f -delete 2>/dev/null

# 7. .gitignoreファイルの更新
echo "📝 .gitignore ファイルを更新中..."
cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Expo
.expo/
dist/
web-build/
expo-env.d.ts

# React Native
*.orig.*
*.jks
*.p8
*.p12
*.key
*.mobileprovision

# macOS
.DS_Store
*.DS_Store

# Metro
.metro-health-check*
.metro-cache/

# Debug
npm-debug.*
yarn-debug.*
yarn-error.*

# TypeScript
*.tsbuildinfo
typescript_errors.txt

# Temporary files
*.tmp
*.temp
temp-backup-*/
*.bak
*.backup

# Logs
logs
*.log

# Editor directories and files
.vscode/
.idea/
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

# Testing
coverage/
*.lcov
test-results/
junit*.xml
test-ok.txt
basic-test-results.json

# Build outputs
build/
android/app/build/
android/.gradle/
ios/build/
ios/Pods/

# Cache directories
.cache/

# Miscellaneous
*.tgz
*.tar.gz

# EAS
eas.json.bak
credentials.json
keystore-base64.txt

# Package manager lock files (choose one)
# If using npm:
# package-lock.json
# If using yarn:
yarn.lock
EOF

echo "✅ クリーンアップが完了しました！"
echo ""
echo "📊 プロジェクトの状態："
echo "  - node_modules: 削除済み"
echo "  - キャッシュディレクトリ: 削除済み"
echo "  - 重複ファイル: 整理済み"
echo "  - セキュリティファイル: 削除済み"
echo ""
echo "次のステップ："
echo "1. yarn install (または npm install) を実行して依存関係を再インストール"
echo "2. npx expo doctor を実行してプロジェクトの健全性をチェック"
echo "3. git add . && git commit -m 'chore: プロジェクトのクリーンアップ' でコミット"
