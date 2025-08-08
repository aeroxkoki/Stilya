#!/bin/bash

echo "🔧 Expo Go エラー完全修復スクリプト"
echo "===================================="

# 1. すべてのExpoプロセスを終了
echo "1️⃣ Expoプロセスの終了..."
pkill -f "expo" 2>/dev/null || true
pkill -f "react-native" 2>/dev/null || true
pkill -f "metro" 2>/dev/null || true

# 2. グローバルキャッシュのクリア
echo "2️⃣ グローバルキャッシュのクリア..."
rm -rf ~/.expo 2>/dev/null || true

# 3. ローカルキャッシュのクリア
echo "3️⃣ ローカルキャッシュのクリア..."
rm -rf .expo
rm -rf .metro-cache
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*
rm -rf $TMPDIR/react-*

# 4. watchmanのリセット
echo "4️⃣ watchmanのリセット..."
watchman watch-del-all 2>/dev/null || true

# 5. node_modulesの再インストール
echo "5️⃣ 依存関係の再インストール..."
rm -rf node_modules package-lock.json
npm install

# 6. 整合性チェック
echo ""
echo "6️⃣ 整合性チェック..."

# mainフィールドの確認
MAIN_FIELD=$(grep '"main"' package.json | cut -d'"' -f4)
if [ "$MAIN_FIELD" != "node_modules/expo/AppEntry.js" ]; then
    echo "  ❌ package.json mainフィールドを修正中..."
    sed -i '' 's/"main": ".*"/"main": "node_modules\/expo\/AppEntry.js"/' package.json
    echo "  ✅ 修正完了"
fi

# index.jsの削除
if [ -f "index.js" ]; then
    echo "  ⚠️  index.js を削除中..."
    rm -f index.js
    echo "  ✅ 削除完了"
fi

# App.tsxの存在確認
if [ ! -f "App.tsx" ] && [ ! -f "App.js" ]; then
    echo "  ❌ エラー: App.tsx または App.js が見つかりません"
    exit 1
fi

echo ""
echo "===================================="
echo "✅ 修復完了！"
echo ""
echo "📱 Expo を起動します..."
echo ""

npx expo start --clear
