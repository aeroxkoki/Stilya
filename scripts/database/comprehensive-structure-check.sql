-- Stilya データベース構造詳細確認クエリ
-- 実行日時: [実行時に記入]
-- 実行者: [実行者名を記入]

-- ========================================
-- 1. テーブル一覧の確認
-- ========================================
SELECT 
    table_name,
    CASE 
        WHEN table_name = 'products' THEN 'レガシーテーブル（要確認）'
        WHEN table_name = 'external_products' THEN 'メインの商品テーブル'
        WHEN table_name = 'swipes' THEN 'スワイプ履歴テーブル'
        ELSE 'その他'
    END as description
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_type = 'BASE TABLE'
ORDER BY table_name;

-- ========================================
-- 2. external_products テーブルの詳細構造
-- ========================================
-- 2.1 カラム情報
SELECT 
    ordinal_position as "順序",
    column_name as "カラム名",
    data_type as "データ型",
    character_maximum_length as "最大長",
    is_nullable as "NULL許可",
    column_default as "デフォルト値"
FROM information_schema.columns
WHERE table_name = 'external_products'
ORDER BY ordinal_position;

-- 2.2 プライマリキー情報
SELECT 
    kcu.column_name as "プライマリキーカラム",
    tc.constraint_name as "制約名"
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'external_products'
AND tc.constraint_type = 'PRIMARY KEY';

-- 2.3 ユニーク制約
SELECT 
    kcu.column_name as "ユニークカラム",
    tc.constraint_name as "制約名"
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'external_products'
AND tc.constraint_type = 'UNIQUE';

-- 2.4 インデックス情報
SELECT 
    indexname as "インデックス名",
    indexdef as "インデックス定義"
FROM pg_indexes
WHERE tablename = 'external_products';

-- 2.5 サンプルデータ（5件）
SELECT 
    id,
    product_id,
    title,
    source,
    created_at,
    LENGTH(id) as id_length,
    LENGTH(product_id) as product_id_length
FROM external_products
LIMIT 5;

-- ========================================
-- 3. swipes テーブルの詳細構造
-- ========================================
-- 3.1 カラム情報
SELECT 
    ordinal_position as "順序",
    column_name as "カラム名",
    data_type as "データ型",
    is_nullable as "NULL許可"
FROM information_schema.columns
WHERE table_name = 'swipes'
ORDER BY ordinal_position;

-- 3.2 外部キー制約の詳細
SELECT
    tc.constraint_name as "制約名",
    kcu.column_name as "参照元カラム",
    ccu.table_name AS "参照先テーブル",
    ccu.column_name AS "参照先カラム",
    rc.delete_rule as "削除ルール",
    rc.update_rule as "更新ルール"
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'swipes';

-- ========================================
-- 4. データ整合性チェック
-- ========================================
-- 4.1 swipesテーブルの無効な参照をチェック
SELECT 
    COUNT(*) as "無効な参照数",
    COUNT(DISTINCT s.product_id) as "無効な商品ID数"
FROM swipes s
LEFT JOIN external_products ep ON s.product_id = ep.id
WHERE ep.id IS NULL;

-- 4.2 product_idカラムの値のパターン分析
SELECT 
    CASE 
        WHEN product_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 'UUID形式'
        WHEN product_id LIKE '%_%' THEN 'アンダースコア含む（新形式？）'
        WHEN product_id ~ '^[0-9]+$' THEN '数値のみ'
        ELSE 'その他'
    END as "IDパターン",
    COUNT(*) as "件数",
    MIN(created_at) as "最古の日時",
    MAX(created_at) as "最新の日時"
FROM external_products
GROUP BY 1
ORDER BY 2 DESC;

-- 4.3 最近追加された商品のID形式確認（10件）
SELECT 
    id,
    product_id,
    source_brand,
    created_at
FROM external_products
ORDER BY created_at DESC
LIMIT 10;

-- ========================================
-- 5. productsテーブルの確認（存在する場合）
-- ========================================
-- テーブルの存在確認
SELECT 
    COUNT(*) as "productsテーブルの存在（1=存在, 0=存在しない）"
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'products';

-- 存在する場合のレコード数
SELECT 
    'products' as table_name,
    COUNT(*) as record_count
FROM products
WHERE EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'products'
);

-- ========================================
-- 6. 重複データの確認
-- ========================================
-- 6.1 product_idの重複確認
SELECT 
    product_id,
    COUNT(*) as duplicate_count
FROM external_products
GROUP BY product_id
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC
LIMIT 10;

-- 6.2 タイトルとブランドの組み合わせで重複確認
SELECT 
    title,
    source_brand,
    COUNT(*) as duplicate_count,
    STRING_AGG(product_id, ', ') as product_ids
FROM external_products
GROUP BY title, source_brand
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC
LIMIT 10;

-- ========================================
-- 7. 統計情報
-- ========================================
SELECT 
    'external_products' as table_name,
    COUNT(*) as total_records,
    COUNT(DISTINCT product_id) as unique_product_ids,
    COUNT(DISTINCT source_brand) as unique_brands,
    MIN(created_at) as oldest_record,
    MAX(created_at) as newest_record
FROM external_products;
