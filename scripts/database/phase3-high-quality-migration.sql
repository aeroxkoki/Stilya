-- Phase 3 高画質画像対応のためのテーブル更新
-- metadata カラムを追加して、追加画像やサムネイルなどを保存

-- metadata カラムが存在しない場合のみ追加
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'external_products' 
        AND column_name = 'metadata'
    ) THEN
        ALTER TABLE external_products 
        ADD COLUMN metadata JSONB DEFAULT '{}';
        
        -- metadataカラムにインデックスを追加（検索性能向上）
        CREATE INDEX idx_external_products_metadata ON external_products USING gin(metadata);
        
        RAISE NOTICE 'metadata カラムを追加しました';
    ELSE
        RAISE NOTICE 'metadata カラムは既に存在します';
    END IF;
END $$;

-- 既存データのimage_urlから高画質URLへの変換（オプション）
-- 128x128の画像URLを持つ商品を高画質版に更新
UPDATE external_products
SET image_url = REPLACE(image_url, '/128x128/', '/')
WHERE image_url LIKE '%/128x128/%'
AND is_active = true;

-- 統計情報の更新
ANALYZE external_products;

-- 結果の確認
SELECT 
    COUNT(*) as total_products,
    COUNT(CASE WHEN metadata IS NOT NULL AND metadata != '{}' THEN 1 END) as products_with_metadata,
    COUNT(CASE WHEN image_url LIKE '%/128x128/%' THEN 1 END) as low_quality_images,
    COUNT(CASE WHEN image_url NOT LIKE '%/128x128/%' AND image_url != '' THEN 1 END) as high_quality_images
FROM external_products
WHERE is_active = true;
