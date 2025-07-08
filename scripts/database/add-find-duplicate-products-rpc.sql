-- 重複商品を検出するRPC関数
-- 日次パッチで使用される

CREATE OR REPLACE FUNCTION find_duplicate_products()
RETURNS TABLE(
  id TEXT,
  title TEXT,
  brand TEXT,
  duplicate_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ep.id,
    ep.title,
    ep.brand,
    COUNT(*) OVER (PARTITION BY ep.title, ep.brand) as duplicate_count
  FROM external_products ep
  WHERE ep.is_active = true
  AND EXISTS (
    SELECT 1
    FROM external_products ep2
    WHERE ep2.title = ep.title
    AND ep2.brand = ep.brand
    AND ep2.id != ep.id
    AND ep2.is_active = true
  )
  ORDER BY duplicate_count DESC, ep.title, ep.brand;
END;
$$ LANGUAGE plpgsql;

-- 権限設定
GRANT EXECUTE ON FUNCTION find_duplicate_products() TO authenticated;
GRANT EXECUTE ON FUNCTION find_duplicate_products() TO service_role;

-- テスト実行
SELECT * FROM find_duplicate_products() LIMIT 10;
