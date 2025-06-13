-- Supabase内のデータ保持状況を確認するSQL
-- Supabase DashboardのSQL Editorで実行してください

-- 1. external_productsテーブルの件数
SELECT COUNT(*) as total_count FROM external_products;

-- 2. 最古のデータと最新のデータの日付
SELECT 
    MIN(created_at) as oldest_data,
    MAX(created_at) as newest_data,
    MIN(last_synced) as oldest_sync,
    MAX(last_synced) as newest_sync
FROM external_products;

-- 3. データソース別の件数
SELECT 
    source,
    COUNT(*) as count,
    MIN(created_at) as oldest_created,
    MAX(created_at) as newest_created
FROM external_products
GROUP BY source;

-- 4. 日別のデータ追加状況（直近7日間）
SELECT 
    DATE(created_at) as date,
    COUNT(*) as count
FROM external_products
WHERE created_at >= CURRENT_DATE - INTERVAL '7 days'
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- 5. アクティブ/非アクティブの内訳
SELECT 
    is_active,
    COUNT(*) as count
FROM external_products
GROUP BY is_active;

-- 6. 最後の同期からの経過時間
SELECT 
    COUNT(*) as count,
    CASE 
        WHEN last_synced >= NOW() - INTERVAL '1 day' THEN '1日以内'
        WHEN last_synced >= NOW() - INTERVAL '7 days' THEN '1週間以内'
        WHEN last_synced >= NOW() - INTERVAL '30 days' THEN '1ヶ月以内'
        ELSE '1ヶ月以上前'
    END as sync_age
FROM external_products
GROUP BY sync_age
ORDER BY sync_age;
