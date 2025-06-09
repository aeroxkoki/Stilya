#!/bin/bash

echo "🚀 Stilya MVP - 高速起動（トラブルシューティング不要）"
echo ""
echo "📱 開発方法を選択してください："
echo ""
echo "1. ローカルネットワークで実機テスト（推奨）"
echo "2. Webブラウザで開発（最速）"
echo "3. ngrokを手動インストールしてトンネルモード"
echo ""
echo "選択してください (1/2/3): "
read choice

case $choice in
  1)
    echo "📡 ローカルネットワークモードで起動..."
    echo "重要: スマートフォンとMacが同じWiFiに接続されている必要があります"
    npx expo start
    ;;
  2)
    echo "🌐 Webブラウザモードで起動（UI確認用）..."
    echo "注意: 一部のネイティブ機能は動作しません"
    npx expo start --web
    ;;
  3)
    echo "🔧 ngrokを手動でインストール..."
    npm install -g @expo/ngrok@4.1.3
    echo "インストール完了後、以下を実行:"
    echo "npx expo start --tunnel"
    ;;
  *)
    echo "📱 デフォルト: ローカルネットワークモードで起動..."
    npx expo start
    ;;
esac
