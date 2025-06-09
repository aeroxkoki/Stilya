-- Stilya: 楽天APIデータの確認SQL
-- Supabaseダッシュボードの SQL Editor で実行してください

-- 1. 楽天APIから取得したデータの確認
SELECT 
  source,
  COUNT(*) as count,
  MIN(created_at) as oldest_data,
  MAX(last_synced) as latest_sync
FROM external_products
GROUP BY source
ORDER BY count DESC;

-- 2. カテゴリ別の商品数を確認
SELECT 
  category,
  COUNT(*) as count,
  COUNT(CASE WHEN source = 'rakuten' THEN 1 END) as rakuten_count,
  COUNT(CASE WHEN source = 'sample_data' THEN 1 END) as sample_count
FROM external_products
WHERE is_active = true
GROUP BY category
ORDER BY count DESC;

-- 3. 楽天商品の詳細確認（最新10件）
SELECT 
  id,
  title,
  price,
  brand,
  category,
  source,
  created_at,
  last_synced
FROM external_products
WHERE source = 'rakuten'
ORDER BY created_at DESC
LIMIT 10;

-- 4. 全体の統計情報
SELECT 
  COUNT(*) as total_products,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_products,
  COUNT(CASE WHEN source = 'rakuten' THEN 1 END) as rakuten_products,
  COUNT(CASE WHEN source = 'sample_data' THEN 1 END) as sample_products,
  COUNT(DISTINCT category) as categories,
  COUNT(DISTINCT brand) as brands
FROM external_products;

-- 5. 最近同期されたデータの確認
SELECT 
  DATE(last_synced) as sync_date,
  COUNT(*) as count,
  source
FROM external_products
WHERE last_synced > NOW() - INTERVAL '7 days'
GROUP BY DATE(last_synced), source
ORDER BY sync_date DESC;
