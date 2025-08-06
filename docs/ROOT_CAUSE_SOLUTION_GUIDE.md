# 根本的解決策実施ガイド

## 概要
このドキュメントでは、スワイプ画面とおすすめ画面のデータソースを統一し、Supabaseに実際の商品データを投入する手順を説明します。

## 前提条件
- Supabaseプロジェクトが作成済み
- 楽天APIのアカウントが作成済み
- Node.js 18以上がインストール済み

## ステップ1: Supabaseサービスキーの取得

1. [Supabase Dashboard](https://app.supabase.com)にログイン
2. プロジェクトを選択
3. Settings → API に移動
4. 以下をコピー：
   - `URL`: プロジェクトURL
   - `service_role key`: サービスロールキー（秘密！）

## ステップ2: 環境変数の設定

`.env`ファイルに以下を設定：

```bash
# 既存の設定に追加
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

**重要**: `SUPABASE_SERVICE_KEY`は秘密情報です。Gitにコミットしないでください。

## ステップ3: RLSポリシーの設定

Supabase SQL Editorで以下を実行：

```sql
-- scripts/setup-rls-policies.sql の内容を実行
```

または、ターミナルから：

```bash
# Supabase CLIがインストールされている場合
supabase db push --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres" < scripts/setup-rls-policies.sql
```

## ステップ4: 商品データの同期

### 初回同期（手動）

```bash
# プロジェクトルートで実行
cd /Users/koki_air/Documents/GitHub/Stilya
npm run sync-products
```

### 定期同期の設定

GitHub Actionsが設定済みです（`.github/workflows/sync-products.yml`）。
毎日午前3時（JST）に自動実行されます。

### 手動でテスト同期

```bash
# 少量のデータでテスト
node scripts/sync-products.js
```

## ステップ5: アプリケーションコードの修正

### 5.1 モックデータの無効化

`src/services/mockDataService.ts`を修正：

```typescript
// 本番環境ではモックデータを使用しない
export const USE_MOCK_DATA = process.env.NODE_ENV === 'development' && false;
```

### 5.2 データソースの統一

以下のファイルは自動的に修正されます。

## ステップ6: 動作確認

1. **Supabaseダッシュボードで確認**
   - Table Editor → external_products
   - データが投入されているか確認

2. **アプリで確認**
   ```bash
   npm start
   ```
   - スワイプ画面で商品が表示されるか
   - おすすめ画面で商品が表示されるか

## トラブルシューティング

### エラー: RLSポリシー違反
```
Error: new row violates row-level security policy
```

**解決策**:
1. サービスキーが正しく設定されているか確認
2. RLSポリシーが正しく設定されているか確認

### エラー: 楽天APIレート制限
```
Error: 429 Too Many Requests
```

**解決策**:
- スクリプトは自動的にリトライします
- 手動実行の場合は10秒待ってから再実行

### エラー: 商品が表示されない

**確認事項**:
1. Supabaseの`external_products`テーブルにデータがあるか
2. `is_active = true`の商品があるか
3. アプリの環境変数が正しく設定されているか

## セキュリティ注意事項

1. **サービスキーの取り扱い**
   - 本番環境では環境変数で管理
   - クライアントサイドコードには含めない
   - GitHub Secretsに登録

2. **RLSポリシー**
   - ユーザーは読み取りのみ可能
   - 書き込みはサービスロールのみ

## 次のステップ

1. **パフォーマンス最適化**
   - 画像のキャッシュ
   - ページネーション

2. **推薦アルゴリズムの改善**
   - ユーザーの好みをより正確に学習
   - 関連商品の提案精度向上

3. **監視とログ**
   - 同期ジョブの成功/失敗を監視
   - エラーログの収集
