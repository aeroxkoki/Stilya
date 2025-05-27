#!/bin/bash

echo "🔧 Expo Go接続の問題を修正中..."
echo "================================"

cd /Users/koki_air/Documents/GitHub/Stilya

# 1. ngrokの問題を解決
echo "📦 ngrokの再インストール..."
npm uninstall -g @expo/ngrok 2>/dev/null
npm cache clean --force
npm install -g @expo/ngrok@4.1.3

# 2. Expoキャッシュをクリア
echo ""
echo "🧹 Expoキャッシュをクリア..."
rm -rf .expo
rm -rf node_modules/.cache
rm -rf $TMPDIR/metro-*
rm -rf $TMPDIR/haste-*

# 3. IPアドレスを表示
echo ""
echo "📱 接続情報:"
echo "============"
IP_ADDRESS=$(ifconfig | grep "inet " | grep -v 127.0.0.1 | head -1 | awk '{print $2}')
echo "MacのIPアドレス: $IP_ADDRESS"
echo ""
echo "もしQRコードが動作しない場合:"
echo "1. Expo Goアプリを開く"
echo "2. 'Enter URL manually'を選択"
echo "3. 次のURLを入力: exp://$IP_ADDRESS:8081"
echo ""

# 4. LANモードで起動
echo "🚀 LANモードで起動中..."
echo "（iPhoneとMacが同じWi-Fiに接続されていることを確認）"
echo ""

npx expo start --clear
