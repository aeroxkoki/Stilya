#!/bin/bash

# Xcode No such module 'Expo' エラーの解決スクリプト

echo "🔧 Xcode ビルドエラーを修正中..."

PROJECT_DIR="$(pwd)"
cd "$PROJECT_DIR"

# 1. DerivedDataのクリア
echo "🧹 DerivedDataをクリア中..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# 2. ビルド設定のリセット
echo "🔨 Xcodeプロジェクト設定をチェック中..."
cd ios

# 3. Podsの更新確認
if [ -f "Podfile.lock" ]; then
    echo "✅ Podfile.lockが存在します"
    echo "📦 Podsの状態を確認中..."
    
    # Expoモジュールの存在確認
    if grep -q "Expo" Podfile.lock; then
        echo "✅ Expoモジュールがインストールされています"
    else
        echo "❌ Expoモジュールが見つかりません"
        exit 1
    fi
fi

# 4. Expoモジュールのバージョン確認
echo "📋 インストールされているExpoモジュール:"
grep -E "(Expo|ExpoModulesCore)" Podfile.lock | head -10

# 5. クリーンビルドの準備
echo "🧹 ビルドクリーンアップ中..."
if [ -d "build" ]; then
    rm -rf build
fi

# 6. Xcodeプロジェクトのスキーム確認
echo "📱 Xcodeプロジェクトのスキームを確認中..."
xcodebuild -list -workspace Stilya.xcworkspace 2>/dev/null | grep -A 5 "Schemes:"

echo ""
echo "✅ 修正が完了しました！"
echo ""
echo "🎯 次のステップ:"
echo "1. Xcodeを完全に終了する（Cmd+Q）"
echo "2. ios/Stilya.xcworkspace を開く（.xcodeprojではありません！）"
echo "3. 左上のスキームが 'Stilya' になっていることを確認"
echo "4. Product → Clean Build Folder (Shift+Cmd+K)"
echo "5. Product → Build (Cmd+B)"
echo ""
echo "💡 追加のトラブルシューティング:"
echo "- もしまだ「No such module 'Expo'」エラーが出る場合:"
echo "  1. Xcodeで AppDelegate.m を開く"
echo "  2. import文を確認 (#import <Expo/Expo.h> ではなく別の形式になっているか)"
echo "  3. Build Settings → Framework Search Paths を確認"
echo ""
echo "⚠️  重要: 開発ビルドを使用している場合は、必ず .xcworkspace ファイルを使用してください！"

exit 0
