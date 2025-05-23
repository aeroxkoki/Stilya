#!/bin/bash

echo "📱 Stilya シミュレーター実行ガイド"
echo "================================="

cd /Users/koki_air/Documents/GitHub/Stilya

echo ""
echo "🖥️ シミュレーターでの実行方法"
echo ""
echo "1️⃣ Xcodeでデバイスをシミュレーターに変更："
echo "   - Xcodeの上部バーで、デバイス選択を確認"
echo "   - 「iPhone 15 Pro」などのシミュレーターを選択"
echo "   - 実機ではなくシミュレーターを選ぶ"
echo ""
echo "2️⃣ コマンドラインから実行："
echo ""

# シミュレーターリストを取得
echo "利用可能なシミュレーター："
xcrun simctl list devices available | grep -E "iPhone|iPad" | grep -v "unavailable" | head -10

echo ""
echo "📌 推奨コマンド："
echo ""
echo "# デフォルトのシミュレーターで起動"
echo "npm run ios"
echo ""
echo "# 特定のシミュレーターを指定"
echo "npx expo run:ios --simulator \"iPhone 15 Pro\""
echo ""
echo "# シミュレーターリストを確認"
echo "xcrun simctl list devices"
echo ""
echo "✅ シミュレーターなら実機登録不要で今すぐ実行できます！"
