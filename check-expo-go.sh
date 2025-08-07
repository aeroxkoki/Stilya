#!/bin/bash

echo "🔍 Expo Go 互換性チェック開始..."
echo "=================================="

# 1. ディレクトリ構造の確認
echo ""
echo "1️⃣ ディレクトリ構造チェック"
if [ -d "ios" ] || [ -d "android" ]; then
    echo "❌ エラー: ios/ または android/ ディレクトリが存在します"
    echo "   managed workflow では削除する必要があります"
    exit 1
else
    echo "✅ ネイティブディレクトリなし (managed workflow)"
fi

# 2. package.jsonのmainフィールド確認
echo ""
echo "2️⃣ package.json mainフィールドチェック"
MAIN_FIELD=$(grep '"main"' package.json | cut -d'"' -f4)
if [ "$MAIN_FIELD" = "node_modules/expo/AppEntry.js" ]; then
    echo "✅ mainフィールド正常: $MAIN_FIELD"
else
    echo "❌ エラー: mainフィールドが不正です"
    echo "   現在: $MAIN_FIELD"
    echo "   期待値: node_modules/expo/AppEntry.js"
    exit 1
fi

# 3. App.js/App.tsxの存在確認
echo ""
echo "3️⃣ Appファイル存在チェック"
if [ -f "App.tsx" ] || [ -f "App.js" ]; then
    echo "✅ Appファイル存在"
else
    echo "❌ エラー: App.tsx または App.js が見つかりません"
    exit 1
fi

# 4. index.jsが存在しないことを確認
echo ""
echo "4️⃣ index.jsファイルチェック"
if [ -f "index.js" ]; then
    echo "⚠️  警告: index.js が存在します"
    echo "   managed workflow では不要です"
else
    echo "✅ index.js なし (正常)"
fi

# 5. AppEntry.jsの存在確認
echo ""
echo "5️⃣ AppEntry.jsファイルチェック"
if [ -f "node_modules/expo/AppEntry.js" ]; then
    echo "✅ AppEntry.js 存在"
else
    echo "❌ エラー: node_modules/expo/AppEntry.js が見つかりません"
    echo "   npm install を実行してください"
    exit 1
fi

# 6. 環境変数の確認
echo ""
echo "6️⃣ 環境変数チェック"
if [ -f ".env" ]; then
    echo "✅ .envファイル存在"
    if grep -q "EXPO_PUBLIC_SUPABASE_URL" .env; then
        echo "✅ Supabase URL 設定済み"
    else
        echo "⚠️  警告: EXPO_PUBLIC_SUPABASE_URL が設定されていません"
    fi
else
    echo "❌ エラー: .envファイルが見つかりません"
fi

# 7. キャッシュディレクトリの確認
echo ""
echo "7️⃣ キャッシュディレクトリ"
if [ -d ".expo" ]; then
    echo "⚠️  .expo ディレクトリが存在します (クリア推奨)"
fi
if [ -d ".metro-cache" ]; then
    echo "⚠️  .metro-cache ディレクトリが存在します (クリア推奨)"
fi

echo ""
echo "=================================="
echo "✅ チェック完了！"
echo ""
echo "📱 次のステップ:"
echo "1. キャッシュをクリア: rm -rf .expo .metro-cache"
echo "2. Expo起動: npx expo start --clear"
echo "3. Expo Go でQRコードをスキャン"
