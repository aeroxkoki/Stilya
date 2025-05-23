#!/bin/bash

echo "🔄 Stilya iOS プロジェクト再生成スクリプト"
echo "========================================="

cd /Users/koki_air/Documents/GitHub/Stilya

echo "⚠️  警告: これはiOSプロジェクトを再生成します"
echo "既存のカスタマイズは失われる可能性があります"
read -p "続行しますか？ (y/n): " answer

if [ "$answer" != "y" ] && [ "$answer" != "Y" ]; then
    echo "キャンセルしました"
    exit 0
fi

# 環境変数設定
export LANG=en_US.UTF-8
export LC_ALL=en_US.UTF-8

echo ""
echo "1️⃣ 既存のiOSディレクトリをバックアップ..."
if [ -d "ios" ]; then
    mv ios ios.backup.$(date +%Y%m%d_%H%M%S)
    echo "✅ バックアップ完了"
fi

echo ""
echo "2️⃣ app.config.jsの確認..."
echo "Bundle Identifier: com.stilya.app"

echo ""
echo "3️⃣ iOSプロジェクトを再生成..."
npx expo prebuild --platform ios --clear

echo ""
echo "4️⃣ CocoaPodsをインストール..."
cd ios
pod install

echo ""
echo "✅ 完了！"
echo ""
echo "次のステップ:"
echo "1. cd /Users/koki_air/Documents/GitHub/Stilya"
echo "2. npm run ios"
echo ""
echo "または Xcodeで開く場合:"
echo "1. cd ios"
echo "2. open Stilya.xcworkspace"
echo ""
echo "Xcodeで以下を確認してください:"
echo "- Signing & Capabilities → Team設定"
echo "- Bundle Identifier が com.stilya.app になっているか"
