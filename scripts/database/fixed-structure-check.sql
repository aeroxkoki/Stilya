-- Stilya データベース構造確認クエリ（修正版）
-- external_productsテーブルにproduct_idカラムが存在しない場合用

-- ========================================
-- 1. external_products テーブルのカラム一覧
-- ========================================
SELECT 
    ordinal_position as "順序",
    column_name as "カラム名",
    data_type as "データ型",
    is_nullable as "NULL許可",
    column_default as "デフォルト値"
FROM information_schema.columns
WHERE table_name = 'external_products'
ORDER BY ordinal_position;

-- ========================================
-- 2. プライマリキー情報
-- ========================================
SELECT 
    kcu.column_name as "プライマリキーカラム",
    tc.constraint_name as "制約名"
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'external_products'
AND tc.constraint_type = 'PRIMARY KEY';

-- ========================================
-- 3. サンプルデータ（idカラムのみで確認）
-- ========================================
SELECT 
    id,
    title,
    source,
    source_brand,
    created_at,
    LENGTH(id) as id_length
FROM external_products
LIMIT 10;

-- ========================================
-- 4. 外部キー制約の確認
-- ========================================
SELECT
    tc.constraint_name as "制約名",
    kcu.column_name as "参照元カラム",
    ccu.table_name AS "参照先テーブル",
    ccu.column_name AS "参照先カラム"
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'swipes'
    AND kcu.column_name = 'product_id';

-- ========================================
-- 5. IDのパターン分析
-- ========================================
SELECT 
    CASE 
        WHEN id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN 'UUID形式'
        WHEN id LIKE '%_%_%' THEN 'アンダースコア2つ以上（新形式）'
        WHEN id LIKE '%_%' THEN 'アンダースコア1つ'
        WHEN id ~ '^[0-9]+$' THEN '数値のみ'
        ELSE 'その他'
    END as "IDパターン",
    COUNT(*) as "件数",
    MIN(created_at) as "最古の日時",
    MAX(created_at) as "最新の日時"
FROM external_products
GROUP BY 1
ORDER BY 2 DESC;

-- ========================================
-- 6. 最新の商品10件のID形式
-- ========================================
SELECT 
    id,
    source_brand,
    title,
    created_at
FROM external_products
ORDER BY created_at DESC
LIMIT 10;

-- ========================================
-- 7. ユニーク制約の確認
-- ========================================
SELECT 
    kcu.column_name as "ユニークカラム",
    tc.constraint_name as "制約名"
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
WHERE tc.table_name = 'external_products'
AND tc.constraint_type = 'UNIQUE';

-- ========================================
-- 8. インデックス情報
-- ========================================
SELECT 
    indexname as "インデックス名",
    indexdef as "インデックス定義"
FROM pg_indexes
WHERE tablename = 'external_products';
