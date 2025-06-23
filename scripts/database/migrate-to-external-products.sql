-- Stilya データベーススキーマ統一化スクリプト
-- productsテーブルからexternal_productsテーブルへの完全移行

-- ========================================
-- STEP 1: 現在の状況を診断
-- ========================================

-- 1.1 問題のあるスワイプデータを特定
SELECT 
    'UUID形式の古いスワイプデータ' as issue,
    COUNT(*) as count
FROM swipes
WHERE product_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- 1.2 external_productsに存在しないスワイプデータを確認
SELECT 
    'external_productsに存在しないスワイプ' as issue,
    COUNT(*) as count
FROM swipes s
LEFT JOIN external_products ep ON s.product_id = ep.id
WHERE ep.id IS NULL;

-- ========================================
-- STEP 2: 問題のあるデータをクリーンアップ
-- ========================================

-- 2.1 UUID形式（productsテーブル）のスワイプデータを削除
DELETE FROM swipes
WHERE product_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- 2.2 external_productsに存在しないスワイプデータを削除
DELETE FROM swipes
WHERE product_id NOT IN (
    SELECT id FROM external_products
);

-- ========================================
-- STEP 3: 外部キー制約を再確認・強化
-- ========================================

-- 3.1 既存の制約を確認
SELECT
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name = 'swipes'
    AND kcu.column_name = 'product_id';

-- 3.2 制約が存在しない場合は再作成
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'swipes_product_id_fkey'
    ) THEN
        ALTER TABLE swipes 
        ADD CONSTRAINT swipes_product_id_fkey 
        FOREIGN KEY (product_id) 
        REFERENCES external_products(id) 
        ON DELETE CASCADE;
    END IF;
END $$;

-- ========================================
-- STEP 4: productsテーブルの使用を完全に停止
-- ========================================

-- 4.1 productsテーブルへのアクセス権限を削除
REVOKE ALL ON products FROM PUBLIC;

-- 4.2 productsテーブルをリネーム（削除せずに保存）
ALTER TABLE IF EXISTS products RENAME TO products_deprecated;

-- ========================================
-- STEP 5: favoritesテーブルも同様に修正
-- ========================================

-- 5.1 外部キー制約を削除
ALTER TABLE favorites 
DROP CONSTRAINT IF EXISTS favorites_product_id_fkey;

-- 5.2 UUID形式のお気に入りデータを削除
DELETE FROM favorites
WHERE product_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- 5.3 product_idカラムの型をTEXTに変更（もしまだUUIDの場合）
DO $$
BEGIN
    -- カラムの型を確認
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'favorites'
        AND column_name = 'product_id'
        AND data_type = 'uuid'
    ) THEN
        ALTER TABLE favorites 
        ALTER COLUMN product_id TYPE TEXT USING product_id::text;
    END IF;
END $$;

-- 5.4 新しい外部キー制約を追加
ALTER TABLE favorites 
ADD CONSTRAINT favorites_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES external_products(id) 
ON DELETE CASCADE;

-- ========================================
-- STEP 6: click_logsテーブルも同様に修正
-- ========================================

-- 6.1 外部キー制約を削除
ALTER TABLE click_logs 
DROP CONSTRAINT IF EXISTS click_logs_product_id_fkey;

-- 6.2 UUID形式のクリックログを削除
DELETE FROM click_logs
WHERE product_id::text ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- 6.3 product_idカラムの型をTEXTに変更（もしまだUUIDの場合）
DO $$
BEGIN
    -- カラムの型を確認
    IF EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'click_logs'
        AND column_name = 'product_id'
        AND data_type = 'uuid'
    ) THEN
        ALTER TABLE click_logs 
        ALTER COLUMN product_id TYPE TEXT USING product_id::text;
    END IF;
END $$;

-- 6.4 新しい外部キー制約を追加
ALTER TABLE click_logs 
ADD CONSTRAINT click_logs_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES external_products(id) 
ON DELETE CASCADE;

-- ========================================
-- STEP 7: 確認
-- ========================================

-- 最終的なデータ状態を確認
SELECT 'クリーンアップ完了' as status;

SELECT 
    'swipes' as table_name, 
    COUNT(*) as total_records,
    COUNT(DISTINCT product_id) as unique_products
FROM swipes
UNION ALL
SELECT 
    'favorites' as table_name, 
    COUNT(*) as total_records,
    COUNT(DISTINCT product_id) as unique_products
FROM favorites
UNION ALL
SELECT 
    'click_logs' as table_name, 
    COUNT(*) as total_records,
    COUNT(DISTINCT product_id) as unique_products
FROM click_logs;

-- external_productsテーブルの確認
SELECT 
    'external_products' as table_name,
    COUNT(*) as total_products,
    COUNT(DISTINCT category) as categories
FROM external_products
WHERE is_active = true;
