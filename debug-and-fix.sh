#!/bin/bash

# Stilya Debug & Fix Script
# 実行: chmod +x debug-and-fix.sh && ./debug-and-fix.sh

echo "🔧 Stilya - デバッグ & 修正スクリプト"
echo "====================================="
echo ""

# 基本的な環境チェック
echo "📊 環境診断を開始します..."
echo ""

# 1. Node.jsバージョンチェック
echo "1️⃣ Node.jsバージョンチェック"
NODE_VERSION=$(node -v)
echo "   現在のバージョン: $NODE_VERSION"
if [[ $NODE_VERSION == v18* ]] || [[ $NODE_VERSION == v20* ]]; then
    echo "   ✅ 互換性のあるNode.jsバージョンです"
else
    echo "   ⚠️ Node.js 18.x または 20.x を推奨します"
fi
echo ""

# 2. Expoバージョンチェック
echo "2️⃣ Expoバージョンチェック"
EXPO_VERSION=$(npx expo --version 2>/dev/null)
if [ $? -eq 0 ]; then
    echo "   Expoバージョン: $EXPO_VERSION"
    echo "   ✅ Expo CLIがインストールされています"
else
    echo "   ❌ Expo CLIが見つかりません"
    echo "   インストール: npm install -g expo-cli"
fi
echo ""

# 3. 依存関係の整合性チェック
echo "3️⃣ 依存関係の整合性チェック"
echo "   パッケージの整合性を確認中..."
npm ls --depth=0 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✅ 依存関係に問題はありません"
else
    echo "   ⚠️ 依存関係に問題がある可能性があります"
    echo "   修正を試みますか？ (y/n)"
    read -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "   依存関係を修正中..."
        rm -rf node_modules package-lock.json
        npm install
    fi
fi
echo ""

# 4. TypeScriptエラーチェック
echo "4️⃣ TypeScriptエラーチェック"
echo "   型チェックを実行中..."
npx tsc --noEmit 2>/dev/null
if [ $? -eq 0 ]; then
    echo "   ✅ TypeScriptエラーはありません"
else
    echo "   ⚠️ TypeScriptエラーが検出されました"
    echo "   詳細を確認するには: npm run types:check"
fi
echo ""

# 5. 環境変数チェック
echo "5️⃣ 環境変数チェック"
if [ -f ".env" ]; then
    # 必須環境変数のチェック
    REQUIRED_VARS=("EXPO_PUBLIC_SUPABASE_URL" "EXPO_PUBLIC_SUPABASE_ANON_KEY" "EXPO_PUBLIC_RAKUTEN_APP_ID")
    MISSING_VARS=()
    
    for var in "${REQUIRED_VARS[@]}"; do
        if ! grep -q "^$var=" .env; then
            MISSING_VARS+=($var)
        fi
    done
    
    if [ ${#MISSING_VARS[@]} -eq 0 ]; then
        echo "   ✅ 必須環境変数がすべて設定されています"
    else
        echo "   ❌ 以下の環境変数が未設定です:"
        for var in "${MISSING_VARS[@]}"; do
            echo "      - $var"
        done
    fi
else
    echo "   ❌ .envファイルが見つかりません"
fi
echo ""

# 6. Metroキャッシュクリア
echo "6️⃣ Metroキャッシュ状態"
METRO_CACHE_DIR="$TMPDIR/metro-*"
if ls $METRO_CACHE_DIR 1> /dev/null 2>&1; then
    echo "   ⚠️ Metroキャッシュが存在します"
    echo "   キャッシュをクリアしますか？ (y/n)"
    read -n 1 -r
    echo ""
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "   キャッシュをクリア中..."
        rm -rf $TMPDIR/metro-*
        npx expo start --clear > /dev/null 2>&1 &
        sleep 5
        kill $! 2>/dev/null
        echo "   ✅ キャッシュをクリアしました"
    fi
else
    echo "   ✅ Metroキャッシュは空です"
fi
echo ""

# 7. Supabase接続テスト
echo "7️⃣ Supabase接続テスト"
if [ -f ".env" ] && grep -q "EXPO_PUBLIC_SUPABASE_URL" .env; then
    SUPABASE_URL=$(grep "EXPO_PUBLIC_SUPABASE_URL" .env | cut -d '=' -f2)
    if [ ! -z "$SUPABASE_URL" ]; then
        echo "   Supabase URLに接続テスト中..."
        curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL/rest/v1/" > /tmp/supabase_test 2>&1
        HTTP_CODE=$(cat /tmp/supabase_test)
        if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "401" ]; then
            echo "   ✅ Supabaseサーバーに接続可能です"
        else
            echo "   ❌ Supabaseサーバーに接続できません (HTTP: $HTTP_CODE)"
        fi
        rm -f /tmp/supabase_test
    fi
else
    echo "   ⚠️ Supabase URLが設定されていません"
fi
echo ""

# 修正提案
echo "====================================="
echo "📋 推奨される修正アクション:"
echo ""

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
    echo "• .envファイルに必須環境変数を追加してください"
fi

echo "• 問題が続く場合は以下を実行:"
echo "  1. rm -rf node_modules .expo"
echo "  2. npm install"
echo "  3. npx expo start --clear"
echo ""
echo "====================================="
echo "✨ 診断完了!"
echo ""

# 起動オプション
echo "Expo Goを起動しますか？ (y/n)"
read -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    npm run start:expo-go
fi
