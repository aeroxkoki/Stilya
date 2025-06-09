-- Stilya本番環境用RLSポリシー設定
-- このスクリプトは本番環境で適切なセキュリティを確保します

-- 1. 既存のポリシーをクリア
DROP POLICY IF EXISTS "Allow read access to all users" ON external_products;
DROP POLICY IF EXISTS "Allow public read access" ON external_products;
DROP POLICY IF EXISTS "Users can view all products" ON external_products;
DROP POLICY IF EXISTS "Service role can insert products" ON external_products;
DROP POLICY IF EXISTS "Service role can update products" ON external_products;
DROP POLICY IF EXISTS "Service role can delete products" ON external_products;

-- 2. RLSを有効化（重要）
ALTER TABLE external_products ENABLE ROW LEVEL SECURITY;

-- 3. 本番用読み取りポリシー（全ユーザーがアクティブな商品を読める）
CREATE POLICY "Anyone can read active products" 
ON external_products 
FOR SELECT 
USING (
  is_active = true 
  AND last_synced > NOW() - INTERVAL '30 days'
);

-- 4. サービスロール用フルアクセスポリシー
CREATE POLICY "Service role has full access" 
ON external_products 
FOR ALL 
USING (
  auth.uid() IS NOT NULL 
  AND auth.jwt() ->> 'role' = 'service_role'
)
WITH CHECK (
  auth.uid() IS NOT NULL 
  AND auth.jwt() ->> 'role' = 'service_role'
);

-- 5. パフォーマンス向上のためのインデックス
CREATE INDEX IF NOT EXISTS idx_external_products_active_synced 
ON external_products(is_active, last_synced DESC);

CREATE INDEX IF NOT EXISTS idx_external_products_category_active 
ON external_products(category, is_active);

CREATE INDEX IF NOT EXISTS idx_external_products_source_active 
ON external_products(source, is_active);

-- 6. 統計情報の更新
ANALYZE external_products;

-- 7. 現在のポリシーを確認
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'external_products'
ORDER BY policyname;

-- 8. アクティブな商品数を確認
SELECT 
  COUNT(*) as total_products,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_products,
  COUNT(DISTINCT category) as categories,
  COUNT(DISTINCT source) as sources
FROM external_products;

/*
注意事項:
1. このスクリプトを実行する前に、サービスロールキーが正しく設定されていることを確認
2. 本番環境では必ずRLSを有効化すること
3. サービスロールキーは環境変数で厳重に管理すること
4. 定期的にポリシーの監査を実施すること
*/
