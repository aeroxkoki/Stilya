#!/bin/bash
# pre-eas-build.sh
# EASビルド前の準備スクリプト

# プロジェクトルートディレクトリに移動
cd "$(dirname "$0")/.."

echo "📦 EAS Build の前準備を実行します..."

# Metro依存関係の互換性修正を実行
echo "🔧 Metro互換性の問題を修正中..."
chmod +x ./scripts/fix-metro-incompatibility.sh
./scripts/fix-metro-incompatibility.sh

# 環境変数を設定
export NODE_OPTIONS="--max-old-space-size=8192"
export EAS_SKIP_JAVASCRIPT_BUNDLING=1

# EASビルド用の最適化設定
echo "⚙️ EASビルド用の最適化設定を適用中..."

# app.json確認 - 既に設定されているのを確認
if grep -q "jsEngine" app.json && grep -q "hermes" app.json; then
  echo "✅ app.json は Hermes が有効になっています"
else
  echo "⚠️ app.json が正しく設定されていません。Hermesが有効になっていることを確認してください。"
fi

# EASビルド用のcache.jsonを作成
echo "📝 EASビルド用のキャッシュ設定を作成中..."
mkdir -p .expo
cat > .expo/cache.json << 'EOL'
{
  "metro": {
    "version": "0.77.0",
    "enabled": false
  },
  "babel": {
    "version": "7.27.1",
    "enabled": false
  }
}
EOL

echo "✅ EASビルドの前準備が完了しました"
