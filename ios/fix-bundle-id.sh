#!/bin/bash

echo "🔧 Stilya Bundle Identifier 修正スクリプト"
echo "========================================"

# Xcodeを開く
echo "📱 Xcodeでプロジェクトを開いています..."
cd /Users/koki_air/Documents/GitHub/Stilya/ios
open Stilya.xcodeproj

echo ""
echo "Xcodeが開いたら、以下の手順で修正してください："
echo ""
echo "1️⃣ 左側のナビゲーターで 'Stilya' プロジェクトを選択"
echo ""
echo "2️⃣ TARGETS → Stilya を選択"
echo ""
echo "3️⃣ 'General' タブで以下を変更："
echo "   - Display Name: Stilya"
echo "   - Bundle Identifier: com.stilya.app"
echo "     （または com.yourname.stilya のように一意のIDに変更）"
echo ""
echo "4️⃣ 'Signing & Capabilities' タブで："
echo "   - ✅ Automatically manage signing にチェック"
echo "   - Team: Personal Team を選択"
echo ""
echo "5️⃣ Bundle Identifier を変更すると自動的に証明書が作成されます"
echo ""
echo "6️⃣ Command + B でビルドテスト"
echo ""
echo "完了したら、以下のコマンドで実行できます："
echo "  cd /Users/koki_air/Documents/GitHub/Stilya"
echo "  npm run ios"
