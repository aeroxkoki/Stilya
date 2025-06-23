-- Stilyaデータベース現在の状態確認

-- 1. テーブル一覧
SELECT 
    table_name,
    CASE 
        WHEN table_name = 'products' THEN 'レガシーテーブル（使用停止予定）'
        WHEN table_name = 'external_products' THEN 'アクティブテーブル（現在使用中）'
        ELSE '関連テーブル'
    END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('products', 'external_products', 'swipes')
ORDER BY table_name;

-- 2. 各テーブルのレコード数
SELECT 'products' as table_name, COUNT(*) as count FROM products
UNION ALL
SELECT 'external_products', COUNT(*) FROM external_products
UNION ALL
SELECT 'swipes', COUNT(*) FROM swipes;

-- 3. swipesテーブルの外部キー制約を確認
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'swipes'
    AND kcu.column_name = 'product_id';

-- 4. 無効なスワイプデータの確認（external_productsに存在しない商品）
SELECT 
    s.id,
    s.product_id,
    s.created_at,
    CASE 
        WHEN ep.id IS NULL THEN 'external_productsに存在しない'
        ELSE 'OK'
    END as status
FROM swipes s
LEFT JOIN external_products ep ON s.product_id = ep.id
WHERE ep.id IS NULL
LIMIT 10;

-- 5. productsテーブルの商品IDがswipesで使われているか確認
SELECT 
    COUNT(DISTINCT s.product_id) as swiped_product_count,
    COUNT(DISTINCT CASE WHEN p.id IS NOT NULL THEN s.product_id END) as from_products_table,
    COUNT(DISTINCT CASE WHEN ep.id IS NOT NULL THEN s.product_id END) as from_external_products_table
FROM swipes s
LEFT JOIN products p ON s.product_id::uuid = p.id
LEFT JOIN external_products ep ON s.product_id = ep.id;
