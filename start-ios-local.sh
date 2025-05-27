#!/bin/bash

# Stilya - iOS ローカル開発スクリプト
# MVPフェーズ用の簡易起動スクリプト

echo "🚀 Stilya iOS 開発環境を起動します..."

# 環境チェック
if ! command -v npx &> /dev/null; then
    echo "❌ Node.js/npmがインストールされていません"
    exit 1
fi

if ! command -v xcrun &> /dev/null; then
    echo "❌ Xcodeがインストールされていません"
    exit 1
fi

# プロジェクトディレクトリに移動
cd "$(dirname "$0")"

# キャッシュクリア（必要に応じて）
if [ "$1" == "--clean" ]; then
    echo "🧹 キャッシュをクリアしています..."
    rm -rf .expo/cache
    rm -rf node_modules/.cache
    npx expo start --clear
else
    # 通常起動
    echo "📱 iOSシミュレーターを起動します..."
    
    # シミュレーターが起動していない場合は起動
    if ! xcrun simctl list devices | grep -q "Booted"; then
        echo "📱 シミュレーターを起動しています..."
        open -a Simulator
        sleep 5
    fi
    
    # Expo開発サーバーを起動
    echo "🎯 Expo開発サーバーを起動します..."
    npx expo start --ios
fi
