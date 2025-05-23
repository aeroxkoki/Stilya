#!/bin/bash

echo "🍎 Apple Developer Account セットアップヘルパー"
echo "================================================"
echo ""

# Xcodeがインストールされているか確認
if [ -d "/Applications/Xcode.app" ]; then
    echo "✅ Xcodeがインストールされています"
    xcode_version=$(xcodebuild -version | head -n 1)
    echo "   バージョン: $xcode_version"
else
    echo "❌ Xcodeがインストールされていません"
    echo "   App Storeからインストールしてください"
    echo "   https://apps.apple.com/jp/app/xcode/id497799835"
    exit 1
fi

echo ""
echo "📱 Apple IDの設定手順"
echo "------------------------"
echo ""
echo "1. Xcodeを開きます..."
echo "   $ open /Applications/Xcode.app"
echo ""
echo "2. メニューから設定を開きます："
echo "   Xcode → Settings (または Preferences)"
echo ""
echo "3. Accountsタブで「+」ボタンをクリック"
echo ""
echo "4. Apple IDでサインイン"
echo ""
echo "5. Personal Teamが表示されれば成功！"
echo ""

# ユーザーに確認
read -p "Xcodeを開いてApple IDを設定しますか？ (y/n): " answer

if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
    echo "Xcodeを起動しています..."
    open /Applications/Xcode.app
    
    echo ""
    echo "📋 チェックリスト："
    echo "□ Xcodeの設定画面を開く"
    echo "□ Accountsタブを選択"
    echo "□ Apple IDを追加"
    echo "□ Personal Teamが表示される"
    echo ""
    echo "設定が完了したら、Enterキーを押してください..."
    read
fi

# プロジェクトの確認
echo ""
echo "🔍 Stilyaプロジェクトの確認..."
if [ -d "/Users/koki_air/Documents/GitHub/Stilya/ios" ]; then
    echo "✅ iOSプロジェクトが見つかりました"
    
    # Bundle IDの確認
    if [ -f "/Users/koki_air/Documents/GitHub/Stilya/app.config.js" ]; then
        echo ""
        echo "📦 現在のBundle ID設定："
        grep -A 5 "ios:" /Users/koki_air/Documents/GitHub/Stilya/app.config.js | grep "bundleIdentifier" || echo "   設定されていません"
    fi
else
    echo "❌ iOSプロジェクトが見つかりません"
    echo "   先にprebuildを実行してください："
    echo "   $ npx expo prebuild --platform ios"
fi

echo ""
echo "🚀 次のステップ"
echo "----------------"
echo ""
echo "【無料版でテストする場合】"
echo "1. Xcodeでプロジェクトを開く："
echo "   $ cd /Users/koki_air/Documents/GitHub/Stilya/ios"
echo "   $ open Stilya.xcworkspace"
echo ""
echo "2. Signing & Capabilitiesで設定："
echo "   - Automatically manage signingをON"
echo "   - TeamでPersonal Teamを選択"
echo ""
echo "3. 実機をつないで実行："
echo "   $ cd /Users/koki_air/Documents/GitHub/Stilya"
echo "   $ npx expo run:ios --device"
echo ""
echo "【有料版（年間$99）が必要な場合】"
echo "- TestFlightでのベータテスト"
echo "- App Storeへの公開"
echo "- Push通知などの高度な機能"
echo ""
echo "登録はこちら: https://developer.apple.com/programs/"
echo ""

# 便利なリンク集
echo "📚 参考リンク"
echo "-------------"
echo "• Apple ID作成: https://appleid.apple.com"
echo "• 開発者プログラム: https://developer.apple.com/programs/"
echo "• 料金について: https://developer.apple.com/jp/support/purchase-activation/"
echo "• Expoドキュメント: https://docs.expo.dev/build/setup/"
echo ""

echo "✨ 設定完了！開発を始めましょう！"
