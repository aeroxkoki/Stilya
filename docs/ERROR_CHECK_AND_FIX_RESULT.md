# Stilya - エラー確認と修正結果

## 検証日時
2025年6月9日

## 発見された問題

### 1. IDカラムの問題
- **テーブル定義**: `id TEXT PRIMARY KEY`（デフォルト値なし）
- **元のSQL**: IDを指定していない → エラー発生
- **修正**: IDを明示的に指定（`sample_1_timestamp`形式）

### 2. RLSポリシーの問題
```sql
-- 元のポリシー（問題あり）
CREATE POLICY "Allow read access to all users" ON external_products
  FOR SELECT
  TO authenticated  -- anonユーザーがアクセスできない！
  USING (is_active = true);

-- 修正後のポリシー
CREATE POLICY "Allow public read access" ON external_products
  FOR SELECT
  TO public  -- 全ユーザーがアクセス可能
  USING (is_active = true);
```

### 3. テーブル名の確認
- ✅ 全て`external_products`で統一されている
- ✅ `products`テーブルへの参照は互換性のためのみ（メインではない）

## 修正ファイル

### 新規作成
- `scripts/generate-insert-sql-fixed.js` - 修正版SQL生成スクリプト
- `scripts/insert-products-fixed.sql` - 修正版商品挿入SQL

### 主な修正内容
1. **ID生成ロジック追加**
   ```javascript
   const id = `sample_${index + 1}_${Date.now()}`;
   ```

2. **RLSポリシー修正SQL追加**
   ```sql
   DROP POLICY IF EXISTS "Allow read access to all users" ON external_products;
   CREATE POLICY "Allow public read access" ON external_products
     FOR SELECT TO public USING (is_active = true);
   ```

3. **完全なRLS管理フロー**
   - 無効化 → ポリシー修正 → データ挿入 → 再有効化

## 実行手順

1. **Supabaseダッシュボードにログイン**
   - https://app.supabase.com

2. **SQL Editorで実行**
   ```bash
   # ローカルで確認
   cat scripts/insert-products-fixed.sql
   ```
   - 生成されたSQLを順番に実行

3. **アプリ再起動**
   ```bash
   npx expo start -c
   ```

## テスト方法

### SQLでの確認
```sql
-- データ数の確認
SELECT COUNT(*) FROM external_products;

-- データ内容の確認
SELECT id, title, price, brand FROM external_products LIMIT 5;

-- RLSポリシーの確認
SELECT * FROM pg_policies WHERE tablename = 'external_products';
```

### アプリでの確認
1. スワイプ画面で商品が表示されることを確認
2. おすすめ画面でも同じ商品が表示されることを確認
3. コンソールにエラーが出ていないことを確認

## トラブルシューティング

### 問題: まだRLSエラーが出る場合
```sql
-- 一時的にRLSを完全に無効化
ALTER TABLE external_products DISABLE ROW LEVEL SECURITY;
```

### 問題: IDの重複エラー
```sql
-- 既存データを削除してから再挿入
DELETE FROM external_products WHERE source = 'sample_data';
```

### 問題: カラムが存在しないエラー
```sql
-- テーブル構造の確認
\d external_products
```

## 結論

- テーブル名は正しく`external_products`で統一されている
- IDとRLSポリシーの問題を修正済み
- 修正版SQLファイル（`insert-products-fixed.sql`）を使用すること
