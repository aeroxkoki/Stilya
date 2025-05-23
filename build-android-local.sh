#!/bin/bash

# Stilya Android Local Build Script
# このスクリプトはEASのFreeプラン制限を回避してローカルでビルドを実行します

echo "🚀 Stilya Android ローカルビルド開始..."

# 環境チェック
if ! command -v java &> /dev/null; then
    echo "❌ Javaがインストールされていません。JDK 17以上をインストールしてください。"
    exit 1
fi

if ! command -v eas &> /dev/null; then
    echo "❌ EAS CLIがインストールされていません。"
    echo "インストール: npm install -g eas-cli"
    exit 1
fi

# 環境変数の設定
export NODE_ENV=development
export EAS_LOCAL_BUILD_SKIP_CLEANUP=1

# キャッシュのクリーンアップ
echo "🧹 キャッシュをクリーンアップ中..."
rm -rf .expo/cache .metro-cache

# 依存関係の確認
echo "📦 依存関係を確認中..."
npm install --legacy-peer-deps

# ローカルビルドの実行
echo "🔨 ローカルビルドを開始..."
npx eas build --platform android --profile preview --local

echo "✅ ビルド処理が完了しました。"
echo "📱 生成されたAPKファイルはプロジェクトルートに配置されます。"
