-- 外部API（楽天等）から取得した商品を保存するテーブル
CREATE TABLE IF NOT EXISTS external_products (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  price INTEGER NOT NULL,
  brand TEXT,
  image_url TEXT,
  description TEXT,
  tags TEXT[],
  category TEXT,
  genre_id INTEGER,
  affiliate_url TEXT,
  source TEXT DEFAULT 'rakuten',
  is_active BOOLEAN DEFAULT true,
  last_synced TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX idx_external_products_category ON external_products(category);
CREATE INDEX idx_external_products_source ON external_products(source);
CREATE INDEX idx_external_products_is_active ON external_products(is_active);
CREATE INDEX idx_external_products_tags ON external_products USING GIN(tags);
CREATE INDEX idx_external_products_genre_id ON external_products(genre_id);

-- 更新日時の自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_external_products_updated_at
  BEFORE UPDATE ON external_products
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- RLSポリシー
ALTER TABLE external_products ENABLE ROW LEVEL SECURITY;

-- 読み取りは全ユーザーに許可
CREATE POLICY "Allow read access to all users" ON external_products
  FOR SELECT
  TO authenticated
  USING (is_active = true);

-- 書き込みはサービスロール（バッチ処理）のみ
CREATE POLICY "Allow insert/update for service role only" ON external_products
  FOR ALL
  TO service_role
  USING (true);
