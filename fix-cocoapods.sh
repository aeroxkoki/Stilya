#!/bin/bash

echo "🔧 CocoaPods環境修正スクリプト"
echo "================================"

# UTF-8環境変数を設定
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

echo "✅ UTF-8環境変数を設定しました"

# プロジェクトディレクトリに移動
cd /Users/koki_air/Documents/GitHub/Stilya/ios

echo "📦 CocoaPodsを実行中..."

# 既存のPodsとWorkspaceをクリーンアップ
if [ -f "Podfile.lock" ]; then
    echo "🗑️ Podfile.lockを削除..."
    rm Podfile.lock
fi

if [ -d "Pods" ]; then
    echo "🗑️ Podsディレクトリを削除..."
    rm -rf Pods
fi

if [ -d "Stilya.xcworkspace" ]; then
    echo "🗑️ 古いworkspaceを削除..."
    rm -rf Stilya.xcworkspace
fi

# Pod installを実行
echo "🔄 pod installを実行..."
pod install

# 結果を確認
if [ -d "Stilya.xcworkspace" ]; then
    echo ""
    echo "✅ 成功！Stilya.xcworkspaceが作成されました"
    echo ""
    echo "📱 次のコマンドでXcodeを開けます:"
    echo "   open Stilya.xcworkspace"
    echo ""
    echo "または、プロジェクトを直接実行:"
    echo "   cd /Users/koki_air/Documents/GitHub/Stilya"
    echo "   npm run ios"
else
    echo ""
    echo "❌ エラー: xcworkspaceの作成に失敗しました"
    echo ""
    echo "以下を試してください:"
    echo "1. ターミナルを再起動"
    echo "2. 以下のコマンドを実行:"
    echo "   export LANG=en_US.UTF-8"
    echo "   export LC_ALL=en_US.UTF-8"
    echo "   cd /Users/koki_air/Documents/GitHub/Stilya/ios"
    echo "   pod install"
fi
