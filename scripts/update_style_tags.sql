-- Stilya スタイルタグ統一化スクリプト
-- 「きれいめ」タグを「クラシック」に更新
-- 実行前に必ずバックアップを取ってください

-- 現在の状況確認
SELECT 
    '「きれいめ」タグを持つ商品数' as description,
    COUNT(*) as count 
FROM external_products 
WHERE 'きれいめ' = ANY(tags);

SELECT 
    '「クラシック」タグを持つ商品数' as description,
    COUNT(*) as count 
FROM external_products 
WHERE 'クラシック' = ANY(tags);

-- タグの更新（トランザクション内で実行）
BEGIN;

-- 更新対象の確認（実行前に必ず確認）
SELECT 
    id, 
    title, 
    tags 
FROM external_products 
WHERE 'きれいめ' = ANY(tags) 
LIMIT 10;

-- タグの更新
UPDATE external_products
SET 
    tags = array_replace(tags, 'きれいめ', 'クラシック'),
    updated_at = now()
WHERE 'きれいめ' = ANY(tags);

-- 更新結果の確認
SELECT 
    '更新後：「きれいめ」タグを持つ商品数' as description,
    COUNT(*) as count 
FROM external_products 
WHERE 'きれいめ' = ANY(tags);

SELECT 
    '更新後：「クラシック」タグを持つ商品数' as description,
    COUNT(*) as count 
FROM external_products 
WHERE 'クラシック' = ANY(tags);

-- 問題なければCOMMIT、問題があればROLLBACK
-- COMMIT;
-- ROLLBACK;
