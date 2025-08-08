#!/bin/bash

# CocoaPods Sandbox Sync Error Final Solution
# This script performs a complete clean rebuild of the iOS project dependencies

echo "==================================================================================="
echo "📱 Stilya iOS Build Error - Final Solution"
echo "==================================================================================="
echo ""
echo "このスクリプトは、CocoaPods Sandbox Sync Errorを根本的に解決します。"
echo ""
echo "⚠️  重要: このスクリプトは以下の操作を実行します："
echo "  1. Xcodeの完全なクリーンアップ"
echo "  2. node_modulesの再インストール"
echo "  3. CocoaPodsキャッシュのクリア"
echo "  4. iOS依存関係の完全な再構築"
echo ""
echo "続行しますか？ (y/n)"
read -r response
if [[ ! "$response" =~ ^[Yy]$ ]]; then
    echo "キャンセルされました。"
    exit 0
fi

echo ""
echo "🔧 Step 1: Xcodeを閉じています..."
osascript -e 'quit app "Xcode"' 2>/dev/null || true
sleep 2

echo "🔧 Step 2: DerivedDataのクリーンアップ..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*
echo "✅ DerivedDataをクリアしました"

echo ""
echo "🔧 Step 3: CocoaPodsキャッシュのクリア..."
pod cache clean --all 2>/dev/null || true
echo "✅ CocoaPodsキャッシュをクリアしました"

echo ""
echo "🔧 Step 4: iosフォルダ内のビルド関連ファイルを削除..."
cd /Users/koki_air/Documents/GitHub/Stilya/ios

# Remove Pods and related files
rm -rf Pods
rm -f Podfile.lock
rm -rf build
rm -rf ~/Library/Developer/Xcode/DerivedData/Stilya-*

# Remove specific problematic cache files
find . -name "*.xcworkspace" -type d -exec rm -rf {} + 2>/dev/null || true
rm -rf Stilya.xcworkspace

echo "✅ iOS関連ファイルをクリーンアップしました"

echo ""
echo "🔧 Step 5: node_modulesの再インストール..."
cd /Users/koki_air/Documents/GitHub/Stilya

# Clear npm cache
npm cache clean --force

# Remove node_modules and package-lock
rm -rf node_modules
rm -f package-lock.json

# Reinstall dependencies
npm install
echo "✅ node_modulesを再インストールしました"

echo ""
echo "🔧 Step 6: Expo prebuildの実行..."
npx expo prebuild --clear --platform ios
echo "✅ Expo prebuildを実行しました"

echo ""
echo "🔧 Step 7: CocoaPodsの再インストール..."
cd ios

# Ensure we have the latest CocoaPods specs
pod repo update

# Install pods with verbose output
pod install --verbose

echo "✅ CocoaPodsを再インストールしました"

echo ""
echo "🔧 Step 8: 最終確認..."

# Check if Podfile.lock exists
if [ -f "Podfile.lock" ]; then
    echo "✅ Podfile.lockが正常に生成されました"
else
    echo "❌ Podfile.lockの生成に失敗しました"
    exit 1
fi

# Check if Pods directory exists
if [ -d "Pods" ]; then
    echo "✅ Podsディレクトリが正常に生成されました"
else
    echo "❌ Podsディレクトリの生成に失敗しました"
    exit 1
fi

# Check Manifest.lock
if [ -f "Pods/Manifest.lock" ]; then
    echo "✅ Manifest.lockが正常に生成されました"
    
    # Compare Podfile.lock and Manifest.lock
    if diff Podfile.lock Pods/Manifest.lock > /dev/null 2>&1; then
        echo "✅ Podfile.lockとManifest.lockが同期しています"
    else
        echo "⚠️  Podfile.lockとManifest.lockに差分があります"
        echo "  手動で 'pod install' を再実行してください"
    fi
else
    echo "❌ Manifest.lockが見つかりません"
    exit 1
fi

echo ""
echo "==================================================================================="
echo "✨ すべての処理が完了しました！"
echo "==================================================================================="
echo ""
echo "📱 次のステップ："
echo "  1. Xcodeでプロジェクトを開く: open Stilya.xcworkspace"
echo "  2. Product > Clean Build Folder (Shift+Cmd+K)"
echo "  3. Product > Build (Cmd+B)"
echo ""
echo "⚠️  注意事項:"
echo "  - 必ず .xcworkspace ファイルを開いてください（.xcodeprojではない）"
echo "  - ビルドエラーが続く場合は、Xcodeを再起動してください"
echo "  - iPhoneが接続されている場合は、信頼設定を確認してください"
echo ""
echo "🎉 頑張ってください！"
