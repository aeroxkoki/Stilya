-- Stilya 価格帯タグ統一化スクリプト
-- 「プチプラ」タグを「お手頃」に統一
-- 実行前に必ずバックアップを取ってください

-- 現在の状況確認
SELECT 
    '「プチプラ」タグを持つ商品数' as description,
    COUNT(*) as count 
FROM external_products 
WHERE 'プチプラ' = ANY(tags);

SELECT 
    '「お手頃」タグを持つ商品数' as description,
    COUNT(*) as count 
FROM external_products 
WHERE 'お手頃' = ANY(tags);

SELECT 
    '両方のタグを持つ商品数' as description,
    COUNT(*) as count 
FROM external_products 
WHERE 'プチプラ' = ANY(tags) AND 'お手頃' = ANY(tags);

-- タグの更新（トランザクション内で実行）
BEGIN;

-- 更新対象の確認（実行前に必ず確認）
SELECT 
    id, 
    title, 
    tags,
    price
FROM external_products 
WHERE 'プチプラ' = ANY(tags) 
LIMIT 10;

-- プチプラタグを削除（既にお手頃タグがある商品から）
UPDATE external_products
SET 
    tags = array_remove(tags, 'プチプラ'),
    updated_at = now()
WHERE 'プチプラ' = ANY(tags) AND 'お手頃' = ANY(tags);

-- プチプラタグをお手頃に置換（お手頃タグがない商品）
UPDATE external_products
SET 
    tags = array_replace(tags, 'プチプラ', 'お手頃'),
    updated_at = now()
WHERE 'プチプラ' = ANY(tags) AND NOT ('お手頃' = ANY(tags));

-- 更新結果の確認
SELECT 
    '更新後：「プチプラ」タグを持つ商品数' as description,
    COUNT(*) as count 
FROM external_products 
WHERE 'プチプラ' = ANY(tags);

SELECT 
    '更新後：「お手頃」タグを持つ商品数' as description,
    COUNT(*) as count 
FROM external_products 
WHERE 'お手頃' = ANY(tags);

-- 問題なければCOMMIT、問題があればROLLBACK
-- COMMIT;
-- ROLLBACK;
