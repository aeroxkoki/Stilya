#!/bin/bash

# Stilya Quick Start for Expo Go Testing
# 実行: chmod +x quick-start-expo.sh && ./quick-start-expo.sh

echo "🚀 Stilya - Expo Go クイックスタート"
echo "======================================"

# 現在のディレクトリを確認
if [ ! -f "package.json" ]; then
    echo "❌ エラー: package.jsonが見つかりません"
    echo "Stilyaプロジェクトのルートディレクトリで実行してください"
    exit 1
fi

# 環境変数ファイルの確認
echo "📝 環境変数チェック中..."
if [ ! -f ".env" ]; then
    echo "⚠️ .envファイルが見つかりません"
    echo "環境変数が設定されていない可能性があります"
else
    echo "✅ .envファイルが存在します"
    # 重要な環境変数の存在確認
    if grep -q "EXPO_PUBLIC_SUPABASE_URL" .env; then
        echo "✅ Supabase URLが設定されています"
    else
        echo "❌ Supabase URLが設定されていません"
    fi
fi

# Node modulesの確認と必要に応じてインストール
echo ""
echo "📦 依存関係チェック中..."
if [ ! -d "node_modules" ]; then
    echo "⚠️ node_modulesが見つかりません"
    echo "依存関係をインストールしています..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ 依存関係のインストールに失敗しました"
        exit 1
    fi
else
    echo "✅ 依存関係がインストール済みです"
fi

# キャッシュのクリア（オプション）
echo ""
read -p "キャッシュをクリアしますか？ (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🧹 キャッシュをクリアしています..."
    npx expo start --clear
else
    echo ""
    echo "🎯 Expo Goを起動しています..."
    echo "======================================"
    echo ""
    echo "📱 実機でテストする場合:"
    echo "1. スマートフォンにExpo Goアプリをインストール"
    echo "2. 表示されるQRコードをスキャン"
    echo ""
    echo "💻 エミュレータでテストする場合:"
    echo "- iOS: 'i' キーを押す"
    echo "- Android: 'a' キーを押す"
    echo ""
    echo "🛠️ デバッグメニュー:"
    echo "- 開発メニュー: 'd' キーを押す"
    echo "- リロード: 'r' キーを押す"
    echo ""
    echo "======================================"
    echo ""
    
    # Expo起動
    npm run start:expo-go
fi
