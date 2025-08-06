#!/bin/bash

# Stilya iOS "No such module 'Expo'" エラー修正スクリプト
# このスクリプトは、Xcodeビルドエラーを根本的に解決します

echo "=== Stilya iOS Expo Module Error Fix Script ==="
echo "現在の作業ディレクトリ: $(pwd)"

# プロジェクトのルートディレクトリに移動
cd /Users/koki_air/Documents/GitHub/Stilya

echo "1. node_modulesの再インストール..."
if [ -d "node_modules" ]; then
    echo "   - 既存のnode_modulesを削除中..."
    rm -rf node_modules
fi

echo "   - npmでパッケージをインストール中..."
npm install

echo "2. iOS Podsのクリーンアップと再インストール..."
cd ios

# 既存のPodsとロックファイルを削除
echo "   - 既存のPodsを削除中..."
rm -rf Pods
rm -rf Podfile.lock
rm -rf build

# DerivedDataのクリア
echo "   - Xcode DerivedDataをクリア中..."
rm -rf ~/Library/Developer/Xcode/DerivedData/*

# CocoaPodsのキャッシュクリア
echo "   - CocoaPodsのキャッシュをクリア中..."
pod cache clean --all

# pod deintegrate実行
echo "   - Podsをプロジェクトから完全に削除中..."
pod deintegrate

# pod install実行
echo "   - Podsを再インストール中..."
pod install --repo-update

echo "3. Xcodeプロジェクトの設定確認..."
# Xcodeプロジェクトの設定を確認
if [ -f "Stilya.xcworkspace" ]; then
    echo "   ✓ Stilya.xcworkspaceが存在します"
else
    echo "   ✗ エラー: Stilya.xcworkspaceが見つかりません"
fi

# ExpoModulesProvider.swiftの存在確認
if [ -f "Pods/Target Support Files/Pods-Stilya/ExpoModulesProvider.swift" ]; then
    echo "   ✓ ExpoModulesProvider.swiftが正しく生成されています"
else
    echo "   ✗ エラー: ExpoModulesProvider.swiftが見つかりません"
fi

echo ""
echo "=== 修正完了 ==="
echo ""
echo "次の手順:"
echo "1. Xcodeを完全に終了してください"
echo "2. Xcodeで Stilya.xcworkspace を開いてください（.xcodeprojではありません）"
echo "3. Product > Clean Build Folder (Shift+Cmd+K) を実行してください"
echo "4. Product > Build (Cmd+B) を実行してください"
echo ""
echo "それでも問題が解決しない場合は、以下を試してください:"
echo "- Xcodeを再起動"
echo "- Mac全体を再起動"
echo "- expo prebuild --clean を実行"
