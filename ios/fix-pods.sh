#!/bin/bash

echo "🔧 CocoaPods環境修正スクリプト"
echo "============================="

# プロジェクトのiOSディレクトリに移動
cd /Users/koki_air/Documents/GitHub/Stilya/ios

# 環境変数を設定
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8
export LANGUAGE=en_US.UTF-8

echo "✅ UTF-8環境変数を設定しました"

# 既存のPodsを削除
if [ -d "Pods" ]; then
    echo "🗑️ 既存のPodsディレクトリを削除..."
    rm -rf Pods
fi

if [ -f "Podfile.lock" ]; then
    echo "🗑️ Podfile.lockを削除..."
    rm Podfile.lock
fi

# CocoaPodsキャッシュをクリア
echo "🧹 CocoaPodsキャッシュをクリア..."
pod cache clean --all

# pod installを実行
echo "📦 pod installを実行中..."
pod install --repo-update

# 結果確認
if [ -d "Stilya.xcworkspace" ]; then
    echo ""
    echo "✅ 成功！Stilya.xcworkspaceが作成されました"
    echo ""
    echo "次のコマンドでXcodeを開けます:"
    echo "  open Stilya.xcworkspace"
else
    echo ""
    echo "⚠️ xcworkspaceが見つかりません"
    echo ""
    echo "手動で以下を試してください:"
    echo "1. 新しいターミナルウィンドウを開く"
    echo "2. 以下のコマンドを実行:"
    echo "   export LANG=en_US.UTF-8"
    echo "   export LC_ALL=en_US.UTF-8"
    echo "   cd /Users/koki_air/Documents/GitHub/Stilya/ios"
    echo "   pod install"
fi
