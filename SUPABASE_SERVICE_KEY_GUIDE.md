# 🎯 Stilya MVP - Supabaseサービスキー設定ガイド

## ⚠️ 現在の問題

楽天APIから商品データの取得は成功していますが、Supabaseのexternal_productsテーブルへの保存時にRLS（Row Level Security）ポリシーによってブロックされています。

```
❌ 挿入エラー: {
  code: '42501',
  message: 'new row violates row-level security policy for table "external_products"'
}
```

## 🔧 解決方法

### 方法1: Supabaseサービスキーの設定（推奨）

1. **Supabaseダッシュボードにログイン**
   - https://supabase.com/dashboard にアクセス
   - プロジェクトを選択

2. **サービスキーの取得**
   - Settings → API
   - `service_role` キーをコピー（`anon` キーではなく）
   - このキーはRLSをバイパスできます

3. **.envファイルに追加**
   ```bash
   # 既存の設定の下に追加
   SUPABASE_SERVICE_KEY=your_service_role_key_here
   ```

4. **商品同期スクリプトの実行**
   ```bash
   npm run sync-products:improved
   ```

### 方法2: RLSポリシーの修正

Supabaseダッシュボードで以下のSQLを実行：

```sql
-- RLSポリシーを一時的に無効化
ALTER TABLE external_products DISABLE ROW LEVEL SECURITY;

-- または、より安全な方法として、挿入を許可するポリシーを追加
ALTER TABLE external_products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable insert for anon users" 
ON external_products FOR INSERT 
WITH CHECK (true);
```

### 方法3: 手動で商品データを挿入

`scripts/initial-products.sql`ファイルが既に作成されているので、Supabaseダッシュボードで実行：

1. Supabaseダッシュボード → SQL Editor
2. `scripts/initial-products.sql`の内容をコピー＆ペースト
3. 実行

## 📊 現在の状況

- ✅ 楽天API認証：成功
- ✅ 商品データ取得：90件取得済み
- ❌ Supabase保存：RLSポリシーによりブロック中
- ✅ external_productsテーブル：存在（0件）

## 🚀 即座のアクション

最も簡単な解決方法は、**方法2のRLSポリシーを一時的に無効化**することです：

```bash
# Supabaseダッシュボードで実行
ALTER TABLE external_products DISABLE ROW LEVEL SECURITY;
```

その後、再度商品同期スクリプトを実行：

```bash
cd /Users/koki_air/Documents/GitHub/Stilya
node scripts/sync-rakuten-products.js
```

## 🔒 セキュリティに関する注意

- RLSを無効化した場合は、商品同期後に再度有効化することを推奨
- 本番環境ではサービスキーを使用した方が安全です
- サービスキーは絶対にクライアントサイドのコードに含めないでください

## 📝 参考情報

- Supabase RLSドキュメント: https://supabase.com/docs/guides/auth/row-level-security
- 楽天API: 正常動作中（レート制限に注意）
- 商品同期頻度: 1日1回程度を推奨
