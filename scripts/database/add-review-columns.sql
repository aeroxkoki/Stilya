-- external_productsテーブルにレビュー関連カラムを追加
-- 既存の同期スクリプトとの整合性を保つため

-- review_countカラムの追加（レビュー数）
ALTER TABLE external_products 
ADD COLUMN IF NOT EXISTS review_count INTEGER DEFAULT 0;

-- review_averageカラムの追加（平均評価）
ALTER TABLE external_products 
ADD COLUMN IF NOT EXISTS review_average NUMERIC(3,2) DEFAULT 0;

-- ratingカラムの追加（評価、review_averageのエイリアス的な用途）
ALTER TABLE external_products 
ADD COLUMN IF NOT EXISTS rating NUMERIC(3,2) DEFAULT 0;

-- レビュー関連のインデックスを作成（品質の高い商品を効率的に検索）
CREATE INDEX IF NOT EXISTS idx_external_products_review_quality 
ON external_products (review_count DESC, review_average DESC) 
WHERE is_active = true AND review_count > 0;

-- 品質スコアのためのインデックス（priority）
CREATE INDEX IF NOT EXISTS idx_external_products_priority_quality 
ON external_products (priority DESC, review_count DESC) 
WHERE is_active = true;

-- 確認クエリ
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'external_products'
AND column_name IN ('review_count', 'review_average', 'rating', 'priority')
ORDER BY ordinal_position;
