-- =====================================================
-- Stilya データベーススキーマ統一移行スクリプト
-- 目的: products/external_productsの統一
-- =====================================================

-- 1. まず既存データのバックアップ（念のため）
-- =====================================================
CREATE TABLE IF NOT EXISTS swipes_backup AS 
SELECT * FROM swipes;

-- 2. swipesテーブルのproduct_idカラムの型をUUIDからTEXTに変更
-- =====================================================
-- 外部キー制約を一時的に削除
ALTER TABLE swipes 
DROP CONSTRAINT IF EXISTS swipes_product_id_fkey;

-- favoritesテーブルの外部キー制約も削除
ALTER TABLE favorites 
DROP CONSTRAINT IF EXISTS favorites_product_id_fkey;

-- click_logsテーブルの外部キー制約も削除  
ALTER TABLE click_logs
DROP CONSTRAINT IF EXISTS click_logs_product_id_fkey;

-- 3. 既存のproductsテーブルのデータをexternal_productsに移行
-- =====================================================
-- まず、productsテーブルが存在し、データがある場合のみ移行
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
        -- productsのデータをexternal_productsに挿入（重複を避ける）
        INSERT INTO external_products (
            id, title, price, brand, image_url, 
            description, tags, category, affiliate_url, 
            source, is_active, created_at
        )
        SELECT 
            id::TEXT,  -- UUIDをTEXTに変換
            title,
            price::INTEGER,  -- NUMERICをINTEGERに変換
            brand,
            image_url,
            '', -- descriptionは空文字
            tags,
            category,
            affiliate_url,
            'legacy_products', -- sourceを識別
            true, -- is_active
            created_at
        FROM products
        ON CONFLICT (id) DO NOTHING;
    END IF;
END $$;

-- 4. カラムの型を変更
-- =====================================================
-- swipesテーブルのproduct_idをTEXT型に変更
ALTER TABLE swipes 
ALTER COLUMN product_id TYPE TEXT USING product_id::TEXT;

-- favoritesテーブルのproduct_idをTEXT型に変更
ALTER TABLE favorites 
ALTER COLUMN product_id TYPE TEXT USING product_id::TEXT;

-- click_logsテーブルのproduct_idをTEXT型に変更
ALTER TABLE click_logs 
ALTER COLUMN product_id TYPE TEXT USING product_id::TEXT;

-- 5. 新しい外部キー制約を追加
-- =====================================================
-- swipesテーブル
ALTER TABLE swipes 
ADD CONSTRAINT swipes_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES external_products(id) 
ON DELETE CASCADE;

-- favoritesテーブル
ALTER TABLE favorites 
ADD CONSTRAINT favorites_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES external_products(id) 
ON DELETE CASCADE;

-- click_logsテーブル
ALTER TABLE click_logs 
ADD CONSTRAINT click_logs_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES external_products(id) 
ON DELETE CASCADE;

-- 6. 古いproductsテーブルを削除
-- =====================================================
DROP TABLE IF EXISTS products CASCADE;

-- 7. RLSポリシーを更新（必要に応じて）
-- =====================================================
-- swipesテーブルのポリシー
DROP POLICY IF EXISTS "Users can view own swipes" ON swipes;
DROP POLICY IF EXISTS "Users can insert own swipes" ON swipes;

CREATE POLICY "Users can view own swipes" ON swipes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own swipes" ON swipes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- favoritesテーブルのポリシー
DROP POLICY IF EXISTS "Users can view own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can insert own favorites" ON favorites;
DROP POLICY IF EXISTS "Users can delete own favorites" ON favorites;

CREATE POLICY "Users can view own favorites" ON favorites
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own favorites" ON favorites
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own favorites" ON favorites
    FOR DELETE USING (auth.uid() = user_id);

-- 8. 統計情報の更新
-- =====================================================
ANALYZE swipes;
ANALYZE favorites;
ANALYZE click_logs;
ANALYZE external_products;

-- 9. 移行完了の確認
-- =====================================================
DO $$
DECLARE
    swipes_count INTEGER;
    favorites_count INTEGER;
    external_products_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO swipes_count FROM swipes;
    SELECT COUNT(*) INTO favorites_count FROM favorites;
    SELECT COUNT(*) INTO external_products_count FROM external_products;
    
    RAISE NOTICE 'Migration completed successfully!';
    RAISE NOTICE 'Swipes count: %', swipes_count;
    RAISE NOTICE 'Favorites count: %', favorites_count;
    RAISE NOTICE 'External products count: %', external_products_count;
END $$;

-- 注意: バックアップテーブルは手動で削除してください
-- DROP TABLE swipes_backup;
