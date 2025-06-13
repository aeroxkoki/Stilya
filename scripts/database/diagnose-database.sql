-- ====================================
-- Stilya データベース診断スクリプト
-- ====================================

-- 1. テーブルの存在確認
SELECT 
  'external_products' as table_name,
  EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_name = 'external_products'
  ) as exists;

-- 2. external_productsテーブルのデータ件数
SELECT 
  COUNT(*) as total_products,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_products,
  COUNT(CASE WHEN is_active = false THEN 1 END) as inactive_products
FROM external_products;

-- 3. カテゴリ別の商品数
SELECT 
  category,
  COUNT(*) as count
FROM external_products
WHERE is_active = true
GROUP BY category
ORDER BY count DESC;

-- 4. 最新の商品を確認
SELECT 
  id,
  title,
  price,
  category,
  is_active,
  created_at
FROM external_products
ORDER BY created_at DESC
LIMIT 5;

-- 5. RLSの状態確認
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename = 'external_products';

-- 6. RLSポリシーの確認
SELECT 
  polname as policy_name,
  polcmd as command,
  polroles::regrole[] as roles
FROM pg_policy
WHERE polrelid = 'external_products'::regclass;
