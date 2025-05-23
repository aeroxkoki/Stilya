#!/bin/bash

echo "=== Expo Go 手動インストールスクリプト ==="
echo ""
echo "1. Expo Go APKをダウンロード中..."

# Expo Go APKのダウンロード
curl -o expo-go.apk https://d1ahtucjixef4r.cloudfront.net/Exponent-2.31.2.apk

echo "2. エミュレーターにインストール中..."

# APKをインストール
adb install expo-go.apk

echo "3. クリーンアップ..."
rm expo-go.apk

echo ""
echo "✅ インストール完了！"
echo "エミュレーターでExpo Goアプリを確認してください。"
