-- 保存アイテムテーブルの作成
-- Phase 1: ユーザーが気になる商品を保存する機能

-- テーブルが既に存在する場合は削除しない（データ保護）
CREATE TABLE IF NOT EXISTS saved_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES external_products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- ユーザーごとに同じ商品を一度だけ保存できるように制約を設定
  UNIQUE(user_id, product_id)
);

-- インデックスの作成（パフォーマンス向上）
CREATE INDEX IF NOT EXISTS idx_saved_items_user_id ON saved_items(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_product_id ON saved_items(product_id);
CREATE INDEX IF NOT EXISTS idx_saved_items_created_at ON saved_items(created_at DESC);

-- RLS（Row Level Security）の有効化
ALTER TABLE saved_items ENABLE ROW LEVEL SECURITY;

-- RLSポリシーの作成
-- ユーザーは自分の保存アイテムのみ表示可能
CREATE POLICY "Users can view own saved items" ON saved_items
  FOR SELECT USING (auth.uid() = user_id);

-- ユーザーは自分の保存アイテムを作成可能
CREATE POLICY "Users can insert own saved items" ON saved_items
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ユーザーは自分の保存アイテムを削除可能
CREATE POLICY "Users can delete own saved items" ON saved_items
  FOR DELETE USING (auth.uid() = user_id);

-- サービスロールはすべての操作が可能
CREATE POLICY "Service role has full access" ON saved_items
  USING (auth.jwt()->>'role' = 'service_role');

-- 既存のexternal_productsテーブルにセール情報カラムを追加（存在しない場合のみ）
DO $$ 
BEGIN
  -- original_price カラムの追加
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'external_products' 
                 AND column_name = 'original_price') THEN
    ALTER TABLE external_products ADD COLUMN original_price DECIMAL(10, 2);
  END IF;
  
  -- discount_percentage カラムの追加
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'external_products' 
                 AND column_name = 'discount_percentage') THEN
    ALTER TABLE external_products ADD COLUMN discount_percentage INTEGER;
  END IF;
  
  -- is_sale カラムの追加
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'external_products' 
                 AND column_name = 'is_sale') THEN
    ALTER TABLE external_products ADD COLUMN is_sale BOOLEAN DEFAULT FALSE;
  END IF;
  
  -- rating カラムの追加
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'external_products' 
                 AND column_name = 'rating') THEN
    ALTER TABLE external_products ADD COLUMN rating DECIMAL(2, 1);
  END IF;
  
  -- review_count カラムの追加
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'external_products' 
                 AND column_name = 'review_count') THEN
    ALTER TABLE external_products ADD COLUMN review_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- セール情報の自動計算トリガー（価格更新時）
CREATE OR REPLACE FUNCTION calculate_sale_info()
RETURNS TRIGGER AS $$
BEGIN
  -- original_priceが設定されていて、現在価格より高い場合
  IF NEW.original_price IS NOT NULL AND NEW.original_price > NEW.price THEN
    NEW.is_sale := TRUE;
    NEW.discount_percentage := ROUND(((NEW.original_price - NEW.price) / NEW.original_price * 100)::numeric);
  ELSE
    NEW.is_sale := FALSE;
    NEW.discount_percentage := NULL;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーの作成（存在しない場合のみ）
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_sale_info') THEN
    CREATE TRIGGER update_sale_info
    BEFORE INSERT OR UPDATE ON external_products
    FOR EACH ROW
    EXECUTE FUNCTION calculate_sale_info();
  END IF;
END $$;
