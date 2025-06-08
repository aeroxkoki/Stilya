-- external_productsテーブルのRLSポリシー設定
-- このスクリプトは、商品データの読み書きを可能にするRLSポリシーを設定します

-- まず既存のポリシーを削除
DROP POLICY IF EXISTS "Enable read access for all users" ON external_products;
DROP POLICY IF EXISTS "Enable insert for service role" ON external_products;
DROP POLICY IF EXISTS "Enable update for service role" ON external_products;
DROP POLICY IF EXISTS "Enable delete for service role" ON external_products;

-- RLSを有効化（まだ有効化されていない場合）
ALTER TABLE external_products ENABLE ROW LEVEL SECURITY;

-- 読み取り専用ポリシー（全てのユーザーが商品を閲覧可能）
CREATE POLICY "Enable read access for all users" 
ON external_products FOR SELECT 
USING (is_active = true);

-- サービスロールのみ挿入可能
CREATE POLICY "Enable insert for service role" 
ON external_products FOR INSERT 
WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'postgres');

-- サービスロールのみ更新可能
CREATE POLICY "Enable update for service role" 
ON external_products FOR UPDATE 
USING (auth.role() = 'service_role' OR auth.role() = 'postgres')
WITH CHECK (auth.role() = 'service_role' OR auth.role() = 'postgres');

-- サービスロールのみ削除可能
CREATE POLICY "Enable delete for service role" 
ON external_products FOR DELETE 
USING (auth.role() = 'service_role' OR auth.role() = 'postgres');

-- インデックスの追加（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_external_products_is_active ON external_products(is_active);
CREATE INDEX IF NOT EXISTS idx_external_products_category ON external_products(category);
CREATE INDEX IF NOT EXISTS idx_external_products_genre_id ON external_products(genre_id);
CREATE INDEX IF NOT EXISTS idx_external_products_last_synced ON external_products(last_synced);

-- 確認用クエリ
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
WHERE tablename = 'external_products';
