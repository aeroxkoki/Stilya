#!/bin/bash

# iPhone実機テスト - クイックスタートスクリプト
echo "📱 Stilya iPhone実機テスト セットアップ"
echo "========================================="

# 環境確認
echo "\n🔍 環境チェック中..."

# EAS CLIの確認
if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLIがインストールされていません"
    echo "👉 実行: npm install -g eas-cli"
    exit 1
fi

# EASログイン確認
if ! eas whoami &> /dev/null; then
    echo "❌ EASにログインしていません"
    echo "👉 実行: eas login"
    exit 1
fi

echo "✅ 環境チェック完了"

# ビルド確認
echo "\n📦 既存のiOSビルドを確認中..."
echo "最新のビルドを確認するには："
echo "https://expo.dev/accounts/aeroxkoki/projects/stilya/builds"

# ビルド作成の確認
echo "\n🔨 新しいiOS開発ビルドを作成しますか？"
echo "（既にビルドがある場合はスキップできます）"
read -p "ビルドを作成する？ (y/N): " -n 1 -r
echo

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📱 iOS開発ビルドを開始します..."
    eas build --platform ios --profile development
else
    echo "📋 既存のビルドを使用します"
fi

# 開発サーバー起動
echo "\n🚀 開発サーバーを起動しています..."
echo "iPhoneの準備ができたら、以下を実行してください："
echo ""
echo "1. カメラアプリでQRコードをスキャン"
echo "2. プロファイルをインストール"
echo "3. 設定 → 一般 → VPNとデバイス管理 で信頼"
echo "4. Stilyaアプリを起動"
echo ""

# IPアドレスを表示
IP=$(ifconfig en0 | grep inet | grep -v inet6 | awk '{print $2}')
echo "📡 開発サーバーURL: exp://$IP:8081"
echo ""

# 開発サーバーを起動
npm start
