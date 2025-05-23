#!/bin/bash

echo "🔧 Bundle Identifier 修正ガイド（HelloWorldターゲット用）"
echo "=================================================="

# Xcodeを開く
echo "📱 Xcodeでプロジェクトを開いています..."
cd /Users/koki_air/Documents/GitHub/Stilya/ios
open Stilya.xcodeproj

echo ""
echo "⚠️  重要: ターゲット名は「HelloWorld」です！"
echo ""
echo "Xcodeが開いたら、以下の手順で修正してください："
echo ""
echo "1️⃣ 左側のナビゲーターで青いプロジェクトアイコンを選択"
echo ""
echo "2️⃣ TARGETS → HelloWorld を選択（Stilyaではありません）"
echo ""
echo "3️⃣ 'General' タブで以下を変更："
echo "   - Display Name: HelloWorld → Stilya"
echo "   - Bundle Identifier: org.name.HelloWorld → com.aeroxkoki.stilya"
echo ""
echo "4️⃣ 'Signing & Capabilities' タブで："
echo "   - ✅ Automatically manage signing にチェック"
echo "   - Team: あなたの名前 (Personal Team) を選択"
echo ""
echo "5️⃣ エラーが解消されたことを確認"
echo ""
echo "6️⃣ Command + B でビルドテスト"
echo ""
echo "✅ 修正が完了したら、以下のコマンドで実行："
echo "  cd /Users/koki_air/Documents/GitHub/Stilya"
echo "  npm run ios"
echo ""
echo "💡 ヒント: Bundle IDは世界で一意である必要があります"
echo "  推奨: com.aeroxkoki.stilya"
echo "  または: com.github.aeroxkoki.stilya"
