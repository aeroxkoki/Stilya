#!/bin/bash

echo "🔍 Stilya iOS Build Health Check"
echo "================================="

# プロジェクトディレクトリ
PROJECT_DIR="/Users/koki_air/Documents/GitHub/Stilya"
cd "$PROJECT_DIR"

echo ""
echo "📋 1. 環境チェック"
echo "-------------------"
echo "✓ Node.js: $(node --version)"
echo "✓ npm: $(npm --version)"
echo "✓ Expo CLI: $(npx expo --version)"
echo "✓ EAS CLI: $(npx eas --version 2>/dev/null || echo 'Not installed')"
echo "✓ Xcode: $(xcodebuild -version | head -1)"

echo ""
echo "📱 2. iOSシミュレーター"
echo "-------------------"
RUNTIME_COUNT=$(xcrun simctl list runtimes | grep -c "iOS" || echo "0")
if [ "$RUNTIME_COUNT" -eq "0" ]; then
    echo "❌ iOSランタイム: 未インストール"
    echo "   → IOS_SIMULATOR_RUNTIME_INSTALL.md を参照してください"
else
    echo "✓ iOSランタイム: インストール済み ($RUNTIME_COUNT)"
fi

echo ""
echo "📂 3. プロジェクトファイル"
echo "-------------------------"
# 必須ファイルのチェック
files=(
    "App.tsx"
    "app.config.js"
    "eas.json"
    "metro.config.js"
    "package.json"
    "tsconfig.json"
    "src/navigation/AppNavigator.tsx"
    "src/screens/SwipeScreen.tsx"
)

for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✓ $file"
    else
        echo "❌ $file - 見つかりません"
    fi
done

echo ""
echo "🏗️ 4. ビルド準備状態"
echo "-------------------"
if [ -d "ios" ]; then
    echo "✓ iOSプロジェクト: 生成済み"
    if [ -f "ios/Podfile" ]; then
        echo "✓ Podfile: 存在"
    else
        echo "❌ Podfile: 見つかりません"
    fi
else
    echo "⚠️  iOSプロジェクト: 未生成"
    echo "   実行: npx expo prebuild --platform ios"
fi

echo ""
echo "🚀 5. 推奨される次のステップ"
echo "----------------------------"
if [ "$RUNTIME_COUNT" -eq "0" ]; then
    echo "1. Xcodeでiosランタイムをインストール"
    echo "   → open /Applications/Xcode.app"
    echo "   → Settings → Platforms → iOS追加"
    echo ""
    echo "2. その間、Expo Goでテスト:"
    echo "   → ./start-expo-go-ios.sh"
else
    echo "1. シミュレーターで起動:"
    echo "   → npm run ios"
    echo ""
    echo "2. または特定のデバイスで:"
    echo "   → npx expo run:ios --simulator \"iPhone 15 Pro\""
fi

echo ""
echo "✅ チェック完了!"
