-- Supabase無料枠最適化 & 画像品質対応
-- external_productsテーブルへのカラム追加

-- 画像品質関連のカラムを追加
ALTER TABLE external_products 
ADD COLUMN IF NOT EXISTS has_large_image BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS image_quality VARCHAR(10) DEFAULT 'medium' CHECK (image_quality IN ('low', 'medium', 'high'));

-- インデックスの最適化（無料枠のパフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_products_active_score ON external_products(is_active, recommendation_score DESC) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_products_brand_active ON external_products(source_brand, is_active) 
WHERE is_active = true;

CREATE INDEX IF NOT EXISTS idx_products_quality ON external_products(image_quality, review_count DESC) 
WHERE is_active = true;

-- 不要なインデックスの削除（無料枠の容量節約）
DROP INDEX IF EXISTS idx_products_created_at;

-- 統計情報を更新
ANALYZE external_products;

-- 現在の容量使用状況を確認
SELECT 
  COUNT(*) as total_rows,
  COUNT(*) FILTER (WHERE is_active = true) as active_rows,
  COUNT(*) FILTER (WHERE has_large_image = true) as high_quality_images,
  pg_size_pretty(pg_relation_size('external_products')) as table_size,
  pg_size_pretty(pg_total_relation_size('external_products')) as total_size_with_indexes
FROM external_products;
