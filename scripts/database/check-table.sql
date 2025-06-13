-- external_productsテーブルの存在確認
SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'external_products'
);

-- テーブルが存在しない場合は、以下のSQLを実行
-- （既に存在する場合はスキップ）