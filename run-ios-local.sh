#!/bin/bash

echo "🚀 Stilya iOS ローカルビルド開始..."

# プロジェクトディレクトリに移動
cd /Users/koki_air/Documents/GitHub/Stilya

# CocoaPodsの依存関係をインストール
echo "📦 CocoaPodsの依存関係をインストール中..."
cd ios
pod install
cd ..

# Metroバンドラーをクリア
echo "🧹 キャッシュをクリア中..."
npx expo start --clear

# iOSシミュレーターで起動
echo "📱 iOSシミュレーターで起動中..."
npm run ios
