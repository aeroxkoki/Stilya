#!/bin/bash

# Stilya クイック実機接続スクリプト

echo "🚀 Stilya 実機接続 - 最速手順"
echo "================================"
echo ""

# IPアドレスを取得
IP=$(ifconfig | grep -E "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')

echo "📱 実機接続の3つの方法:"
echo ""
echo "1️⃣ 【推奨】手動URL入力（最も簡単）"
echo "   Expo Goアプリで以下のURLを直接入力:"
echo "   👉 exp://$IP:8081"
echo ""
echo "2️⃣ 別ポートで起動"
echo "   ./start-alternative.sh"
echo "   オプション2を選択（ポート8082）"
echo ""
echo "3️⃣ EASビルド（最も確実）"
echo "   eas build --platform ios --profile preview"
echo ""
echo "================================"
echo ""
echo "今すぐ開発サーバーを起動しますか？ (y/n)"
read -p "> " answer

if [ "$answer" = "y" ] || [ "$answer" = "Y" ]; then
    echo ""
    echo "ポートを選択してください:"
    echo "1) 8081（デフォルト）"
    echo "2) 8082（代替ポート）"
    echo "3) 8083（さらに別のポート）"
    read -p "> " port_choice
    
    case $port_choice in
        2)
            PORT=8082
            ;;
        3)
            PORT=8083
            ;;
        *)
            PORT=8081
            ;;
    esac
    
    echo ""
    echo "🔄 既存プロセスをクリーンアップ中..."
    killall node 2>/dev/null || true
    killall watchman 2>/dev/null || true
    
    echo "🚀 ポート $PORT で起動中..."
    echo ""
    echo "📱 Expo Goアプリで以下のURLを入力してください:"
    echo "👉 exp://$IP:$PORT"
    echo ""
    
    npx expo start --port $PORT --clear
else
    echo ""
    echo "📋 手動接続の手順:"
    echo "1. ターミナルで: npx expo start --port 8082"
    echo "2. Expo Goアプリで: exp://$IP:8082 を入力"
    echo ""
    echo "または EASビルドを使用:"
    echo "eas build --platform ios --profile preview"
fi