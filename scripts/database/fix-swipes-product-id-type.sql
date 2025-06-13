-- swipesテーブルのproduct_idをUUID型からTEXT型に変更
-- （楽天商品IDなどのTEXT形式に対応）

-- 1. 外部キー制約を一時的に削除
ALTER TABLE swipes 
DROP CONSTRAINT IF EXISTS swipes_product_id_fkey;

-- 2. product_idカラムの型をTEXTに変更
ALTER TABLE swipes 
ALTER COLUMN product_id TYPE TEXT;

-- 3. 新しい外部キー制約を追加（external_productsテーブルを参照）
ALTER TABLE swipes 
ADD CONSTRAINT swipes_product_id_fkey 
FOREIGN KEY (product_id) 
REFERENCES external_products(id) 
ON DELETE CASCADE;

-- 4. インデックスを再作成
DROP INDEX IF EXISTS idx_swipes_product_id;
CREATE INDEX idx_swipes_product_id ON swipes(product_id);

-- 5. 確認メッセージ
DO $$
BEGIN
    RAISE NOTICE 'swipesテーブルのproduct_idカラムがTEXT型に変更されました';
END $$;
