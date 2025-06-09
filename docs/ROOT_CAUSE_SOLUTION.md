# Stilya - 根本的問題解決ガイド

## 🚨 現在の問題

1. **external_productsテーブルにデータがない**
   - RLSポリシーが原因でデータを挿入できない
   - スワイプ画面に商品が表示されない

2. **データソースの不統一**
   - スワイプ画面とおすすめ画面で異なるデータソースを使用している可能性

3. **楽天APIとの同期が未実装**
   - 本番用の商品データ取得機能が未完成

## ✅ 解決手順

### ステップ1: Supabaseダッシュボードでデータを挿入

1. Supabaseダッシュボード（https://app.supabase.com）にログイン
2. 該当プロジェクトを選択
3. 左メニューから「SQL Editor」を選択
4. 以下の手順でSQLを実行：

```bash
# SQLファイルを確認（既に生成済み）
cat scripts/insert-products.sql
```

5. 生成されたSQLをコピーしてSQL Editorで実行
   - まず「ALTER TABLE external_products DISABLE ROW LEVEL SECURITY;」を実行
   - その後、INSERT文を実行
   - 最後に確認用のSELECT文を実行

### ステップ2: アプリの再起動

```bash
# アプリを停止
# Ctrl+C でExpoを停止

# キャッシュをクリア
npx expo start -c
```

### ステップ3: データソースの確認

現在の実装では、以下の構成になっています：

- **SwipeScreen** → `useProducts` → `fetchProducts` → `fetchProductsFromSupabase` → **external_products**テーブル
- **RecommendScreen** → 同じデータソースを使用

データソースは既に統一されています。

## 🔧 今後の改善点

### 1. RLSポリシーの適切な設定

```sql
-- 読み取り専用ポリシーの作成（本番環境用）
CREATE POLICY "Allow public read access" ON external_products
  FOR SELECT
  TO public
  USING (is_active = true);

-- サービスロールでの書き込みポリシー
CREATE POLICY "Allow service role write access" ON external_products
  FOR ALL
  TO service_role
  USING (true);
```

### 2. 楽天API同期スクリプトの実装

`scripts/sync-rakuten-products.js`を作成して定期実行：

```javascript
// 楽天APIから商品を取得してexternal_productsに保存
const syncRakutenProducts = async () => {
  // 楽天APIから商品取得
  // external_productsテーブルに保存
};
```

### 3. GitHub Actionsでの自動同期

`.github/workflows/sync-products.yml`を作成：

```yaml
name: Sync Products
on:
  schedule:
    - cron: '0 0 * * *' # 毎日実行
jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: node scripts/sync-rakuten-products.js
        env:
          SUPABASE_SERVICE_KEY: ${{ secrets.SUPABASE_SERVICE_KEY }}
```

## 📊 現在のステータス

- [x] external_productsテーブルの作成
- [x] サンプルデータの準備
- [ ] RLSポリシーの無効化とデータ挿入（手動実行が必要）
- [x] データソースの統一（既に完了）
- [ ] 楽天API同期の実装
- [ ] 自動同期の設定

## 🚀 次のアクション

1. **即座に実行すべきこと**
   - Supabaseダッシュボードで`scripts/insert-products.sql`を実行
   - アプリを再起動して動作確認

2. **今週中に実装すべきこと**
   - 楽天API同期スクリプトの作成
   - 適切なRLSポリシーの設計と実装

3. **将来的な改善**
   - GitHub Actionsでの自動同期
   - 商品データのキャッシュ戦略
   - パフォーマンス最適化

## 📝 注意事項

- RLSを無効化する場合は、必ず開発環境でのみ行う
- 本番環境では適切なRLSポリシーを設定する
- サービスロールキーは環境変数で管理し、GitHubに含めない

## 🆘 トラブルシューティング

### 問題: SQLエラーが発生する
- テーブル構造を確認: `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'external_products';`
- 必要に応じてカラムを追加

### 問題: 商品が表示されない
- デバッグモードを有効化: `.env`で`EXPO_PUBLIC_DEBUG_MODE=true`
- コンソールログを確認
- Supabaseのログを確認

### 問題: 認証エラー
- Supabaseの認証設定を確認
- anonキーが正しいか確認
- RLSポリシーを一時的に無効化して確認
