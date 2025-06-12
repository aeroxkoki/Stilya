-- external_productsテーブルに新しいカラムを追加
-- is_seasonalカラムの追加（季節商品かどうか）

-- 1. is_seasonalカラムが存在しない場合のみ追加
ALTER TABLE external_products 
ADD COLUMN IF NOT EXISTS is_seasonal BOOLEAN DEFAULT false;

-- 2. インデックスを追加（パフォーマンス向上のため）
CREATE INDEX IF NOT EXISTS idx_external_products_is_seasonal ON external_products(is_seasonal);
CREATE INDEX IF NOT EXISTS idx_external_products_priority ON external_products(priority);
CREATE INDEX IF NOT EXISTS idx_external_products_last_synced ON external_products(last_synced);

-- 3. 既存データのis_seasonalを更新（タグから判定）
UPDATE external_products 
SET is_seasonal = true 
WHERE tags && ARRAY['春', '夏', '秋', '冬', '春夏', '秋冬', 'SS', 'AW']
  AND is_seasonal IS NULL;

-- 4. 更新後の確認
SELECT 
  COUNT(*) as total_products,
  COUNT(CASE WHEN is_seasonal = true THEN 1 END) as seasonal_products,
  COUNT(CASE WHEN is_active = true THEN 1 END) as active_products
FROM external_products;
