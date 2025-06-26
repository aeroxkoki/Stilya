-- unified-phase3-sync-hq.js 動作確認用クエリ

-- 1. 最新の楽天商品を確認（rakuten_で始まるID）
SELECT 
    id,
    source_brand,
    title,
    created_at
FROM external_products
WHERE id LIKE 'rakuten_%'
ORDER BY created_at DESC
LIMIT 10;

-- 2. source_brandごとの商品数
SELECT 
    source_brand,
    COUNT(*) as product_count,
    MAX(created_at) as latest_sync
FROM external_products
WHERE source_brand IS NOT NULL
GROUP BY source_brand
ORDER BY latest_sync DESC
LIMIT 20;

-- 3. 今日追加された商品の確認
SELECT 
    COUNT(*) as today_products,
    COUNT(DISTINCT source_brand) as brands_synced
FROM external_products
WHERE created_at >= CURRENT_DATE;

-- 4. ID形式の分布（詳細版）
SELECT 
    CASE 
        WHEN id LIKE 'rakuten_%' THEN 'rakuten（新形式）'
        WHEN id LIKE 'locondo:%' THEN 'locondo'
        WHEN id LIKE '0101marui:%' THEN '0101marui'
        WHEN id LIKE 'test-%' THEN 'テストデータ'
        ELSE 'その他'
    END as "IDソース",
    COUNT(*) as "件数",
    MAX(created_at) as "最新追加日"
FROM external_products
GROUP BY 1
ORDER BY 2 DESC;
