#!/bin/bash

# 商品同期結果確認スクリプト

echo "=== Supabase商品データ確認 ==="

# 1. 商品数の確認
echo -e "\n1. 商品数の確認:"
cat << 'EOF' > /tmp/check_count.sql
SELECT COUNT(*) as total_products FROM external_products WHERE is_active = true;
EOF

# 2. カテゴリ別商品数
echo -e "\n2. カテゴリ別商品数:"
cat << 'EOF' > /tmp/check_categories.sql
SELECT category, COUNT(*) as count 
FROM external_products 
WHERE is_active = true 
GROUP BY category 
ORDER BY count DESC;
EOF

# 3. 最新の商品10件
echo -e "\n3. 最新の商品10件:"
cat << 'EOF' > /tmp/check_recent.sql
SELECT id, title, price, category, last_synced 
FROM external_products 
WHERE is_active = true 
ORDER BY last_synced DESC 
LIMIT 10;
EOF

echo -e "\n上記のSQLクエリをSupabaseダッシュボードのSQL Editorで実行してください。"
echo "または、以下のファイルの内容をコピーして実行："
echo "- /tmp/check_count.sql"
echo "- /tmp/check_categories.sql"
echo "- /tmp/check_recent.sql"
