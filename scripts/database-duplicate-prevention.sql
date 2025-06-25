-- Supabase SQLエディタで実行するSQL

-- 1. 重複商品の確認ビューを作成
CREATE OR REPLACE VIEW duplicate_products_view AS
SELECT 
  LOWER(TRIM(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
    title, '【', ''), '】', ''), '[', ''), ']', ''), '（', ''), '）', '')
  )) as normalized_title,
  COUNT(*) as duplicate_count,
  array_agg(id ORDER BY created_at DESC) as product_ids,
  array_agg(title ORDER BY created_at DESC) as titles,
  array_agg(price ORDER BY created_at DESC) as prices,
  array_agg(brand ORDER BY created_at DESC) as brands,
  array_agg(is_active ORDER BY created_at DESC) as active_status
FROM external_products
WHERE is_active = true
GROUP BY normalized_title
HAVING COUNT(*) > 1
ORDER BY duplicate_count DESC;

-- 2. 重複商品を無効化（価格なしの商品を優先的に無効化）
WITH duplicates AS (
  SELECT 
    id,
    title,
    price,
    ROW_NUMBER() OVER (
      PARTITION BY LOWER(TRIM(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        title, '【', ''), '】', ''), '[', ''), ']', ''), '（', ''), '）', '')
      ))
      ORDER BY 
        CASE WHEN price IS NOT NULL AND price > 0 THEN 0 ELSE 1 END,
        created_at DESC
    ) as rn
  FROM external_products
  WHERE is_active = true
)
UPDATE external_products
SET is_active = false
WHERE id IN (
  SELECT id FROM duplicates WHERE rn > 1
);

-- 3. インデックスの作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_products_normalized_title 
ON external_products (LOWER(TRIM(title)));

CREATE INDEX IF NOT EXISTS idx_products_active_title_brand 
ON external_products (is_active, title, brand);

-- 4. トリガー関数：新規商品挿入時の重複チェック
CREATE OR REPLACE FUNCTION check_product_duplicate()
RETURNS TRIGGER AS $$
DECLARE
  normalized_title TEXT;
  existing_count INTEGER;
BEGIN
  -- タイトルの正規化
  normalized_title := LOWER(TRIM(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
    NEW.title, '【', ''), '】', ''), '[', ''), ']', ''), '（', ''), '）', '')
  ));
  
  -- 既存の同じタイトルの商品をカウント
  SELECT COUNT(*) INTO existing_count
  FROM external_products
  WHERE is_active = true
    AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000')
    AND LOWER(TRIM(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
      title, '【', ''), '】', ''), '[', ''), ']', ''), '（', ''), '）', '')
    )) = normalized_title
    AND COALESCE(brand, '') = COALESCE(NEW.brand, '');
  
  -- 重複が存在し、新規商品に価格がない場合は挿入を防ぐ
  IF existing_count > 0 AND (NEW.price IS NULL OR NEW.price = 0) THEN
    -- 既存商品に価格があるかチェック
    PERFORM 1
    FROM external_products
    WHERE is_active = true
      AND LOWER(TRIM(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(REPLACE(
        title, '【', ''), '】', ''), '[', ''), ']', ''), '（', ''), '）', '')
      )) = normalized_title
      AND price IS NOT NULL AND price > 0
    LIMIT 1;
    
    IF FOUND THEN
      -- 価格がある商品が既に存在するので、価格なしの商品は追加しない
      NEW.is_active := false;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. トリガーの作成
DROP TRIGGER IF EXISTS check_product_duplicate_trigger ON external_products;
CREATE TRIGGER check_product_duplicate_trigger
BEFORE INSERT OR UPDATE ON external_products
FOR EACH ROW
EXECUTE FUNCTION check_product_duplicate();

-- 6. 統計情報の更新
ANALYZE external_products;
