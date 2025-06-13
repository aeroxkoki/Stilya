-- 1. external_productsテーブルの存在確認
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name = 'external_products';

-- 2. テーブルが存在する場合、現在の商品数を確認
SELECT COUNT(*) as current_products 
FROM external_products 
WHERE is_active = true;

-- 3. テーブルの構造を確認
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'external_products'
ORDER BY ordinal_position;
