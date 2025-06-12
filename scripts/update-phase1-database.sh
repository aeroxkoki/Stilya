#!/bin/bash

# Phase 1 Database Update Script
# 保存機能とセール情報のためのデータベース更新

echo "===================="
echo "Phase 1 Database Update"
echo "===================="
echo ""

# Supabaseが起動しているか確認
if ! supabase status 2>/dev/null | grep -q "supabase local development setup is running"; then
    echo "❌ Supabase is not running. Starting Supabase..."
    supabase start
    sleep 5
fi

# SQLファイルの存在確認
SQL_FILE="scripts/phase1-database-update.sql"
if [ ! -f "$SQL_FILE" ]; then
    echo "❌ SQL file not found: $SQL_FILE"
    exit 1
fi

echo "📊 Applying database updates..."

# データベース更新の実行
if supabase db push < "$SQL_FILE"; then
    echo "✅ Database updated successfully!"
    
    # テーブルの確認
    echo ""
    echo "🔍 Verifying new tables and columns..."
    
    # saved_itemsテーブルの確認
    echo "Checking saved_items table..."
    supabase db execute --command "SELECT COUNT(*) FROM saved_items;" 2>/dev/null
    
    # external_productsの新しいカラムの確認
    echo ""
    echo "Checking new columns in external_products..."
    supabase db execute --command "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'external_products' AND column_name IN ('original_price', 'discount_percentage', 'is_sale', 'rating', 'review_count');" 2>/dev/null
    
else
    echo "❌ Database update failed!"
    exit 1
fi

echo ""
echo "===================="
echo "Update Complete!"
echo "===================="
echo ""
echo "Next steps:"
echo "1. Test the new save feature in the app"
echo "2. Update SwipeContainer to use SwipeCardEnhanced"
echo "3. Add some test products with sale information"
echo ""
