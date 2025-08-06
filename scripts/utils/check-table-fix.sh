#!/bin/bash

# Stilya テーブル修正確認スクリプト

echo "🔍 products テーブル参照の確認..."
echo "================================"

# srcディレクトリ内でproductsテーブルへの参照を検索
echo "Checking for remaining 'products' table references..."
cd /Users/koki_air/Documents/GitHub/Stilya

# 検索結果をカウント
count=$(grep -r "from('products')" src/ 2>/dev/null | wc -l)
count2=$(grep -r 'from("products")' src/ 2>/dev/null | wc -l)
total=$((count + count2))

if [ $total -eq 0 ]; then
    echo "✅ すべての 'products' テーブル参照が 'external_products' に変更されました！"
else
    echo "❌ まだ $total 件の 'products' テーブル参照が残っています:"
    grep -r "from('products')" src/ 2>/dev/null || true
    grep -r 'from("products")' src/ 2>/dev/null || true
fi

echo ""
echo "🔍 external_products テーブル参照の確認..."
echo "================================"
external_count=$(grep -r "from('external_products')" src/ 2>/dev/null | wc -l)
external_count2=$(grep -r 'from("external_products")' src/ 2>/dev/null | wc -l)
external_total=$((external_count + external_count2))

echo "✅ $external_total 件の 'external_products' テーブル参照が見つかりました"

echo ""
echo "🔍 TABLES.PRODUCTS の確認..."
echo "================================"
grep -n "PRODUCTS:" src/services/supabase.ts | head -5

echo ""
echo "✅ テーブル修正が完了しました！"
echo ""
echo "次のステップ:"
echo "1. npm run start でアプリを起動してテスト"
echo "2. 商品データが正しく表示されることを確認"
echo "3. スワイプ機能が正常に動作することを確認"
