# Stilya データベース再初期化ガイド

## エラーの解決方法

「policy already exists」エラーは、データベースオブジェクトが部分的に作成されている状態で発生します。

### 対処法1: 更新されたスクリプトを実行（推奨）

更新された`create-schema.sql`は、既存のオブジェクトを自動的に削除してから再作成するようになりました。

1. **SQL Editorで新しいクエリを作成**
2. **更新されたcreate-schema.sqlを実行**
   - GitHubから最新版を取得するか、ローカルファイルを使用
   - 全体をコピー＆ペーストして実行

### 対処法2: 手動でクリーンアップ（必要な場合のみ）

もし上記でもエラーが続く場合は、以下のクリーンアップスクリプトを実行：

```sql
-- すべてのポリシーを削除
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT schemaname, tablename, policyname 
        FROM pg_policies 
        WHERE schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            pol.policyname, pol.schemaname, pol.tablename);
    END LOOP;
END $$;

-- すべてのトリガーを削除
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
DROP TRIGGER IF EXISTS update_products_updated_at ON public.products;
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- すべての関数を削除
DROP FUNCTION IF EXISTS update_updated_at_column();
DROP FUNCTION IF EXISTS public.handle_new_user();

-- テーブルをリセット（注意：データも削除されます）
DROP TABLE IF EXISTS public.click_logs CASCADE;
DROP TABLE IF EXISTS public.favorites CASCADE;
DROP TABLE IF EXISTS public.swipes CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;
```

その後、`create-schema.sql`を再実行してください。

### 実行後の確認

以下のクエリで正しくセットアップされたか確認：

```sql
-- テーブル確認
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- ポリシー確認
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- RLS状態確認
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

期待される結果：
- 5つのテーブル（users, products, swipes, favorites, click_logs）
- 各テーブルに適切なポリシー
- すべてのテーブルでRLSが有効

## よくあるエラーと対処法

### "relation does not exist"
テーブルがまだ作成されていません。`create-schema.sql`の実行を確認してください。

### "permission denied"
権限の問題です。Supabaseダッシュボードで正しいプロジェクトに接続していることを確認してください。

### "duplicate key value"
データがすでに存在します。`initial-products.sql`を2回実行した可能性があります。
