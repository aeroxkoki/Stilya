#!/bin/bash

echo "📱 Stilya QRコード開発を開始"
echo "============================"
echo ""

cd /Users/koki_air/Documents/GitHub/Stilya

# 環境確認
echo "🔍 環境チェック中..."
if ! command -v expo &> /dev/null; then
    echo "❌ Expo CLIが見つかりません"
    echo "インストール中..."
    npm install -g expo-cli
fi

echo ""
echo "📱 開発サーバーを起動します..."
echo ""
echo "🎯 手順："
echo "1. Expo Goアプリをインストール（まだの場合）"
echo "   https://apps.apple.com/jp/app/expo-go/id982107779"
echo ""
echo "2. 以下のコマンドを実行："
echo ""

# コマンドを表示
echo "npx expo start"
echo ""
echo "3. QRコードが表示されたら："
echo "   - Expo Goアプリでスキャン"
echo "   - またはカメラアプリでスキャンしてExpo Goで開く"
echo ""
echo "⚠️ 注意事項："
echo "- MacとiPhoneが同じWi-Fiネットワークに接続されていること"
echo "- VPNは無効にすること"
echo ""
echo "💡 もしうまくいかない場合は："
echo "npx expo start --tunnel"
echo ""

# 実際に実行
echo "準備ができたらEnterキーを押してください..."
read

npx expo start
