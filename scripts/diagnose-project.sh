#!/bin/bash

echo "🔍 Stilya プロジェクト診断開始..."
echo "================================="

# 基本情報
echo ""
echo "📋 基本情報:"
echo "  - Node.js: $(node --version)"
echo "  - npm: v$(npm --version)"
echo "  - Expo CLI: $(npx expo --version 2>/dev/null || echo 'Not found')"
echo "  - プロジェクトパス: $(pwd)"

# 環境変数チェック
echo ""
echo "🔐 環境変数チェック:"
if [ -f .env ]; then
    echo "  ✅ .env ファイルが存在します"
    SUPABASE_URL=$(grep EXPO_PUBLIC_SUPABASE_URL .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
    SUPABASE_KEY=$(grep EXPO_PUBLIC_SUPABASE_ANON_KEY .env | cut -d '=' -f2 | tr -d '"' | tr -d "'")
    if [ -n "$SUPABASE_URL" ]; then
        echo "  ✅ EXPO_PUBLIC_SUPABASE_URL が設定されています"
    else
        echo "  ❌ EXPO_PUBLIC_SUPABASE_URL が設定されていません"
    fi
    if [ -n "$SUPABASE_KEY" ]; then
        echo "  ✅ EXPO_PUBLIC_SUPABASE_ANON_KEY が設定されています"
    else
        echo "  ❌ EXPO_PUBLIC_SUPABASE_ANON_KEY が設定されていません"
    fi
else
    echo "  ❌ .env ファイルが見つかりません"
fi

# パッケージチェック
echo ""
echo "📦 主要パッケージチェック:"
EXPO_VERSION=$(npm list expo --depth=0 2>/dev/null | grep expo@ | awk -F@ '{print $2}' | tr -d ' ')
REACT_VERSION=$(npm list react --depth=0 2>/dev/null | grep react@ | awk -F@ '{print $2}' | tr -d ' ')
RN_VERSION=$(npm list react-native --depth=0 2>/dev/null | grep react-native@ | awk -F@ '{print $2}' | tr -d ' ')

echo "  - expo: ${EXPO_VERSION:-Not installed}"
echo "  - react: ${REACT_VERSION:-Not installed}"
echo "  - react-native: ${RN_VERSION:-Not installed}"

# ネイティブプロジェクトチェック
echo ""
echo "📱 ネイティブプロジェクトチェック:"
if [ -d "ios" ]; then
    echo "  ✅ iOS プロジェクトが存在します"
    if [ -f "ios/Podfile.lock" ]; then
        echo "  ✅ CocoaPods がインストールされています"
    else
        echo "  ❌ CocoaPods がインストールされていません"
    fi
else
    echo "  ❌ iOS プロジェクトが見つかりません"
fi

if [ -d "android" ]; then
    echo "  ✅ Android プロジェクトが存在します"
else
    echo "  ❌ Android プロジェクトが見つかりません"
fi

# TypeScriptチェック
echo ""
echo "📝 TypeScript チェック:"
if command -v tsc &> /dev/null; then
    echo "  ✅ TypeScript がインストールされています"
    echo "  開始: TypeScript コンパイルチェック..."
    npx tsc --noEmit --skipLibCheck 2>&1 | head -10
else
    echo "  ❌ TypeScript が見つかりません"
fi

# Metroキャッシュチェック
echo ""
echo "🗑️ キャッシュ状態:"
if [ -d ".metro-cache" ]; then
    echo "  ⚠️  Metro キャッシュが存在します"
else
    echo "  ✅ Metro キャッシュがクリアされています"
fi

if [ -d ".expo" ]; then
    echo "  ⚠️  Expo キャッシュが存在します"
else
    echo "  ✅ Expo キャッシュがクリアされています"
fi

# 推奨事項
echo ""
echo "💡 推奨事項:"
if [ "$EXPO_VERSION" != "53.0.9" ]; then
    echo "  - Expo SDK を 53.0.9 にアップデートしてください"
fi

# Node.jsバージョンチェック
NODE_MAJOR_VERSION=$(node --version | cut -d. -f1 | tr -d 'v')
if [ "$NODE_MAJOR_VERSION" -gt "20" ]; then
    echo "  - ⚠️  Node.js $(node --version) は新しすぎる可能性があります。Node.js 18.x または 20.x の使用を推奨します"
fi

echo ""
echo "================================="
echo "診断完了！"
