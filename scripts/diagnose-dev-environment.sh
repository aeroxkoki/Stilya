#!/bin/bash

echo "🚀 Stilya開発環境診断スクリプト"
echo "================================"

# 1. Node.jsとnpmのバージョン確認
echo -e "\n📦 Node.js & npm バージョン:"
node --version
npm --version

# 2. Expo CLIのバージョン確認
echo -e "\n📱 Expo CLI バージョン:"
npx expo --version

# 3. EAS CLIのバージョン確認
echo -e "\n🏗️ EAS CLI バージョン:"
npx eas-cli --version 2>/dev/null || echo "EAS CLIがインストールされていません"

# 4. 環境変数の確認
echo -e "\n🔐 環境変数の確認:"
if [ -f .env ]; then
    echo "✅ .envファイルが存在します"
    # 重要な環境変数の存在確認（値は表示しない）
    if grep -q "EXPO_PUBLIC_SUPABASE_URL" .env; then
        echo "✅ EXPO_PUBLIC_SUPABASE_URL が設定されています"
    else
        echo "❌ EXPO_PUBLIC_SUPABASE_URL が設定されていません"
    fi
    
    if grep -q "EXPO_PUBLIC_SUPABASE_ANON_KEY" .env; then
        echo "✅ EXPO_PUBLIC_SUPABASE_ANON_KEY が設定されています"
    else
        echo "❌ EXPO_PUBLIC_SUPABASE_ANON_KEY が設定されていません"
    fi
else
    echo "❌ .envファイルが見つかりません"
fi

# 5. TypeScriptのコンパイルチェック
echo -e "\n🔍 TypeScriptコンパイルチェック:"
npx tsc --noEmit 2>&1 | head -20 || echo "✅ TypeScriptエラーなし"

# 6. 依存関係の確認
echo -e "\n📚 主要な依存関係の確認:"
if [ -f package.json ]; then
    echo "expo: $(grep '\"expo\":' package.json | cut -d'"' -f4)"
    echo "react-native: $(grep '\"react-native\":' package.json | cut -d'"' -f4)"
    echo "@supabase/supabase-js: $(grep '\"@supabase/supabase-js\":' package.json | cut -d'"' -f4)"
else
    echo "❌ package.jsonが見つかりません"
fi

# 7. キャッシュディレクトリの確認
echo -e "\n🗑️ キャッシュディレクトリ:"
if [ -d ".expo" ]; then
    echo "✅ .expoディレクトリが存在します"
else
    echo "ℹ️ .expoディレクトリが存在しません（初回起動時は正常）"
fi

if [ -d "node_modules/.cache" ]; then
    echo "✅ node_modules/.cacheディレクトリが存在します"
else
    echo "ℹ️ node_modules/.cacheディレクトリが存在しません"
fi

echo -e "\n✨ 診断完了！"
echo "================================"
echo -e "\n次のステップ:"
echo "1. エラーがある場合は修正してください"
echo "2. npm run clear-cache でキャッシュをクリア"
echo "3. npm run start で開発サーバーを起動"
