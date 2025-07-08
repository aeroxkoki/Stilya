-- パフォーマンス最適化のためのインデックス

-- 複合インデックスの作成
CREATE INDEX IF NOT EXISTS idx_swipes_user_result_created 
ON swipes(user_id, result, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_external_products_active_created 
ON external_products(is_active, created_at DESC) 
WHERE is_active = true;

-- 部分インデックス（アクティブな商品のみ）
CREATE INDEX IF NOT EXISTS idx_external_products_tags_active 
ON external_products USING GIN(tags) 
WHERE is_active = true;

-- user_preference_analysisテーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_user_preference_analysis_updated 
ON user_preference_analysis(user_id, last_analyzed_at DESC);

-- recommendation_effectivenessテーブルのインデックス
CREATE INDEX IF NOT EXISTS idx_recommendation_effectiveness_created 
ON recommendation_effectiveness(created_at DESC);

-- マテリアライズドビューのリフレッシュ（存在する場合）
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_matviews WHERE matviewname = 'mv_product_popularity') THEN
    REFRESH MATERIALIZED VIEW CONCURRENTLY mv_product_popularity;
  END IF;
END $$;
