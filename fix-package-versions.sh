#!/bin/bash

# Stilya - パッケージバージョン修正スクリプト

echo "📦 Stilya - パッケージバージョン修正"
echo "===================================="
echo ""
echo "Expo SDK 53と互換性のあるバージョンに更新します..."
echo ""

# プロジェクトディレクトリに移動
cd "$(dirname "$0")"

# バックアップ作成
echo "📋 package.jsonのバックアップを作成..."
cp package.json package.json.backup-$(date +%Y%m%d%H%M%S)

# パッケージの更新
echo "🔄 パッケージを更新中..."

# 推奨バージョンにアップデート
npm install @react-native-async-storage/async-storage@2.1.2 \
            @react-native-community/netinfo@11.4.1 \
            react@19.0.0 \
            --save

# 開発依存関係も更新
npm install @types/react@~19.0.10 \
            babel-preset-expo@~13.0.0 \
            --save-dev

echo ""
echo "✅ パッケージの更新が完了しました"
echo ""
echo "🧹 キャッシュをクリア中..."
rm -rf node_modules/.cache
rm -rf .expo/cache

echo ""
echo "✨ 完了！"
echo ""
echo "次のコマンドで開発を開始できます："
echo "  ./start-expo-go.sh    # Expo Goで実機テスト"
echo "  npm start             # 通常起動"
echo ""
echo "⚠️ 注意: iOSシミュレーターを使用するには、"
echo "  ./setup-ios-runtime.sh を実行してランタイムをインストールしてください"
