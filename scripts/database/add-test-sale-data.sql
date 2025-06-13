-- Phase 1 テスト用セール商品データ
-- 既存の商品の一部にセール情報を追加

-- ランダムに20%の商品をセール対象にする
UPDATE external_products
SET 
  original_price = price * 1.3,  -- 元の価格を30%高く設定
  is_sale = true,
  discount_percentage = 30,
  rating = 3.5 + (RANDOM() * 1.5),  -- 3.5〜5.0のランダム評価
  review_count = FLOOR(RANDOM() * 100 + 1)  -- 1〜100のランダムレビュー数
WHERE id IN (
  SELECT id 
  FROM external_products 
  ORDER BY RANDOM() 
  LIMIT (SELECT COUNT(*) * 0.2 FROM external_products)
);

-- 特定のブランドの商品に高評価を設定（テスト用）
UPDATE external_products
SET 
  rating = 4.5 + (RANDOM() * 0.5),  -- 4.5〜5.0の高評価
  review_count = FLOOR(RANDOM() * 500 + 100)  -- 100〜600のレビュー数
WHERE brand IN ('UNIQLO', 'ZARA', 'GU')
AND rating IS NULL;

-- セール情報の確認
SELECT 
  brand,
  COUNT(*) as total_products,
  COUNT(CASE WHEN is_sale = true THEN 1 END) as sale_products,
  AVG(discount_percentage) as avg_discount,
  AVG(rating) as avg_rating,
  AVG(review_count) as avg_reviews
FROM external_products
GROUP BY brand
ORDER BY total_products DESC
LIMIT 10;
