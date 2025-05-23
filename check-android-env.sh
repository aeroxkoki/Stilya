#!/bin/bash

# Android環境チェックスクリプト

echo "🔍 Android環境をチェックしています..."

# Java確認
echo -e "\n📍 Java Version:"
java -version 2>&1 | head -3

# Android Home確認
echo -e "\n📍 ANDROID_HOME:"
if [ -z "$ANDROID_HOME" ]; then
    echo "❌ ANDROID_HOME が設定されていません"
else
    echo "✅ $ANDROID_HOME"
fi

# Android SDKの存在確認
echo -e "\n📍 Android SDK:"
if [ -d "$HOME/Library/Android/sdk" ]; then
    echo "✅ Android SDK が見つかりました: $HOME/Library/Android/sdk"
else
    echo "❌ Android SDK が見つかりません"
fi

# adbコマンドの確認
echo -e "\n📍 ADB:"
if command -v adb &> /dev/null; then
    echo "✅ adb が利用可能です"
    adb version | head -1
else
    echo "❌ adb が見つかりません"
fi

echo -e "\n✨ チェック完了"
