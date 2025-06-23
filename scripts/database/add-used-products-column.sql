-- 中古品フィルター機能のためのカラム追加
-- external_productsテーブルにis_usedカラムを追加

-- is_usedカラムの追加（中古品フラグ）
ALTER TABLE external_products 
ADD COLUMN IF NOT EXISTS is_used BOOLEAN DEFAULT false;

-- パフォーマンス向上のためのインデックス作成
CREATE INDEX IF NOT EXISTS idx_external_products_is_used 
ON external_products (is_used);

-- 既存データの更新（商品名とショップ名から中古品を判定）
UPDATE external_products
SET is_used = true
WHERE is_used = false
  AND (
    -- タイトルに中古関連キーワードが含まれる
    LOWER(title) LIKE '%中古%'
    OR LOWER(title) LIKE '%used%'
    OR LOWER(title) LIKE '%ユーズド%'
    OR LOWER(title) LIKE '%セカンドハンド%'
    OR LOWER(title) LIKE '%リユース%'
    -- ブランド/ショップ名に中古専門店が含まれる
    OR LOWER(brand) LIKE '%セカンドストリート%'
    OR LOWER(brand) LIKE '%メルカリ%'
    OR LOWER(brand) LIKE '%ラクマ%'
    OR LOWER(brand) LIKE '%2nd street%'
    OR LOWER(brand) LIKE '%リサイクル%'
  );

-- 統計情報を確認
SELECT 
    COUNT(*) as total_products,
    COUNT(CASE WHEN is_used = true THEN 1 END) as used_products,
    COUNT(CASE WHEN is_used = false THEN 1 END) as new_products,
    ROUND(COUNT(CASE WHEN is_used = true THEN 1 END)::numeric / COUNT(*)::numeric * 100, 2) as used_percentage
FROM external_products
WHERE is_active = true;
