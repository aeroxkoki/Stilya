-- external_productsテーブルのRLSポリシー設定

-- 既存のポリシーを削除
DROP POLICY IF EXISTS "Enable read access for all users" ON external_products;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON external_products;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON external_products;
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON external_products;

-- RLSを有効化
ALTER TABLE external_products ENABLE ROW LEVEL SECURITY;

-- 読み取りは全員に許可
CREATE POLICY "Enable read access for all users" 
ON external_products FOR SELECT 
USING (true);

-- 挿入は認証されたユーザーに許可（anon keyでも可能）
CREATE POLICY "Enable insert for all users" 
ON external_products FOR INSERT 
WITH CHECK (true);

-- 更新は認証されたユーザーに許可（anon keyでも可能）
CREATE POLICY "Enable update for all users" 
ON external_products FOR UPDATE 
USING (true)
WITH CHECK (true);

-- 削除は無効化（安全のため）
CREATE POLICY "Disable delete for all users" 
ON external_products FOR DELETE 
USING (false);

-- 確認用クエリ
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'external_products';
