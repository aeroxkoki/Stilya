# 楽天API商品同期システム

## 概要

楽天APIのレート制限問題を根本的に解決するため、Supabaseを活用した商品マスタシステムを実装しました。

### システム構成

1. **商品マスタテーブル（external_products）**
   - 楽天APIから取得した商品データを保存
   - アプリはこのテーブルから商品を取得（楽天APIを直接呼ばない）

2. **バッチ処理（scripts/sync-products.js）**
   - 定期的に楽天APIから商品を取得
   - Supabaseのexternal_productsテーブルに保存
   - レート制限を考慮した安全な実装

3. **自動実行（GitHub Actions）**
   - 毎日午前3時（JST）に自動実行
   - 手動実行も可能

## セットアップ手順

### 1. 環境変数の設定

`.env`ファイルに以下の環境変数を設定：

```bash
# Supabase（既存の設定に追加）
SUPABASE_URL=your_supabase_url  # EXPO_PUBLIC_SUPABASE_URLと同じ値
SUPABASE_SERVICE_KEY=your_supabase_service_key  # Supabaseダッシュボードから取得

# 楽天API（実際の値に置き換える）
RAKUTEN_APP_ID=your_actual_rakuten_app_id
RAKUTEN_AFFILIATE_ID=your_actual_rakuten_affiliate_id
```

**重要**: 
- `SUPABASE_SERVICE_KEY`はSupabaseダッシュボードの「Settings > API > Service Role」から取得
- 楽天APIのキーは[楽天ウェブサービス](https://webservice.rakuten.co.jp/)で取得

### 2. データベースのセットアップ

既に`external_products`テーブルは作成済みですが、確認のため：

```bash
# Supabaseダッシュボードで以下のSQLを実行
# supabase/migrations/003_create_external_products_table.sql の内容を実行
```

### 3. GitHub Secretsの設定

GitHub Actionsで使用するため、以下のSecretsを設定：

1. リポジトリの Settings > Secrets and variables > Actions
2. 以下のSecretsを追加：
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_KEY`
   - `RAKUTEN_APP_ID`
   - `RAKUTEN_AFFILIATE_ID`

## 使用方法

### 手動で商品同期を実行

```bash
npm run sync-products
```

### GitHub Actionsで手動実行

1. Actions タブを開く
2. "Sync Rakuten Products" ワークフローを選択
3. "Run workflow" ボタンをクリック

### 自動実行

毎日午前3時（JST）に自動的に実行されます。

## 動作確認

### 1. Supabaseで商品データを確認

```sql
-- 商品数を確認
SELECT COUNT(*) FROM external_products WHERE is_active = true;

-- 最新の商品を確認
SELECT * FROM external_products 
WHERE is_active = true 
ORDER BY last_synced DESC 
LIMIT 10;
```

### 2. アプリで動作確認

アプリを起動して、商品が正しく表示されることを確認：

```bash
npm start
```

## トラブルシューティング

### 商品が表示されない場合

1. バッチ処理が正常に実行されたか確認
2. Supabaseに商品データが保存されているか確認
3. アプリのログを確認

### レート制限エラーが発生する場合

- バッチ処理の実行間隔を調整
- 取得するページ数を減らす

## メンテナンス

### 古いデータの管理

7日以上更新されていない商品は自動的に非アクティブ化されます。

### バッチ処理の調整

`scripts/sync-products.js`で以下を調整可能：

- `CATEGORIES`: 取得するカテゴリ
- `maxPages`: 各カテゴリの最大ページ数
- `RATE_LIMIT_DELAY`: API呼び出し間隔

## 今後の改善案

1. **商品数の増加**
   - より多くのカテゴリを追加
   - 検索キーワードによる商品取得

2. **パフォーマンス最適化**
   - 差分更新の実装
   - 並列処理の最適化

3. **監視機能**
   - 同期状況のダッシュボード
   - エラー通知の強化
