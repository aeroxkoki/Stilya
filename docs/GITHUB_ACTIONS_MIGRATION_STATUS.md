# GitHub Actions移行状況

## 現在の状態
- **開発段階**: 開発ビルドでの実機テスト中
- **Managed Workflow**: 維持済み
- **EAS Build**: 設定済み（development, preview, production）
- **GitHub Actions**: ワークフロー設定済み

## 完了した項目 ✅

### 1. 環境変数の統一
- すべての環境変数を`EXPO_PUBLIC_*`プレフィックスに統一
- `.env`ファイルと`app.config.js`の整合性確保
- GitHub Secretsとの互換性確保

### 2. データ型の一貫性
- `dbProductToProduct`と`productToDBProduct`関数の完全実装
- snake_case（DB）とcamelCase（アプリ）の変換を一元化
- すべてのフィールドマッピングを網羅

### 3. ビルド設定
- **EAS Build**: 3つのプロファイル（development, preview, production）
- **GitHub Actions**: 自動ビルドワークフロー設定済み
- **環境変数**: CI/CD環境での適切な設定

## GitHub Secretsの設定（必須）

以下のシークレットをGitHubリポジトリに設定してください：

```
EXPO_TOKEN                     # EAS認証用
SUPABASE_URL                   # https://ddypgpljprljqrblpuli.supabase.co
SUPABASE_ANON_KEY             # Supabase匿名キー
RAKUTEN_APP_ID                # 楽天アプリケーションID
RAKUTEN_AFFILIATE_ID          # 楽天アフィリエイトID
```

## 移行手順

### 1. GitHub Secretsの設定
1. GitHubリポジトリの Settings → Secrets and variables → Actions
2. 上記の必須シークレットを追加
3. 値は`.env`ファイルから取得（EXPO_PUBLIC_プレフィックスを除く）

### 2. 初回ビルドのテスト
```bash
# 手動でワークフローをトリガー
# GitHub Actions → Run workflow → 選択:
# - Platform: all
# - Profile: preview
```

### 3. 自動ビルドの有効化
- `develop`ブランチへのpush → previewビルド
- `main`ブランチへのpush → productionビルド

## ビルドコマンド

### ローカル開発（現在使用中）
```bash
# 開発ビルド
npm run ios
npm run android

# EASビルド（ローカルからトリガー）
npm run eas-build-development
npm run eas-build-preview
npm run eas-build-production
```

### GitHub Actions（移行後）
- 自動: ブランチへのpush時
- 手動: GitHub UIからワークフロー実行

## 注意事項

1. **Managed Workflowの維持**
   - カスタムネイティブコードは追加しない
   - Expo SDKの範囲内で開発を継続

2. **環境変数の管理**
   - ローカル: `.env`ファイル
   - CI/CD: GitHub Secrets
   - ビルド時: EAS Build環境変数

3. **ビルドプロファイル**
   - development: 内部テスト用（simulator対応）
   - preview: ベータテスト用（実機配布）
   - production: ストア提出用

## 推奨される次のステップ

1. GitHub Secretsを設定
2. previewプロファイルでテストビルド実行
3. ビルド成功を確認
4. 自動ビルドワークフローを有効化

## トラブルシューティング

### ビルドエラーが発生した場合
1. GitHub Actionsのログを確認
2. 環境変数が正しく設定されているか確認
3. `eas.json`の設定を再確認
4. Expo SDKのバージョン互換性を確認

### 環境変数が読み込まれない場合
1. GitHub Secretsの名前を確認（大文字小文字を含む）
2. ワークフロー内の環境変数マッピングを確認
3. EAS Build環境での変数展開を確認

---

最終更新: 2025年8月5日
