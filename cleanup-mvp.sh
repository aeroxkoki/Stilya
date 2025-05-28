#!/bin/bash

# Stilya MVP向け最小構成クリーンアップスクリプト
# 実行前にバックアップを推奨

echo "🧹 Stilya MVP最小構成へのクリーンアップを開始します..."

# バックアップディレクトリの作成
BACKUP_DIR="backup_$(date +%Y%m%d_%H%M%S)"
echo "📦 バックアップを作成中: $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"

# 重要なファイルのバックアップ
cp -r src "$BACKUP_DIR/"
cp package.json "$BACKUP_DIR/"
cp tsconfig.json "$BACKUP_DIR/"
cp app.config.js "$BACKUP_DIR/"
cp eas.json "$BACKUP_DIR/"

echo "🗑️  MVP不要なファイルを削除中..."

# 開発者向け・デバッグ関連の削除
rm -f src/navigation/DevNavigator.tsx
rm -f src/navigation/ReportNavigator.tsx
rm -rf src/screens/dev/
rm -rf src/screens/report/
rm -rf src/components/test/

# 重複したサービスファイルの削除（統合版を残す）
rm -f src/services/product.ts  # productService.tsを使用
rm -f src/services/affiliate.ts  # rakutenServiceに統合

# 不要なユーティリティの削除
rm -f src/utils/metro-serializer-fix.js
rm -f src/utils/metro-context.ts
rm -f src/utils/polyfills.ts

# 未使用のアセットの削除
find src/assets -name "*.backup" -delete
find src/assets -name "*.old" -delete

# 一時ファイルとキャッシュのクリア
echo "🧽 キャッシュをクリア中..."
rm -rf .expo/
rm -rf .metro-cache/
rm -rf node_modules/.cache/
rm -rf .parcel-cache/

# node_modulesの再構築（オプション）
echo "📦 依存関係を最適化中..."
# rm -rf node_modules/
# npm install

echo "✅ クリーンアップ完了！"
echo "📊 結果:"
echo "  - バックアップ: $BACKUP_DIR"
echo "  - 現在のファイル数: $(find . -type f -not -path '*/\.*' | wc -l)"
