# GitHub Actions設定ガイド - 日次商品同期

このガイドでは、GitHub Actionsで日次商品同期を正しく動作させるための設定手順を説明します。

## 🔑 必要なGitHub Secrets

以下の5つのSecretsをGitHubリポジトリに設定する必要があります：

| Secret名 | 説明 | 取得方法 |
|----------|------|----------|
| `SUPABASE_URL` | SupabaseプロジェクトのURL | Supabaseダッシュボード → Settings → API |
| `SUPABASE_SERVICE_KEY` | Service roleキー（重要） | Supabaseダッシュボード → Settings → API → service_role |
| `SUPABASE_ANON_KEY` | 匿名キー（バックアップ用） | Supabaseダッシュボード → Settings → API → anon |
| `RAKUTEN_APP_ID` | 楽天アプリケーションID | 楽天ウェブサービス → アプリ情報 |
| `RAKUTEN_AFFILIATE_ID` | 楽天アフィリエイトID | 楽天アフィリエイト → 基本情報 |

## 📝 設定手順

### 1. Supabase情報の取得

1. [Supabaseダッシュボード](https://supabase.com/dashboard/project/ddypgpljprljqrblpuli)にアクセス
2. 左メニューから「Settings」→「API」を選択
3. 以下の値をコピー：
   - **Project URL**: `https://ddypgpljprljqrblpuli.supabase.co`
   - **service_role key**: `eyJ...` で始まる長い文字列（重要：これが必須）
   - **anon public key**: `eyJ...` で始まる文字列

### 2. 楽天API情報

以下の値を使用：
- **Application ID**: `1070253780037975195`
- **Affiliate ID**: `3ad7bc23.8866b306.3ad7bc24.393c3977`

### 3. GitHub Secretsの設定

1. GitHubリポジトリ（https://github.com/aeroxkoki/Stilya）にアクセス
2. **Settings** タブをクリック
3. 左メニューから **Secrets and variables** → **Actions** を選択
4. **New repository secret** をクリック
5. 以下の順番で設定：

#### SUPABASE_URL
```
Name: SUPABASE_URL
Secret: https://ddypgpljprljqrblpuli.supabase.co
```

#### SUPABASE_SERVICE_KEY（最重要）
```
Name: SUPABASE_SERVICE_KEY
Secret: [Supabaseダッシュボードから取得したservice_role key]
```

#### SUPABASE_ANON_KEY
```
Name: SUPABASE_ANON_KEY
Secret: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRkeXBncGxqcHJsanFyYmxwdWxpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcxMDMwOTcsImV4cCI6MjA2MjY3OTA5N30.u4310NL9FYdxcMSrGxEzEXP0M5y5pDuG3_mz7IRAhMU
```

#### RAKUTEN_APP_ID
```
Name: RAKUTEN_APP_ID
Secret: 1070253780037975195
```

#### RAKUTEN_AFFILIATE_ID
```
Name: RAKUTEN_AFFILIATE_ID
Secret: 3ad7bc23.8866b306.3ad7bc24.393c3977
```

## 🧪 動作テスト

### 手動実行でテスト

1. GitHubリポジトリの **Actions** タブを開く
2. 左側から「Sync Products from Rakuten」を選択
3. 右側の「Run workflow」ボタンをクリック
4. 「Run workflow」を再度クリックして実行

### 確認ポイント

✅ 正常に動作する場合：
- 「✅ Service Roleキーを使用してRLSをバイパス」と表示される
- 商品データが正常に保存される
- 最後に「✨ すべての処理が完了しました」と表示される

❌ エラーの場合：
- 「Invalid API key」→ SUPABASE_SERVICE_KEYが正しく設定されていない
- 「row-level security policy」→ service roleキーではなくanon keyを使用している
- 「429 Too Many Requests」→ 楽天APIのレート制限（自動リトライされます）

## 🚨 トラブルシューティング

### 1. Service Roleキーの確認方法

Supabaseダッシュボードで：
1. Settings → API
2. 「service_role」セクションを確認
3. 「Reveal」をクリックしてキーを表示
4. このキーは**書き込み権限**があるため重要

### 2. RLSポリシーエラーが続く場合

Supabaseダッシュボードで以下のSQLを実行：
```sql
-- external_productsテーブルのRLSポリシーを確認
SELECT * FROM pg_policies WHERE tablename = 'external_products';

-- 必要に応じて書き込みポリシーを追加
CREATE POLICY "Allow service role to insert" ON external_products
FOR INSERT TO service_role WITH CHECK (true);

CREATE POLICY "Allow service role to update" ON external_products
FOR UPDATE TO service_role USING (true) WITH CHECK (true);
```

### 3. ワークフローの実行履歴確認

1. Actions → Sync Products from Rakuten
2. 実行履歴をクリック
3. 各ステップのログを確認

## 📅 日次実行スケジュール

現在の設定：
- **JST 午前3時**（UTC 18:00）
- **JST 午後3時**（UTC 6:00）

変更したい場合は `.github/workflows/sync-products.yml` の cron 設定を編集します。

## ⚡ 即座に手動実行

開発中やテスト時は、GitHub Actionsページから「Run workflow」で即座に実行できます。

---

**重要**: SUPABASE_SERVICE_KEYは必須です。これがないと、RLSポリシーにより商品データの書き込みができません。
