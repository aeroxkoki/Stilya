#!/bin/bash

# Managed Workflowに戻すスクリプト

echo "🔄 Expo Managed Workflowに戻します..."

# 1. ネイティブフォルダを削除
echo "📁 ネイティブフォルダを削除中..."
rm -rf ios android

# 2. 不要なファイルを削除
echo "🗑️ 不要なファイルを削除中..."
rm -f nativewind-env.d.ts
rm -f postcss.config.js

# 3. package.jsonからrunスクリプトを削除
echo "📝 package.jsonを修正中..."
# Node.jsを使用してpackage.jsonを修正
node -e "
const fs = require('fs');
const packageJson = require('./package.json');

// ios, android, prebuild関連のスクリプトを削除
delete packageJson.scripts.ios;
delete packageJson.scripts.android;
delete packageJson.scripts.prebuild;
delete packageJson.scripts['prebuild:clean'];

fs.writeFileSync('./package.json', JSON.stringify(packageJson, null, 2) + '\\n');
console.log('✅ package.jsonを修正しました');
"

# 4. .gitignoreを更新
echo "📝 .gitignoreを更新中..."
if ! grep -q "^ios/$" .gitignore; then
    echo -e "\n# Native projects (managed workflow)\nios/\nandroid/" >> .gitignore
fi

# 5. キャッシュをクリア
echo "🧹 キャッシュをクリア中..."
rm -rf .expo
rm -rf node_modules/.cache
npx expo start --clear

echo "✅ Managed Workflowに戻りました！"
echo ""
echo "次のステップ:"
echo "1. npm start でExpo開発サーバーを起動"
echo "2. Expo Goアプリでテスト"
echo ""
echo "⚠️  注意: iosとandroidフォルダは削除されました"
