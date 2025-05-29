#!/bin/bash

# Stilya - 依存関係インストールスクリプト
echo "🚀 Stilya 依存関係のインストールを開始します..."

# Node.jsバージョンの確認
NODE_VERSION=$(node --version)
echo "📦 Node.js バージョン: $NODE_VERSION"

# npmキャッシュのクリア
echo "🧹 npmキャッシュをクリアしています..."
npm cache clean --force

# 既存のnode_modules等を削除
echo "🗑️  既存のファイルを削除しています..."
rm -rf node_modules
rm -rf package-lock.json
rm -rf .expo
rm -rf .metro-cache

# 依存関係のインストール
echo "📥 依存関係をインストールしています..."
npm install

# インストール結果の確認
if [ $? -eq 0 ]; then
    echo "✅ 依存関係のインストールが完了しました！"
    echo ""
    echo "📱 アプリを起動するには以下のコマンドを実行してください:"
    echo "   npx expo start"
else
    echo "❌ 依存関係のインストールに失敗しました"
    echo "エラーログを確認してください"
    exit 1
fi
