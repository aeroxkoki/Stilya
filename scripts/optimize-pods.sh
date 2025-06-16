#!/bin/bash

# Stilya iOS ビルド最適化スクリプト（シンプル版）

echo "🚀 Stilya iOS ビルド最適化を開始します..."

# プロジェクトルートに移動
cd /Users/koki_air/Documents/GitHub/Stilya

# 1. クリーンビルド
echo "🧹 クリーンビルドを実行しています..."
rm -rf ios android
npx expo prebuild --clean

# 2. iOS依存関係のインストール
echo "📦 CocoaPodsをインストールしています..."
cd ios
pod install

# 3. 結果を表示
echo ""
echo "✅ 最適化が完了しました！"
echo ""
echo "📊 適用された最適化:"
echo "✓ New Architecture無効化（app.config.jsで設定済み）"
echo "✓ クリーンビルド実行"
echo ""
echo "💡 次のステップ:"
echo "1. 'npm run ios' でビルドを実行してください"
