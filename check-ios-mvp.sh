#!/bin/bash

# Stilya iOS MVP開発環境チェックスクリプト

echo "========================================"
echo "🔍 Stilya iOS 開発環境診断"
echo "========================================"

# Node.jsバージョン確認
echo ""
echo "1️⃣ Node.js環境:"
node_version=$(node -v 2>/dev/null || echo "未インストール")
npm_version=$(npm -v 2>/dev/null || echo "未インストール")
echo "   Node.js: $node_version"
echo "   npm: $npm_version"

# Expo CLI確認
echo ""
echo "2️⃣ Expo CLI:"
expo_version=$(npx expo --version 2>/dev/null || echo "未インストール")
echo "   Expo CLI: $expo_version"

# Xcode確認
echo ""
echo "3️⃣ iOS開発環境:"
xcode_version=$(xcodebuild -version 2>/dev/null | head -1 || echo "Xcode 未インストール")
echo "   $xcode_version"

# CocoaPods確認
pod_version=$(pod --version 2>/dev/null || echo "未インストール")
echo "   CocoaPods: $pod_version"

# 利用可能なシミュレーター確認
echo ""
echo "4️⃣ 利用可能なiOSシミュレーター:"
xcrun simctl list devices | grep -E "iPhone|iPad" | grep -v "unavailable" | head -5

# プロジェクト依存関係確認
echo ""
echo "5️⃣ プロジェクト依存関係:"
if [ -f "package.json" ]; then
    echo "   ✅ package.json が存在します"
    if [ -d "node_modules" ]; then
        echo "   ✅ node_modules がインストール済み"
        module_count=$(ls node_modules | wc -l | tr -d ' ')
        echo "   📦 インストール済みパッケージ数: $module_count"
    else
        echo "   ❌ node_modules が見つかりません - 'npm install' を実行してください"
    fi
else
    echo "   ❌ package.json が見つかりません"
fi

# 環境変数確認
echo ""
echo "6️⃣ 環境変数設定:"
if [ -f ".env" ]; then
    echo "   ✅ .env ファイルが存在します"
    # Supabase設定の確認（値は表示しない）
    if grep -q "EXPO_PUBLIC_SUPABASE_URL=dummy" .env; then
        echo "   ⚠️  Supabase URLがダミー値です - 実際の値を設定してください"
    else
        echo "   ✅ Supabase URLが設定されています"
    fi
else
    echo "   ❌ .env ファイルが見つかりません"
    echo "   💡 '.env.example' をコピーして設定してください:"
    echo "      cp .env.example .env"
fi

# アセット確認
echo ""
echo "7️⃣ アセットファイル:"
required_assets=("icon.png" "splash-icon.png" "adaptive-icon.png")
all_assets_present=true
for asset in "${required_assets[@]}"; do
    if [ -f "assets/$asset" ]; then
        echo "   ✅ $asset"
    else
        echo "   ❌ $asset が見つかりません"
        all_assets_present=false
    fi
done

# 診断結果
echo ""
echo "========================================"
echo "📊 診断結果:"
echo "========================================"

issues=0

if [[ "$node_version" == "未インストール" ]]; then
    echo "❌ Node.jsがインストールされていません"
    ((issues++))
fi

if [[ "$expo_version" == "未インストール" ]]; then
    echo "❌ Expo CLIがインストールされていません"
    ((issues++))
fi

if [[ "$xcode_version" == *"未インストール"* ]]; then
    echo "❌ Xcodeがインストールされていません"
    ((issues++))
fi

if [ ! -d "node_modules" ]; then
    echo "❌ 依存関係がインストールされていません"
    echo "   実行: npm install"
    ((issues++))
fi

if [ ! -f ".env" ]; then
    echo "❌ 環境変数ファイルが設定されていません"
    echo "   実行: cp .env.example .env"
    ((issues++))
fi

if [ $issues -eq 0 ]; then
    echo ""
    echo "✅ すべての環境が正しく設定されています！"
    echo ""
    echo "🚀 開発を開始するには:"
    echo "   ./start-ios-local.sh"
    echo ""
    echo "📱 Expo Goでテストするには:"
    echo "   npm start"
else
    echo ""
    echo "⚠️  $issues 個の問題が見つかりました"
    echo "上記の問題を解決してから開発を開始してください"
fi

echo "========================================"
