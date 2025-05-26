#!/bin/bash

echo "🚀 Stilya iOS Quick Test (Expo Go)"
echo "=================================="

cd /Users/koki_air/Documents/GitHub/Stilya

# 環境変数のチェック
if [ ! -f .env ]; then
    echo "⚠️  .envファイルが見つかりません"
    echo "📝 .env.exampleから.envを作成します..."
    
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ .envファイルを作成しました"
        echo "   → 必要に応じて環境変数を設定してください"
    else
        echo "❌ .env.exampleも見つかりません"
        echo "   → デモモードで起動します"
    fi
fi

# キャッシュクリア
echo ""
echo "🧹 キャッシュをクリア中..."
rm -rf node_modules/.cache
rm -rf .expo/cache
rm -rf .metro-cache

# パッケージの確認
echo ""
echo "📦 依存関係を確認中..."
if [ ! -d "node_modules" ]; then
    echo "📥 依存関係をインストール中..."
    npm install
fi

# Expo Goで起動
echo ""
echo "📱 Expo Goで起動中..."
echo ""
echo "使い方:"
echo "1. iPhoneでExpo Goアプリをダウンロード"
echo "2. 下に表示されるQRコードをスキャン"
echo "3. アプリが自動的に読み込まれます"
echo ""
echo "ヒント:"
echo "- 同じWi-Fiネットワークに接続してください"
echo "- QRコードが表示されない場合は 'shift + q' を押す"
echo "- 問題がある場合は 'r' でリロード"
echo ""

# Expo start with clear cache
npx expo start --clear --tunnel
