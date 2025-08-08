#!/bin/bash

echo "🔧 実機のネットワークエラー解決スクリプト"
echo ""

# 1. Expoキャッシュをクリア
echo "📱 Expoキャッシュをクリアしています..."
rm -rf .expo
rm -rf node_modules/.cache
npx expo start --clear

echo ""
echo "✅ キャッシュがクリアされました"
echo ""
echo "🚀 アプリを再起動してください:"
echo "1. 実機でExpo Goアプリを完全に終了"
echo "2. Expo Goアプリを再起動"
echo "3. QRコードを再度スキャン"
echo ""
echo "それでも問題が解決しない場合:"
echo "- Wi-Fi/モバイルデータの接続を確認"
echo "- VPNを無効化"
echo "- 実機とPCが同じネットワーク上にあることを確認"
echo ""
echo "デバッグモードを有効にするには:"
echo "echo 'EXPO_PUBLIC_DEBUG_MODE=true' >> .env"
