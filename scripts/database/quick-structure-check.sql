-- Stilya データベース構造 クイック確認クエリ
-- これは最も重要な確認項目のみを含む簡易版です

-- ========================================
-- 1. 最重要: IDカラムの関係確認
-- ========================================
-- external_productsのID構造を確認
SELECT 
    '=== external_products ID構造 ===' as section,
    id as "idカラムの値",
    product_id as "product_idカラムの値",
    CASE 
        WHEN id = product_id THEN '同じ値'
        ELSE '異なる値'
    END as "ID一致状況",
    title,
    source_brand
FROM external_products
LIMIT 5;

-- プライマリキーの確認
SELECT 
    '=== プライマリキー ===' as section,
    column_name as "プライマリキーカラム"
FROM information_schema.key_column_usage
WHERE table_name = 'external_products'
AND constraint_name = (
    SELECT constraint_name 
    FROM information_schema.table_constraints 
    WHERE table_name = 'external_products' 
    AND constraint_type = 'PRIMARY KEY'
);

-- ========================================
-- 2. 最重要: 外部キー制約の確認
-- ========================================
SELECT
    '=== 外部キー制約 ===' as section,
    'swipes.' || kcu.column_name as "参照元",
    '→',
    ccu.table_name || '.' || ccu.column_name as "参照先"
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'swipes'
    AND kcu.column_name = 'product_id';

-- ========================================
-- 3. データ整合性の簡易チェック
-- ========================================
-- 無効な参照があるか確認
SELECT 
    '=== データ整合性 ===' as section,
    CASE 
        WHEN COUNT(*) = 0 THEN '問題なし: すべてのスワイプが有効な商品を参照'
        ELSE '問題あり: ' || COUNT(*) || '件の無効な参照'
    END as "整合性チェック結果"
FROM swipes s
LEFT JOIN external_products ep ON s.product_id = ep.id
WHERE ep.id IS NULL;

-- ========================================
-- 4. ID形式の確認（最新10件）
-- ========================================
SELECT 
    '=== 最新商品のID形式 ===' as section,
    id,
    product_id,
    source_brand,
    created_at
FROM external_products
ORDER BY created_at DESC
LIMIT 10;
