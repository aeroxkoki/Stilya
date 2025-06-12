-- Phase 2: external_productsテーブルの拡張
-- 商品スコアリング、季節性、価格帯最適化のための新規カラム追加

-- 既存のexternal_productsテーブルに新しいカラムを追加
ALTER TABLE external_products
ADD COLUMN IF NOT EXISTS shop_name text,
ADD COLUMN IF NOT EXISTS review_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS review_average numeric(3,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS item_update_timestamp timestamp with time zone,
ADD COLUMN IF NOT EXISTS is_seasonal boolean DEFAULT false;

-- インデックスの追加（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_external_products_priority_sync ON external_products(priority, last_synced DESC);
CREATE INDEX IF NOT EXISTS idx_external_products_seasonal ON external_products(is_seasonal, is_active);
CREATE INDEX IF NOT EXISTS idx_external_products_review ON external_products(review_count DESC, review_average DESC);

-- 既存データの更新（is_seasonalフラグの設定）
UPDATE external_products
SET is_seasonal = true
WHERE tags && ARRAY['春', '夏', '秋', '冬', '春夏', '秋冬']
AND is_seasonal IS NULL;

-- user_preferencesテーブルの作成（将来の拡張用）
CREATE TABLE IF NOT EXISTS user_preferences (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  price_range_min numeric(10,2) DEFAULT 2000,
  price_range_max numeric(10,2) DEFAULT 20000,
  price_range_average numeric(10,2) DEFAULT 8000,
  price_distribution_budget numeric(3,2) DEFAULT 0.33,
  price_distribution_mid numeric(3,2) DEFAULT 0.34,
  price_distribution_premium numeric(3,2) DEFAULT 0.33,
  preferred_tags jsonb DEFAULT '[]'::jsonb,
  preferred_brands jsonb DEFAULT '[]'::jsonb,
  last_updated timestamp with time zone DEFAULT timezone('utc'::text, now()),
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- RLSポリシーの設定
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own preferences" ON user_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own preferences" ON user_preferences
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own preferences" ON user_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own preferences" ON user_preferences
  FOR DELETE USING (auth.uid() = user_id);

-- ビューの作成：季節商品の表示用
CREATE OR REPLACE VIEW seasonal_products AS
SELECT *
FROM external_products
WHERE is_active = true
  AND is_seasonal = true
  AND (
    -- 春（3-5月）
    (EXTRACT(MONTH FROM CURRENT_DATE) BETWEEN 3 AND 5 AND tags && ARRAY['春', '春夏'])
    -- 夏（6-8月）
    OR (EXTRACT(MONTH FROM CURRENT_DATE) BETWEEN 6 AND 8 AND tags && ARRAY['夏', '春夏'])
    -- 秋（9-11月）
    OR (EXTRACT(MONTH FROM CURRENT_DATE) BETWEEN 9 AND 11 AND tags && ARRAY['秋', '秋冬'])
    -- 冬（12-2月）
    OR (EXTRACT(MONTH FROM CURRENT_DATE) IN (12, 1, 2) AND tags && ARRAY['冬', '秋冬'])
  );

-- マイグレーション完了メッセージ
DO $$
BEGIN
  RAISE NOTICE 'Phase 2 database migration completed successfully!';
  RAISE NOTICE 'Added columns: shop_name, review_count, review_average, item_update_timestamp, is_seasonal';
  RAISE NOTICE 'Created table: user_preferences';
  RAISE NOTICE 'Created view: seasonal_products';
END $$;
