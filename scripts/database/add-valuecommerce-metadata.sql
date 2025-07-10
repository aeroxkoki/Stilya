-- バリューコマースAPI対応：metadataカラムの追加
-- external_productsテーブルにメタデータ格納用のJSONBカラムを追加

-- metadataカラムの追加（adTag等を格納）
ALTER TABLE external_products 
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}';

-- metadataのインデックスを作成（merchant_idでの検索用）
CREATE INDEX IF NOT EXISTS idx_external_products_metadata_merchant 
ON external_products ((metadata->>'merchant_id')) 
WHERE metadata IS NOT NULL;

-- sourceでのインデックス（バリューコマース商品の検索用）
CREATE INDEX IF NOT EXISTS idx_external_products_source 
ON external_products (source) 
WHERE source = 'valuecommerce';

-- 既存データの確認
SELECT 
    source,
    COUNT(*) as product_count,
    COUNT(CASE WHEN metadata IS NOT NULL AND metadata != '{}' THEN 1 END) as with_metadata
FROM external_products
GROUP BY source
ORDER BY product_count DESC;

-- コメント追加
COMMENT ON COLUMN external_products.metadata IS 'APIごとの追加情報（バリューコマースのadTag等）';
