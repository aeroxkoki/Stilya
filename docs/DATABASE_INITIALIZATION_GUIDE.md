# Stilya データベース初期化ガイド

## 問題の概要

現在、アプリで以下のエラーが発生しています：
- `relation "public.users" does not exist` - ユーザープロファイルテーブルが存在しない
- `Invalid login credentials` - 認証情報の問題

これは、Supabaseプロジェクトに必要なデータベーステーブルが作成されていないことが原因です。

## 解決手順

### 1. Supabaseダッシュボードにアクセス

1. [Supabase Dashboard](https://supabase.com/dashboard) にログイン
2. Stilyaプロジェクトを選択

### 2. SQL Editorでスキーマを作成

1. 左側メニューから「SQL Editor」を選択
2. 「New query」をクリック
3. `/scripts/create-schema.sql` の内容をコピー＆ペースト
4. 「Run」ボタンをクリックして実行

### 3. 初期商品データの投入

1. SQL Editorで新しいクエリを作成
2. `/scripts/initial-products.sql` の内容をコピー＆ペースト
3. 「Run」ボタンをクリックして実行

### 4. テスト用ユーザーの作成

Supabaseダッシュボードから：

1. 「Authentication」→「Users」→「Create new user」
2. 以下のテストアカウントを作成：

```
開発用アカウント1（男性向け）:
- Email: test.male@stilya.dev
- Password: TestUser2025!
- Auto Confirm User: ✅

開発用アカウント2（女性向け）:
- Email: test.female@stilya.dev  
- Password: TestUser2025!
- Auto Confirm User: ✅
```

### 5. アプリの再起動

```bash
# Expoの再起動
npm run clear-cache
```

## 確認事項

### データベースの確認

SQL Editorで以下のクエリを実行して、テーブルが正しく作成されたか確認：

```sql
-- テーブル一覧の確認
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 商品数の確認
SELECT COUNT(*) FROM products;

-- RLSの確認
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### 期待される結果

- `users`, `products`, `swipes`, `favorites`, `click_logs` テーブルが存在
- 商品数: 30件
- すべてのテーブルでRLSが有効（rowsecurity = true）

## トラブルシューティング

### エラー: "permission denied for schema public"

権限の問題です。Supabaseダッシュボードの「Database」→「Roles」で権限を確認してください。

### エラー: "duplicate key value violates unique constraint"

すでにテーブルが存在している可能性があります。既存のテーブルを削除してから再実行するか、`CREATE TABLE IF NOT EXISTS`を使用してください。

### 認証エラーが続く場合

1. `.env`ファイルの確認：
   ```
   EXPO_PUBLIC_SUPABASE_URL=your-project-url
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

2. Supabaseプロジェクトの設定確認：
   - Authentication → Settings → Email Auth が有効か
   - API Settings → Project URL と Anon Key が正しいか

## 次のステップ

データベースの初期化が完了したら：

1. アプリでテストアカウントを使用してログイン
2. スワイプ機能の動作確認
3. 商品データの表示確認
4. お気に入り機能の動作確認

問題が解決しない場合は、エラーログを確認して追加のサポートを求めてください。
