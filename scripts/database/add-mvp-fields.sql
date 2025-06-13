-- MVP戦略対応：priorityとsource_brandフィールドの追加
-- 既存のexternal_productsテーブルにMVP戦略用のカラムを追加

-- priorityカラムの追加（ブランドの優先度：1が最高）
ALTER TABLE external_products 
ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 999;

-- source_brandカラムの追加（ブランド名の正規化版）
ALTER TABLE external_products 
ADD COLUMN IF NOT EXISTS source_brand VARCHAR(255);

-- priorityのインデックスを作成（検索性能向上）
CREATE INDEX IF NOT EXISTS idx_external_products_priority 
ON external_products (priority, last_synced DESC);

-- source_brandのインデックスを作成
CREATE INDEX IF NOT EXISTS idx_external_products_source_brand 
ON external_products (source_brand);

-- 既存データのpriorityを更新（MVPブランド）
UPDATE external_products 
SET priority = CASE 
    WHEN brand IN ('UNIQLO', 'ユニクロ') THEN 1
    WHEN brand IN ('GU', 'ジーユー') THEN 1
    WHEN brand IN ('coca', 'コカ') THEN 2
    WHEN brand IN ('pierrot', 'ピエロ') THEN 2
    WHEN brand IN ('URBAN RESEARCH', 'アーバンリサーチ') THEN 3
    WHEN brand IN ('BEAMS', 'ビームス') THEN 3
    WHEN brand IN ('SHIPS', 'シップス') THEN 3
    ELSE 999
END
WHERE priority IS NULL OR priority = 999;

-- source_brandを正規化して更新
UPDATE external_products
SET source_brand = LOWER(REPLACE(brand, ' ', '_'))
WHERE source_brand IS NULL;

-- 統計情報を確認
SELECT 
    brand,
    priority,
    COUNT(*) as product_count
FROM external_products
WHERE is_active = true
GROUP BY brand, priority
ORDER BY priority, product_count DESC
LIMIT 20;