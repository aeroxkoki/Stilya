-- ====================================
-- RLSポリシー修正スクリプト
-- ====================================

-- 1. 現在のRLS状態を確認
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename = 'external_products';

-- 2. 既存のポリシーを削除
DROP POLICY IF EXISTS "Allow read access to all users" ON external_products;
DROP POLICY IF EXISTS "Allow insert/update for service role only" ON external_products;

-- 3. 新しいポリシーを作成
-- 認証されたユーザーは全ての有効な商品を読み取り可能
CREATE POLICY "Allow authenticated users to read active products" 
ON external_products
FOR SELECT
TO authenticated
USING (is_active = true);

-- サービスロールは全ての操作が可能
CREATE POLICY "Allow service role full access" 
ON external_products
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- 4. RLSが有効であることを確認
ALTER TABLE external_products ENABLE ROW LEVEL SECURITY;

-- === オプション: テスト用にRLSを一時的に無効化 ===
-- 注意: これはテスト環境でのみ使用してください
-- ALTER TABLE external_products DISABLE ROW LEVEL SECURITY;

-- 5. 設定の確認
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'external_products';
