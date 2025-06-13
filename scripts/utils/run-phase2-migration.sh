#!/bin/bash

# Phase 2データベースマイグレーション実行スクリプト

echo "🚀 Phase 2 データベースマイグレーションを開始します..."

# 環境変数の読み込み
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Supabaseが起動していることを確認
if ! pgrep -f "supabase" > /dev/null; then
    echo "⚠️  Supabaseが起動していません。起動します..."
    npx supabase start
    sleep 5
fi

# マイグレーションSQLファイルの確認
MIGRATION_FILE="scripts/phase2-database-migration.sql"
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ マイグレーションファイルが見つかりません: $MIGRATION_FILE"
    exit 1
fi

echo "📋 マイグレーション内容："
echo "  - external_productsテーブルへの新規カラム追加"
echo "    - shop_name: ショップ名"
echo "    - review_count: レビュー数"
echo "    - review_average: レビュー平均点"
echo "    - item_update_timestamp: 商品更新日時"
echo "    - is_seasonal: 季節商品フラグ"
echo "  - user_preferencesテーブルの作成"
echo "  - seasonal_productsビューの作成"
echo ""

# 現在のテーブル構造を確認
echo "📊 現在のexternal_productsテーブル構造を確認中..."
npx supabase db execute --sql "\\d external_products" 2>/dev/null || true

# マイグレーションの実行
echo ""
echo "🔧 マイグレーションを実行中..."
if npx supabase db execute --file "$MIGRATION_FILE"; then
    echo "✅ マイグレーションが正常に完了しました"
else
    echo "❌ マイグレーションの実行中にエラーが発生しました"
    exit 1
fi

# マイグレーション後のテーブル構造を確認
echo ""
echo "📊 更新後のexternal_productsテーブル構造："
npx supabase db execute --sql "\\d external_products" 2>/dev/null || true

# 新しいカラムの確認
echo ""
echo "🔍 新しいカラムの確認："
npx supabase db execute --sql "SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'external_products' AND column_name IN ('shop_name', 'review_count', 'review_average', 'item_update_timestamp', 'is_seasonal') ORDER BY column_name;"

# user_preferencesテーブルの確認
echo ""
echo "📊 user_preferencesテーブルの確認："
npx supabase db execute --sql "\\d user_preferences" 2>/dev/null || true

# 季節商品ビューの確認
echo ""
echo "🌸 seasonal_productsビューの確認："
npx supabase db execute --sql "SELECT COUNT(*) as seasonal_product_count FROM seasonal_products;" 2>/dev/null || true

# 既存データの季節フラグ更新状況
echo ""
echo "📈 季節商品の統計："
npx supabase db execute --sql "SELECT is_seasonal, COUNT(*) as count FROM external_products GROUP BY is_seasonal ORDER BY is_seasonal;"

echo ""
echo "✨ Phase 2 データベースマイグレーションが完了しました"
echo ""
echo "🔄 次のステップ："
echo "  1. scripts/sync-mvp-brands.js を実行して新しいフィールドを含む商品データを同期"
echo "  2. アプリでPhase 2の機能（スコアリング、季節性、価格帯最適化）をテスト"
echo ""
