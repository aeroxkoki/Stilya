# 日次データバッチ処理の状況レポート

## 📅 日次バッチ処理の設定状況

### GitHub Actions設定
- **ファイル**: `.github/workflows/sync-products.yml`
- **スケジュール**: 
  - JST 午前3時（UTC 18:00）
  - JST 午後3時（UTC 6:00）
- **手動実行**: 可能（workflow_dispatch）

### 実行内容
1. **楽天APIからの商品データ取得**
2. **Supabaseへのデータ同期**
3. **古いデータの無効化**（1週間以上前のデータ）
4. **実行レポートの生成**

## ⚠️ 重要な注意事項

### GitHub Secretsの設定が必要
以下のSecretsがGitHubリポジトリに設定されていない場合、ワークフローは失敗します：

```
- SUPABASE_URL
- SUPABASE_SERVICE_KEY
- RAKUTEN_APP_ID  
- RAKUTEN_AFFILIATE_ID
```

### 設定方法
1. GitHubリポジトリの Settings → Secrets and variables → Actions
2. 「New repository secret」をクリック
3. 以下の値を設定：

```bash
SUPABASE_URL=https://ddypgpljprljqrblpuli.supabase.co
SUPABASE_SERVICE_KEY=（Supabaseダッシュボードから取得）
RAKUTEN_APP_ID=1070253780037975195
RAKUTEN_AFFILIATE_ID=3ad7bc23.8866b306.3ad7bc24.393c3977
```

## 🔍 現在の同期状況

### データ状況
- **総商品数**: 540件
- **ソース**: すべて楽天API
- **最終同期**: 確認が必要

### エラーの可能性
1. **GitHub Secrets未設定**
   - ワークフローが環境変数を取得できず失敗
   
2. **楽天APIレート制限**
   - 1日の呼び出し回数制限に達した場合
   
3. **Supabase RLSポリシー**
   - service_roleキーがない場合、書き込み権限エラー

## 🛠️ トラブルシューティング

### 手動でのデータ同期確認
```bash
# ローカルで楽天APIからデータ同期
cd /Users/koki_air/Documents/GitHub/Stilya
node scripts/sync-rakuten-products.js
```

### GitHub Actionsの実行状況確認
1. https://github.com/aeroxkoki/Stilya/actions
2. 「Sync Products from Rakuten」ワークフローを確認
3. 失敗している場合はログを確認

### エラーログの確認方法
```bash
# 最新のワークフロー実行結果を確認
# GitHubのActionsタブで確認するのが最も確実
```

## 📊 推奨事項

1. **GitHub Secretsの設定確認**
   - 特にSUPABASE_SERVICE_KEYが重要

2. **ワークフロー実行履歴の確認**
   - 過去の実行が成功しているか確認

3. **手動実行でのテスト**
   - GitHub Actions画面から「Run workflow」で手動実行

4. **モニタリングの強化**
   - 失敗時のSlack通知などの設定を検討
