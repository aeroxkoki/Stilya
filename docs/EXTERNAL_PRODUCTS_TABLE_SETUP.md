# Stilya - External Products Table Setup Guide

## 問題の概要

現在、`external_products`テーブルがSupabaseに存在していないため、商品同期（`npm run sync-products`）が失敗しています。

## 解決方法

### 方法1: Supabase ダッシュボードで直接SQLを実行（推奨）

1. Supabase ダッシュボードにアクセス:
   ```
   https://supabase.com/dashboard/project/ddypgpljprljqrblpuli/sql/new
   ```

2. 以下のSQLをコピーして実行:

```sql
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
```

3. 実行後、「Run」ボタンをクリック

### 方法2: 最小限の構成でテーブルを作成

RLSポリシーなしの最小限のテーブルを作成する場合:

```sql
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
```

## テーブル作成後の確認

1. テーブルが正しく作成されたか確認:
   ```bash
   cd /Users/koki_air/Documents/GitHub/Stilya
   node scripts/test-existing-tables.js
   ```

2. 商品同期を実行:
   ```bash
   npm run sync-products
   ```

## トラブルシューティング

### エラー: "relation "public.external_products" does not exist"

このエラーは、テーブルがまだ作成されていないことを示しています。上記の手順でテーブルを作成してください。

### エラー: 空のエラーオブジェクト {}

Supabase SDK v2では、エラーが空のオブジェクトとして返される場合があります。これは通常、テーブルが存在しないか、RLSポリシーによってアクセスが拒否されていることを示します。

## GitHub Actions用の自動化

GitHub Actionsで自動的にテーブルを作成するには、以下のステップが必要です：

1. Supabaseプロジェクトの管理者権限を持つデータベース接続文字列
2. マイグレーションツール（例：Supabase CLI）の設定
3. CI/CD パイプラインでのマイグレーション実行

現在のMVPフェーズでは、手動でのテーブル作成を推奨します。

## 完了チェックリスト

- [ ] Supabase ダッシュボードにアクセス
- [ ] SQLを実行してテーブルを作成
- [ ] `node scripts/test-existing-tables.js`でテーブルの存在を確認
- [ ] `npm run sync-products`で商品同期を実行
- [ ] 商品データがSupabaseに保存されたことを確認
